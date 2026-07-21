<template>
  <div class="ency-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>甲骨百科</h1>
      <p>探源殷商，问道甲骨</p>
      <hr class="ink-divider" />
    </div>

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
              <span class="fact-text">遗址总面穏约36平方公里，包含宫殿、王陵、青铜器作坊、居民区等多个功能区</span>
            </div>
          </div>
          <p class="yinxu-note">殷墟的发掘不仅出土了数以万计的甲骨文，还包含青铜器、玉器、骇骨制品等大量珍贵文物，为研究商代社会结构、宗教信仰、科技水平提供了丰富的实物资料。如今，殷墟博物馆已建成开放，是全球甲骨学研究的重要基地。</p>
        </div>
      </div>
    </section>

    <!-- Footer quote -->
    <section class="quote-section">
      <blockquote class="ink-quote">
        <p>“甲骨文的发现，不仅是考古学上的一件大事，而且为语言文字学的研究提供了极为宝贵的资料。”</p>
        <cite>&mdash; 郭沐若</cite>
      </blockquote>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface SectionState {
  overview: boolean
  liushu: boolean
  scholars: boolean
  yinxu: boolean
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

const sections = reactive<SectionState>({
  overview: true,
  liushu: false,
  scholars: false,
  yinxu: false
})

function toggle(key: keyof SectionState): void {
  sections[key] = !sections[key]
}


const liushuCategories: LiushuItem[] = [
  {
    seal: '象',
    name: '象形',
    definition: '描画事物形象的造字法，“画成其物，随体该觥”。如日、月、山、水、人、鸟等。',
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
    definition: '合并两个或多个字的意义而成新义，“比类合谊，以见指挥”。如休、从、明、林等。',
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
    name: '郭沐若',
    years: '1892—1978',
    contribution: '“甲骨四堂”之一，字鼎堂。编著《卜辞通纂》、《甲骨文合集》等巨著，对甲骨文释读和商史研究贡献巨大。'
  },
  {
    name: '董作宾',
    years: '1895—1963',
    contribution: '“甲骨四堂”之一，字彦堂。首创甲骨文断代研究，将殷墟甲骨分为五个时期，建立了甲骨文断代学。'
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

/* === Footer Quote === */
.quote-section{padding:40px 0 20px}
.ink-quote{max-width:680px;margin:0 auto;text-align:center;padding:32px 40px;border-left:3px solid var(--gold-pale);border-right:3px solid var(--gold-pale);background:linear-gradient(90deg,transparent,rgba(184,134,11,.03),transparent)}
.ink-quote p{font-family:'KaiTi','STKaiti',serif;font-size:1rem;color:var(--ink);line-height:2.2;letter-spacing:1px;margin-bottom:16px}
.ink-quote cite{font-size:.85rem;color:var(--ink-wash);font-style:normal;letter-spacing:2px}

@media(max-width:768px){
  .overview-highlights{grid-template-columns:repeat(2,1fr);gap:12px}
  .liushu-grid{grid-template-columns:repeat(2,1fr)}
  .scholars-grid{grid-template-columns:repeat(2,1fr)}
  .yinxu-facts{grid-template-columns:1fr}
  .overview-card,.yinxu-card{padding:24px 20px}
  .section-header{padding:14px 18px}
  .section-header h2{font-size:1.05rem;letter-spacing:2px}
  .ink-quote{padding:24px 20px}
}
@media(max-width:480px){
  .overview-highlights{grid-template-columns:1fr}
  .liushu-grid{grid-template-columns:1fr}
  .scholars-grid{grid-template-columns:1fr}
}
</style>
