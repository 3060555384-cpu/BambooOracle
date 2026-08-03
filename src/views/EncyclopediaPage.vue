<template>
  <div class="ency-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>甲骨百科</h1>
      <p>探源殷商，问道甲骨</p>
      <hr class="ink-divider" />
    </div>

    <!-- DeepSeek AI 问答（固定展示，不可折叠） -->
    <section class="ai-section">
      <div class="ai-section-header">
        <span class="ai-section-icon">&#x1F916;</span>
        <h2>AI 智能问答</h2>
      </div>
      <div class="ai-chat-box">
        <!-- 对话区 -->
        <div class="ai-messages" ref="msgContainer">
          <div v-if="chatMessages.length === 0" class="ai-welcome">
            <p>竹下问甲，知无不言。甲骨之事，尽管来问。</p>
          </div>
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            class="ai-msg"
            :class="msg.role"
          >
            <span class="ai-msg-label">{{ msg.role === 'user' ? '你' : 'AI' }}</span>
            <div class="ai-msg-text">{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="ai-msg assistant typing">
            <span class="ai-msg-label">AI</span>
            <div class="ai-msg-text">
              <span class="typing-dots"><i></i><i></i><i></i></span>
            </div>
          </div>
        </div>
        <!-- 输入区 -->
        <div class="ai-input-row">
          <input
            v-model="inputQuestion"
            class="ai-input"
            placeholder="输入你想了解的甲骨文问题..."
            maxlength="200"
            @keydown.enter.prevent="askAI"
            :disabled="loading"
          />
          <button
            class="ai-send-btn"
            :disabled="loading || !inputQuestion.trim()"
            @click="askAI"
          >发送</button>
        </div>
        <!-- 快捷提问 -->
        <div class="ai-quick-asks">
          <button
            v-for="q in quickQuestions"
            :key="q"
            class="ai-quick-btn"
            :disabled="loading"
            @click="inputQuestion = q; askAI()"
          >{{ q }}</button>
        </div>
        <!-- 清空对话 -->
        <button v-if="chatMessages.length > 0" class="ai-clear-btn" @click="chatMessages = []">清空对话</button>
      </div>
    </section>

    <!-- Section 1: 甲骨文概述 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('overview')">
        <span class="section-icon">&#x1F4DC;</span>
        <h2>甲骨文概述</h2>
        <span class="section-arrow" :class="{ open: sections.overview }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.overview">
        <div class="overview-card">
          <p class="overview-intro">甲骨文，又称“契文”“甲骨卜辞”或“殷墟文字”，是中国现存最古老的成熟文字体系，因镑刻于龟甲与兽骨上而得名。它是商朝晚期（约公元前14世纪至前11世纪）王室用于占卜记事的文字，也是汉字的直接源头，被誉为“汉字之祖”。</p>
          <div class="overview-highlights">
            <div class="highlight-item">
              <span class="highlight-num">1899</span>
              <span class="highlight-label">发现年份</span>
              <p class="highlight-desc">清末金石学家王懿荣在北京药铺首次识别出甲骨文，揭开了研究序幕。</p>
            </div>
            <div class="highlight-item">
              <span class="highlight-num">15万+</span>
              <span class="highlight-label">出土甲骨数量</span>
              <p class="highlight-desc">自首次发现以来，已有超过十五万片甲骨出土，分藏于世界各地博物馆。</p>
            </div>
            <div class="highlight-item">
              <span class="highlight-num">4500+</span>
              <span class="highlight-label">已识单字</span>
              <p class="highlight-desc">其中约有一千五百个字已被学者释读，另有近三千字待考释。</p>
            </div>
            <div class="highlight-item">
              <span class="highlight-num">殷墟</span>
              <span class="highlight-label">出土地点</span>
              <p class="highlight-desc">主要出土于河南安阳小屯村，即商代晚期都城——殷墟。</p>
            </div>
          </div>
          <p class="overview-significance">甲骨文不仅是研究商代历史的第一手资料，更是中华文明的重要证物。它证实了《史记·殷本纪》中所载商王世系的可靠性，将中国信史向前推进了数百年。</p>
        </div>
      </div>
    </section>

    <!-- Section 2: 六书分类 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('liushu')">
        <span class="section-icon">&#x1F4D6;</span>
        <h2>六书分类</h2>
        <span class="section-arrow" :class="{ open: sections.liushu }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.liushu">
        <p class="section-desc">“六书”是东汉许慎在《说文解字》中总结的汉字造字和用字的六种规律，是理解甲骨文字形结构的基础理论。</p>
        <div class="liushu-grid">
          <div v-for="item in liushuCategories" :key="item.name" class="liushu-card">
            <div class="liushu-seal-wrap">
              <div class="liushu-seal">{{ item.seal }}</div>
            </div>
            <h3 class="liushu-name">{{ item.name }}</h3>
            <p class="liushu-def">{{ item.definition }}</p>
            <p class="liushu-example">{{ item.example }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: 著名甲骨学者 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('scholars')">
        <span class="section-icon">&#x1F4DA;</span>
        <h2>著名甲骨学者</h2>
        <span class="section-arrow" :class="{ open: sections.scholars }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.scholars">
        <div class="scholars-grid">
          <div v-for="s in scholars" :key="s.name" class="scholar-card">
            <div class="scholar-seal">&#x7532;</div>
            <h3 class="scholar-name">{{ s.name }}</h3>
            <span class="scholar-years">{{ s.years }}</span>
            <p class="scholar-contribution">{{ s.contribution }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: 殷墟遗址 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('yinxu')">
        <span class="section-icon">&#x1F3DB;</span>
        <h2>殷墟遗址</h2>
        <span class="section-arrow" :class="{ open: sections.yinxu }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.yinxu">
        <div class="yinxu-card">
          <p class="yinxu-intro">殷墟位于今河南省安阳市洹河两岸，是中国商代晚期的都城遗址，也是世界上所有甲骨文的出土地。这里曾是商王朝的政治、经济、文化和军事中心，经历了从盘庚迁都至商纣灭亡近三百年的辉煌岁月。</p>
          <div class="yinxu-facts">
            <div class="fact-item">
              <span class="fact-icon">&#x1F4CD;</span>
              <span class="fact-text">河南省安阳市殷都区</span>
            </div>
            <div class="fact-item">
              <span class="fact-icon">&#x1F3C5;</span>
              <span class="fact-text">2006年列入联合国教科文组织世界文化遗产名录</span>
            </div>
            <div class="fact-item">
              <span class="fact-icon">&#x1F4DC;</span>
              <span class="fact-text">被誉为“中国考古学的摇篮”，是20世纪中国100项重大考古发现之首</span>
            </div>
            <div class="fact-item">
              <span class="fact-icon">&#x1F3DB;</span>
              <span class="fact-text">遗址总面积约36平方公里，包含宫殿、王陵、青铜器作坊、居民区等多个功能区</span>
            </div>
          </div>
          <p class="yinxu-note">殷墟的发掘不仅出土了数以万计的甲骨文，还包含青铜器、玉器、骨骼制品等大量珍贵文物，为研究商代社会结构、宗教信仰、科技水平提供了丰富的实物资料。如今，殷墟博物馆已建成开放，是全球甲骨学研究的重要基地。</p>
        </div>
      </div>
    </section>

    <!-- Section 5: 著名甲骨片 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('artifacts')">
        <span class="section-icon">&#x1F3FA;</span>
        <h2>著名甲骨片</h2>
        <span class="section-arrow" :class="{ open: sections.artifacts }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.artifacts">
        <div class="artifacts-grid">
          <div v-for="a in artifacts" :key="a.name" class="artifact-card">
            <div class="artifact-header">
              <span class="artifact-num">{{ a.code }}</span>
              <h3 class="artifact-name">{{ a.name }}</h3>
            </div>
            <div class="artifact-tags">
              <span class="artifact-tag">{{ a.era }}</span>
              <span class="artifact-tag">{{ a.type }}</span>
            </div>
            <p class="artifact-desc">{{ a.desc }}</p>
            <p class="artifact-significance">{{ a.significance }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 6: 甲骨学研究大事年表 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('timeline')">
        <span class="section-icon">&#x1F4C5;</span>
        <h2>研究大事年表</h2>
        <span class="section-arrow" :class="{ open: sections.timeline }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.timeline">
        <div class="timeline-vertical">
          <div class="timeline-line-v"></div>
          <div v-for="(evt, i) in obTimeline" :key="i" class="timeline-event" :class="{ left: i % 2 === 0, right: i % 2 === 1 }">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <span class="timeline-year">{{ evt.year }}</span>
              <p class="timeline-text">{{ evt.event }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: 学术资源 -->
    <section class="ency-section">
      <div class="section-header" @click="toggle('resources')">
        <span class="section-icon">&#x1F517;</span>
        <h2>学术资源</h2>
        <span class="section-arrow" :class="{ open: sections.resources }">&#x25BC;</span>
      </div>
      <div class="section-body" v-show="sections.resources">
        <div class="resources-grid">
          <a v-for="r in resources" :key="r.name" :href="r.url" target="_blank" rel="noopener" class="resource-card">
            <div class="resource-badge">{{ r.badge }}</div>
            <h3 class="resource-name">{{ r.name }}</h3>
            <p class="resource-desc">{{ r.desc }}</p>
            <span class="resource-link">访问资源 &rarr;</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer quote -->
    <section class="quote-section">
      <blockquote class="ink-quote">
        <p>"甲骨文的发现，不仅是考古学上的一件大事，而且为语言文字学的研究提供了极为宝贵的资料。"</p>
        <cite>&mdash; 郭沫若</cite>
      </blockquote>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'

interface SectionState {
  overview: boolean
  liushu: boolean
  scholars: boolean
  yinxu: boolean
  artifacts: boolean
  timeline: boolean
  resources: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface LiushuItem {
  seal: string
  name: string
  definition: string
  example: string
}

interface Scholar {
  name: string
  years: string
  contribution: string
}

interface Artifact {
  code: string
  name: string
  era: string
  type: string
  desc: string
  significance: string
}

interface TimelineEvent {
  year: string
  event: string
}

interface Resource {
  name: string
  url: string
  badge: string
  desc: string
}

const sections = reactive<SectionState>({
  overview: false,
  liushu: false,
  scholars: false,
  yinxu: false,
  artifacts: false,
  timeline: false,
  resources: false
})

function toggle(key: keyof SectionState): void {
  sections[key] = !sections[key]
}

// --- AI 问答逻辑 ---
const chatMessages = ref<ChatMessage[]>([])
const inputQuestion = ref('')
const loading = ref(false)
const msgContainer = ref<HTMLElement | null>(null)

const quickQuestions = [
  '甲骨文是怎样被发现的？',
  '什么是「六书」造字法？',
  '商代人用什么工具刻写甲骨？',
  '什么是「甲骨四堂」？'
]

async function askAI() {
  const q = inputQuestion.value.trim()
  if (!q || loading.value) return
  chatMessages.value.push({ role: 'user', content: q })
  inputQuestion.value = ''
  loading.value = true
  await nextTick()
  scrollToBottom()

  try {
    const history = chatMessages.value
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }))

    const res = await fetch('/api/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, history })
    })

    const data = await res.json()
    if (data.reply) {
      chatMessages.value.push({ role: 'assistant', content: data.reply })
    } else {
      chatMessages.value.push({ role: 'assistant', content: data.error || '出错了，请稍后重试。' })
    }
  } catch (err: any) {
    chatMessages.value.push({ role: 'assistant', content: `网络错误：${err.message || '请检查网络连接'}` })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  const el = msgContainer.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}


const liushuCategories: LiushuItem[] = [
  {
    seal: '象',
    name: '象形',
    definition: '描画事物形象的造字法，“画成其物，随体诘诎”。如日、月、山、水、人、鸟等。',
    example: '例：日、月、山、水、牛、羊'
  },
  {
    seal: '指',
    name: '指事',
    definition: '用抽象符号指示意义，“视而可识，察而见意”。如上、下、本、末等。',
    example: '例：上、下、一、二、三、本'
  },
  {
    seal: '会',
    name: '会意',
    definition: '合并两个或多个字的意义而成新义，“比类合谊，以见指撝”。如休、从、明、林等。',
    example: '例：武、信、休、从、明、林'
  },
  {
    seal: '形',
    name: '形声',
    definition: '由形旁和声旁组成，“以事为名，取譬相成”。是汉字中数量最多的类型。',
    example: '例：河、江、海、松、柏'
  },
  {
    seal: '转',
    name: '转注',
    definition: '意义相关的字互相解释，“建类一首，同意相受”。老、考即转注关系。',
    example: '例：老—考、顶—顔'
  },
  {
    seal: '假',
    name: '假借',
    definition: '借用同音字来表示新义，“本无其字，依声託事”。“来”本义麦穂，假借为“往来”之“来”。',
    example: '例：来、令、长、万'
  }
]

const scholars: Scholar[] = [
  {
    name: '王懿荣',
    years: '1845—1900',
    contribution: '甲骨文的发现者。清光绪二十五年（1899年），王懿荣在北京达仁堂药铺所购的“龙骨”上首次识别出古老文字，从而揭开了甲骨学研究的序幕。'
  },
  {
    name: '刘鹗',
    years: '1857—1909',
    contribution: '字铁云。编著中国第一部甲骨文著录《铁云藏龟》，为甲骨学的创立奠定了基础。其所藏甲骨现分藏于多地博物馆。'
  },
  {
    name: '罗振玉',
    years: '1866—1940',
    contribution: '字叔蕴，号雪堂。甲骨学奠基人之一，考定甲骨出土于安阳小屯村（殷墟），编著《殷墟书契考释》等重要著作。'
  },
  {
    name: '王国维',
    years: '1877—1927',
    contribution: '字静安，号观堂。“甲骨四堂”之一。以甲骨文考证史实，开创“二重证据法”，将甲骨学从文字学推向史学。'
  },
  {
    name: '郭沫若',
    years: '1892—1978',
    contribution: '“甲骨四堂”之一，字鼎堂。编著《卜辞通纂》、《甲骨文合集》等巨著，对甲骨文释读和商史研究贡献巨大。'
  },
  {
    name: '董作宾',
    years: '1895—1963',
    contribution: '"甲骨四堂"之一，字彦堂。首创甲骨文断代研究，将殷墟甲骨分为五个时期，建立了甲骨文断代学。'
  }
]

const artifacts: Artifact[] = [
  {
    code: 'YH127',
    name: 'YH127 坑甲骨',
    era: '商代武丁时期',
    type: '窖藏甲骨',
    desc: '1936 年殷墟第十三次发掘中发现，一坑出土甲骨 17,096 片，其中完整龟甲近 300 版。此坑甲骨数量之大、内容之丰富，为历次发掘之最。',
    significance: '被称为"甲骨文的档案库"，极大推动了商代世系、历法、祭祀制度的研究。'
  },
  {
    code: 'H3',
    name: '花园庄东地 H3 坑',
    era: '商代晚期',
    type: '非王卜辞',
    desc: '1991 年发现于安阳花园庄东地，出土甲骨 1,583 片，其中刻辞甲骨 579 片。内容主要为"子"族卜辞，非商王占卜记录。',
    significance: '首次大规模发现"非王卜辞"，揭示了商代贵族家族的占卜活动，拓展了甲骨学研究范围。'
  },
  {
    code: '合集',
    name: '《甲骨文合集》',
    era: '1978—1982 年出版',
    type: '文献辑录',
    desc: '郭沫若主编、胡厚宣总编辑，共 13 册，收录甲骨 41,956 片，是迄今为止最权威的甲骨文资料总集。',
    significance: '甲骨学研究的里程碑式著作，为学者提供了最为系统全面的甲骨文图像资料。'
  },
  {
    code: '屯南',
    name: '小屯南地甲骨',
    era: '商代武丁至文丁',
    type: '科学发掘',
    desc: '1973 年出土于安阳小屯南地，共 5,335 片。为中华人民共和国成立后出土数量最多的一批科学发掘甲骨。',
    significance: '有明确的地层关系和共存器物，为甲骨文分期断代提供了科学依据。'
  },
  {
    code: '妇好',
    name: '妇好墓相关甲骨',
    era: '商代武丁时期',
    type: '王室卜辞',
    desc: '与妇好（商王武丁配偶）相关的甲骨占卜记录，涉及妇好征伐、祭祀、生育、疾病等内容。',
    significance: '配合 1976 年妇好墓的发掘，证明了甲骨文中妇好记载的可信性，实现了考古与文献的互证。'
  }
]

const obTimeline: TimelineEvent[] = [
  { year: '约前14世纪', event: '商王盘庚迁都于殷（今安阳），甲骨占卜之风盛行' },
  { year: '1899 年', event: '王懿荣首次识别甲骨文，揭开甲骨学序幕' },
  { year: '1903 年', event: '刘鹗《铁云藏龟》出版，为第一部甲骨文著录' },
  { year: '1917 年', event: '王国维发表《殷卜辞中所见先公先王考》，以甲骨证史' },
  { year: '1928 年', event: '中央研究院史语所开始在安阳殷墟进行科学发掘' },
  { year: '1936 年', event: 'YH127 坑大量甲骨出土，一次获 17,096 片' },
  { year: '1953 年', event: '郭沫若《卜辞通纂》定稿出版' },
  { year: '1973 年', event: '小屯南地甲骨出土，共 5,335 片' },
  { year: '1978—1982 年', event: '《甲骨文合集》全 13 册陆续出版，收录 41,956 片' },
  { year: '2006 年', event: '殷墟列入联合国教科文组织世界文化遗产名录' },
  { year: '2019 年', event: '"殷契文渊"甲骨文大数据平台正式上线' },
  { year: '2024 年', event: '华科发布 HUST-OBC 数据集（14 万张图像），AI 辅助甲骨文研究进入新纪元' }
]

const resources: Resource[] = [
  {
    name: 'HUST-OBC 甲骨文数据集',
    url: 'https://github.com/Pengjie-W/HUST-OBC',
    badge: '数据集',
    desc: '华中科技大学发布的甲骨文识别与破译数据集，含 140,053 张图像及预训练模型，分类准确率 94.6%。'
  },
  {
    name: 'Open-Oracle 论文索引',
    url: 'https://github.com/Yuliang-Liu/Open-Oracle',
    badge: '论文',
    desc: '甲骨文 AI 研究资源总目录，收录百余篇甲骨文识别、破译、检索相关论文及开源代码。'
  },
  {
    name: '殷契文渊',
    url: 'https://tanyuan.qq.com/plan/oracle',
    badge: '平台',
    desc: '全球最大甲骨文多模态数据集，含一万片甲骨拓片/摹本及单字标注，支持在线检索与 AI 识别。'
  },
  {
    name: 'OBSD 甲骨文破译模型',
    url: 'https://github.com/guanhaisu/OBSD',
    badge: '开源',
    desc: 'ACL 2024 最佳论文——基于扩散模型的甲骨文破译系统，由华科白翔团队研发。'
  }
]
</script>

<style scoped>
.ency-page{max-width:1000px;margin:0 auto;padding:0 20px 60px}

/* === Section Accordion === */
.ency-section{margin-bottom:24px}
.section-header{display:flex;align-items:center;gap:14px;padding:18px 24px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);cursor:pointer;box-shadow:var(--shadow);transition:all .3s ease;user-select:none}
.section-header:hover{border-color:var(--gold-pale);box-shadow:var(--shadow-md)}
.section-icon{font-size:1.4rem;flex-shrink:0}
.section-header h2{font-family:'KaiTi','STKaiti',serif;font-size:1.2rem;color:var(--ink);letter-spacing:3px;flex:1;margin:0}
.section-arrow{font-size:.75rem;color:var(--ink-wash);transition:transform .35s ease;flex-shrink:0}
.section-arrow.open{transform:rotate(180deg)}
.section-body{padding:28px 4px 0;animation:fadeIn .4s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.section-desc{color:var(--ink-wash);font-size:.95rem;text-align:center;margin-bottom:24px;letter-spacing:1px;line-height:1.8}

/* === 甲骨文概述 === */
.overview-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:36px 40px;box-shadow:var(--shadow)}
.overview-intro{color:var(--ink);font-size:1.02rem;line-height:2.2;text-indent:2em;margin-bottom:28px}
.overview-highlights{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:28px}
.highlight-item{text-align:center;padding:20px 12px;background:var(--paper-light);border-radius:var(--radius-md);transition:transform .3s ease,box-shadow .3s ease}
.highlight-item:hover{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.highlight-num{display:block;font-family:'KaiTi','STKaiti',serif;font-size:1.6rem;color:var(--gold);font-weight:bold;letter-spacing:1px;margin-bottom:6px}
.highlight-label{display:block;font-size:.8rem;color:var(--ink);letter-spacing:2px;margin-bottom:8px}
.highlight-desc{font-size:.78rem;color:var(--ink-wash);line-height:1.7}
.overview-significance{color:var(--ink-light);font-size:.95rem;line-height:2;text-indent:2em;border-left:3px solid var(--gold-pale);padding-left:16px}

/* === 六书分类 === */
.liushu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.liushu-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:32px 22px 24px;text-align:center;box-shadow:var(--shadow);transition:all .3s ease}
.liushu-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.liushu-seal-wrap{display:flex;justify-content:center;margin-bottom:16px}
.liushu-seal{width:50px;height:50px;display:flex;align-items:center;justify-content:center;border:2px solid var(--cinnabar-light);color:var(--cinnabar-light);font-family:'KaiTi','STKaiti',serif;font-size:24px;font-weight:bold;transform:rotate(-6deg);transition:transform .3s}
.liushu-card:hover .liushu-seal{transform:rotate(0deg)}
.liushu-name{font-family:'KaiTi','STKaiti',serif;font-size:1.15rem;color:var(--ink);letter-spacing:3px;margin-bottom:10px}
.liushu-def{font-size:.82rem;color:var(--ink-wash);line-height:1.8;margin-bottom:8px}
.liushu-example{font-size:.78rem;color:var(--gold);letter-spacing:2px}

/* === 著名甲骨学者 === */
.scholars-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.scholar-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:28px 20px 24px;text-align:center;box-shadow:var(--shadow);transition:all .3s ease}
.scholar-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.scholar-seal{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:2px solid var(--jade);color:var(--jade);font-family:'KaiTi','STKaiti',serif;font-size:20px;font-weight:bold;transform:rotate(-5deg);margin-bottom:14px;transition:transform .3s}
.scholar-card:hover .scholar-seal{transform:rotate(0deg)}
.scholar-name{font-family:'KaiTi','STKaiti',serif;font-size:1.1rem;color:var(--ink);letter-spacing:2px;margin-bottom:4px}
.scholar-years{display:block;font-size:.78rem;color:var(--gold);letter-spacing:1px;margin-bottom:10px}
.scholar-contribution{font-size:.82rem;color:var(--ink-wash);line-height:1.8}

/* === 殷墟遗址 === */
.yinxu-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:36px 40px;box-shadow:var(--shadow)}
.yinxu-intro{color:var(--ink);font-size:1rem;line-height:2.2;text-indent:2em;margin-bottom:24px}
.yinxu-facts{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:24px}
.fact-item{display:flex;align-items:flex-start;gap:12px;padding:16px 18px;background:var(--paper-light);border-radius:var(--radius-md);transition:all .3s ease}
.fact-item:hover{background:#fff;box-shadow:var(--shadow)}
.fact-icon{font-size:1.2rem;flex-shrink:0;padding-top:2px}
.fact-text{font-size:.88rem;color:var(--ink-light);line-height:1.7}
.yinxu-note{color:var(--ink-light);font-size:.92rem;line-height:2;text-indent:2em;border-left:3px solid var(--gold-pale);padding-left:16px}

/* === 著名甲骨片 === */
.artifacts-grid{display:flex;flex-direction:column;gap:16px}
.artifact-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:28px 32px;box-shadow:var(--shadow);transition:all .3s ease}
.artifact-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:var(--gold-pale)}
.artifact-header{display:flex;align-items:center;gap:16px;margin-bottom:12px}
.artifact-num{display:inline-flex;align-items:center;justify-content:center;min-width:64px;padding:4px 12px;background:var(--paper-light);border:2px solid var(--gold-pale);color:var(--gold);font-family:'KaiTi','STKaiti',serif;font-size:1.05rem;font-weight:bold;letter-spacing:2px}
.artifact-name{font-family:'KaiTi','STKaiti',serif;font-size:1.15rem;color:var(--ink);letter-spacing:3px;margin:0}
.artifact-tags{display:flex;gap:8px;margin-bottom:14px;padding-left:80px}
.artifact-tag{background:var(--paper);color:var(--ink-wash);font-size:.75rem;padding:3px 10px;border:1px solid var(--paper-dark);letter-spacing:1px}
.artifact-desc{color:var(--ink);font-size:.9rem;line-height:1.9;margin-bottom:10px;padding-left:80px}
.artifact-significance{color:var(--ink-light);font-size:.85rem;line-height:1.8;padding-left:80px;border-left:3px solid var(--cinnabar-light);padding-left:20px;margin-left:80px}

