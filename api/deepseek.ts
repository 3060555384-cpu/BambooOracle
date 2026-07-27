import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' })
  }

  try {
    const { question, history = [] } = req.body || {}
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '请提供问题' })
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key 未配置，请在 Vercel 环境变量中添加 DEEPSEEK_API_KEY' })
    }

    const messages = [
      {
        role: 'system',
        content:
          '你是甲骨文研究专家，精通甲骨文字释读、商代历史、甲骨学知识、六书造字法及殷墟考古。请用中文回答，回答要专业但通俗易懂，适当引用学术来源（如《甲骨文合集》《说文解字》等）。每段回答控制在 300 字以内，简洁有深度。'
      },
      ...history,
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
      return res.status(upstream.status).json({ error: `DeepSeek 返回错误 ${upstream.status}` })
    }

    const data = await upstream.json()
    const reply = data.choices?.[0]?.message?.content || '抱歉，未能获取回答，请重试。'
    return res.status(200).json({ reply })
  } catch (err: any) {
    console.error('API 路由异常:', err)
    return res.status(500).json({ error: err.message || '服务器内部错误' })
  }
}
