import type { VercelRequest, VercelResponse } from '@vercel/node'

// 简易 IP 限流（同实例内有效，防止短时间刷量）
const RATE_WINDOW = 60_000   // 60 秒窗口
const RATE_MAX = 10           // 每窗口最多请求数
const rateMap = new Map<string, { count: number; reset: number }>()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}

// 定期清理过期条目，避免内存泄漏
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, v] of rateMap) {
      if (now > v.reset) rateMap.delete(ip)
    }
  }, 120_000)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' })
  }

  // 提取客户端 IP
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'

  if (!rateLimit(ip)) {
    return res.status(429).json({ error: '请求太频繁，请稍后再试' })
  }

  try {
    const { question, history = [] } = req.body || {}

    // 输入校验
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '请提供问题' })
    }
    if (question.length > 500) {
      return res.status(400).json({ error: '问题超过 500 字限制' })
    }
    if (!Array.isArray(history) || history.length > 20) {
      return res.status(400).json({ error: '历史记录异常' })
    }
    const validHistory = history.filter(
      (m: any) =>
        m && typeof m.role === 'string' &&
        typeof m.content === 'string' &&
        m.content.length <= 1000
    )

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key 未配置' })
    }

    const messages = [
      {
        role: 'system',
        content:
          '你是甲骨文研究专家，精通甲骨文字释读、商代历史、甲骨学知识、六书造字法及殷墟考古。请用中文回答，回答要专业但通俗易懂，适当引用学术来源。每段回答控制在 300 字以内。'
      },
      ...validHistory,
      { role: 'user', content: question }
    ]

    const upstream = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 1200
      })
    })

    if (!upstream.ok) {
      const errText = await upstream.text()
      console.error('DeepSeek API 错误:', upstream.status, errText)
      return res.status(upstream.status).json({ error: `AI 服务暂不可用` })
    }

    const data = await upstream.json()
    const reply = data.choices?.[0]?.message?.content || '抱歉，未能获取回答，请重试。'
    return res.status(200).json({ reply })
  } catch (err: any) {
    console.error('API 路由异常:', err)
    return res.status(500).json({ error: '服务器内部错误' })
  }
}