/* === 大事年表（纵向时间轴） === */
.timeline-vertical{position:relative;padding:16px 0}
.timeline-line-v{position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--gold-pale);transform:translateX(-50%)}
.timeline-event{position:relative;display:flex;align-items:flex-start;margin-bottom:28px}
.timeline-event.left{flex-direction:row;padding-right:52%}
.timeline-event.right{flex-direction:row-reverse;padding-left:52%}
.timeline-dot{position:absolute;left:50%;top:8px;width:12px;height:12px;background:var(--gold);border:2px solid #fff;border-radius:50%;transform:translateX(-50%);z-index:2;box-shadow:var(--shadow-sm);flex-shrink:0}
.timeline-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:16px 20px;box-shadow:var(--shadow);transition:all .3s ease;flex:1}
.timeline-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);border-color:var(--gold-pale)}
.timeline-year{display:block;font-family:'KaiTi','STKaiti',serif;font-size:1rem;color:var(--gold);font-weight:bold;letter-spacing:2px;margin-bottom:6px}
.timeline-text{font-size:.88rem;color:var(--ink);line-height:1.8}

/* === 学术资源 === */
.resources-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.resource-card{display:block;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-lg);padding:28px 24px 24px;box-shadow:var(--shadow);transition:all .3s ease;text-decoration:none;cursor:pointer}
.resource-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.resource-badge{display:inline-block;padding:3px 12px;background:var(--paper-light);border:1px solid var(--gold-pale);color:var(--gold);font-size:.75rem;letter-spacing:2px;margin-bottom:14px}
.resource-name{font-family:'KaiTi','STKaiti',serif;font-size:1.05rem;color:var(--ink);letter-spacing:2px;margin-bottom:10px}
.resource-desc{font-size:.85rem;color:var(--ink-wash);line-height:1.8;margin-bottom:14px}
.resource-link{font-size:.82rem;color:var(--cinnabar-light);letter-spacing:1px}

/* === Footer Quote === */
.quote-section{padding:40px 0 20px}
.ink-quote{max-width:680px;margin:0 auto;text-align:center;padding:32px 40px;border-left:3px solid var(--gold-pale);border-right:3px solid var(--gold-pale);background:linear-gradient(90deg,transparent,rgba(184,134,11,.03),transparent)}
.ink-quote p{font-family:'KaiTi','STKaiti',serif;font-size:1rem;color:var(--ink);line-height:2.2;letter-spacing:1px;margin-bottom:16px}
.ink-quote cite{font-size:.85rem;color:var(--ink-wash);font-style:normal;letter-spacing:2px}

/* === AI 智能问答（固定展示） === */
.ai-section{margin-bottom:24px}
.ai-section-header{display:flex;align-items:center;gap:14px;padding:18px 24px;background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md) var(--radius-md) 0 0;box-shadow:var(--shadow);user-select:none}
.ai-section-icon{font-size:1.4rem;flex-shrink:0}
.ai-section-header h2{font-family:'KaiTi','STKaiti',serif;font-size:1.2rem;color:var(--ink);letter-spacing:3px;flex:1;margin:0}
.ai-chat-box{background:#fff;border:1px solid var(--paper-dark);border-top:none;border-radius:0 0 var(--radius-lg) var(--radius-lg);box-shadow:var(--shadow);overflow:hidden}
.ai-messages{max-height:420px;overflow-y:auto;padding:24px 28px 12px;scroll-behavior:smooth}
.ai-messages::-webkit-scrollbar{width:6px}
.ai-messages::-webkit-scrollbar-thumb{background:var(--paper-dark);border-radius:3px}
.ai-welcome{text-align:center;padding:36px 0;color:var(--ink-wash);font-size:.95rem;letter-spacing:1px}
.ai-msg{margin-bottom:16px;animation:msgIn .3s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ai-msg-label{display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:2px;margin-bottom:4px;padding:2px 8px;border-radius:4px}
.ai-msg.user .ai-msg-label{color:var(--ink);background:var(--paper-light)}
.ai-msg.assistant .ai-msg-label{color:var(--gold-dark,#8b6914);background:rgba(184,134,11,.08)}
.ai-msg-text{font-size:.92rem;line-height:1.85;color:var(--ink);padding:12px 16px;border-radius:var(--radius-md)}
.ai-msg.user .ai-msg-text{background:var(--paper-light)}
.ai-msg.assistant .ai-msg-text{background:rgba(184,134,11,.04);border-left:3px solid var(--gold-pale)}

/* 打字动画 */
.typing-dots{display:inline-flex;align-items:center;gap:5px;padding:4px 0}
.typing-dots i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--gold);animation:dotBounce 1.4s infinite ease-in-out}
.typing-dots i:nth-child(2){animation-delay:.2s}
.typing-dots i:nth-child(3){animation-delay:.4s}
@keyframes dotBounce{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}

/* 输入区 */
.ai-input-row{display:flex;gap:10px;padding:16px 28px;border-top:1px solid var(--paper-dark);background:var(--paper-light)}
.ai-input{flex:1;padding:10px 16px;border:1px solid var(--paper-dark);border-radius:var(--radius-sm);font-size:.92rem;color:var(--ink);background:#fff;outline:none;transition:border-color .2s;font-family:inherit}
.ai-input:focus{border-color:var(--gold-pale)}
.ai-input::placeholder{color:#ccc}
.ai-send-btn{padding:10px 22px;background:var(--gold);color:#fff;border:none;border-radius:var(--radius-sm);font-size:.9rem;font-weight:600;letter-spacing:2px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
.ai-send-btn:hover:not(:disabled){background:var(--gold-dark,#8b6914)}
.ai-send-btn:disabled{background:#ccc;cursor:not-allowed}

/* 快捷提问 */
.ai-quick-asks{display:flex;flex-wrap:wrap;gap:10px;padding:4px 28px 16px}
.ai-quick-btn{padding:6px 16px;background:transparent;border:1px solid var(--gold-pale);border-radius:20px;color:var(--gold-dark,#8b6914);font-size:.82rem;letter-spacing:1px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit}
.ai-quick-btn:hover:not(:disabled){background:var(--gold-pale);color:#fff}
.ai-quick-btn:disabled{opacity:.5;cursor:not-allowed}

/* 清空按钮 */
.ai-clear-btn{display:block;margin:0 auto 16px;padding:6px 20px;background:transparent;border:none;color:var(--ink-wash);font-size:.8rem;cursor:pointer;letter-spacing:1px;transition:color .2s;font-family:inherit}
.ai-clear-btn:hover{color:var(--cinnabar-light,#c04040)}

@media(max-width:768px){
  .overview-highlights{grid-template-columns:repeat(2,1fr);gap:12px}
  .liushu-grid{grid-template-columns:repeat(2,1fr)}
  .scholars-grid{grid-template-columns:repeat(2,1fr)}
  .yinxu-facts{grid-template-columns:1fr}
  .overview-card,.yinxu-card{padding:24px 20px}
  .section-header{padding:14px 18px}
  .section-header h2{font-size:1.05rem;letter-spacing:2px}
  .ink-quote{padding:24px 20px}
  /* 大事年表移动端改为单列 */
  .timeline-line-v{left:20px}
  .timeline-dot{left:20px}
  .timeline-event.left,.timeline-event.right{flex-direction:row;padding-left:48px;padding-right:0}
  /* 甲骨片移动端简化缩进 */
  .artifact-tags,.artifact-desc{padding-left:0}
  .artifact-significance{margin-left:0;padding-left:16px}
  .artifact-header{flex-direction:column;align-items:flex-start;gap:8px}
  .resources-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .overview-highlights{grid-template-columns:1fr}
  .liushu-grid{grid-template-columns:1fr}
  .scholars-grid{grid-template-columns:1fr}
  .ai-messages{padding:16px 14px 8px;max-height:320px}
  .ai-input-row{padding:12px 14px}
  .ai-quick-asks{padding:4px 14px 12px}
  .ai-quick-btn{font-size:.76rem;padding:5px 12px}
}
</style>
