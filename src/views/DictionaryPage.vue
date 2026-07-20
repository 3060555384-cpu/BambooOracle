<template>
  <div class="dict-page">
    <div class="page-header">
      <h1>甲骨字典</h1>
      <p>溯源文字，问道殷商</p>
      <hr class="ink-divider" />
      <div class="search-bar">
        <span class="search-icon">&#128269;</span>
        <input v-model="search" type="text" placeholder="搜索甲骨文字..." class="search-input" />
        <span v-if="search" class="search-clear" @click="search = ''">&times;</span>
      </div>
      <p class="search-result-hint" v-if="search">找到 {{ filteredChars.length }} 个结果</p>
      <div class="filter-bar">
        <button v-for="cat in categories" :key="cat" class="filter-tag" :class="{ active: selectedCat === cat }" @click="selectedCat = cat">{{ cat }}</button>
      </div>
    </div>
    <div class="dict-grid">
      <div v-for="char in filteredChars" :key="char.char" class="dict-card" @click="selected = char">
        <div class="dict-char">{{ char.char }}</div>
        <div class="dict-meaning">{{ char.meaning }}</div>
        <div class="dict-category">{{ char.category }}</div>
      </div>
    </div>
    <div v-if="filteredChars.length === 0 && search" class="empty-state">
      <p>未找到包含"{{ search }}"的甲骨文字</p>
    </div>
    <Teleport to="body">
      <div v-if="selected" class="detail-overlay" @click.self="selected = null" @keydown.esc="selected = null">
        <div class="detail-card">
          <button class="detail-close" @click="selected = null">&times;</button>
          <div class="detail-char">{{ selected.char }}</div>
          <div class="detail-stamp">甲骨文</div>
          <h2 class="detail-title">{{ selected.meaning }}</h2>
          <hr class="ink-divider" />
          <div class="detail-meta"><span class="meta-item"><strong>字型类别</strong> {{ selected.category }}</span></div>
          <p class="detail-desc">{{ selected.desc }}</p>
          <button class="btn-outline" @click="selected = null">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const search = ref('')
const selected = ref<null | typeof chars[0]>(null)
const selectedCat = ref('全部')
const categories = ['全部', '象形字', '会意字', '指事字', '形声字']
const chars = [
  { char: '\u65E5', meaning: '日 / 太阳', category: '象形字', desc: '外圆象太阳之形，中一点象光。卜辞中用作白天、日期，亦作祭名。殷人记日以干支，十日为一旬。' },
  { char: '\u6708', meaning: '月 / 月亮', category: '象形字', desc: '象半月之形，缺而不满。卜辞中记月份、夜晚皆用此字。殷历以月相变化定朔望。' },
  { char: '\u4EBA', meaning: '人', category: '象形字', desc: '象人侧立垂臂之形，肢体完备而简洁。卜辞中大量出现，是最基础的象形字，也是众多汉字的构件。' },
  { char: '\u5927', meaning: '大', category: '象形字', desc: '象人正面站立、张开双臂之形，以大人之形表"大"义。引申为规模大、程度深。"太""天"皆从此出。' },
  { char: '\u5929', meaning: '天 / 天空', category: '会意字', desc: '从"大"从"一"，一人头顶之上即为天。卜辞中亦指上天、天帝，是殷人祭祀的重要对象。' },
  { char: '\u96E8', meaning: '雨', category: '象形字', desc: '上象云层，下象雨滴下落之形。商代以农为本，卜辞中频繁出现"其雨""不雨""大雨""小雨"等。' },
  { char: '\u5C71', meaning: '山', category: '象形字', desc: '三峰并立，中高旁低，象山脉连绵起伏之形。卜辞中多用作地名及山神祭祀。' },
  { char: '\u6C34', meaning: '水', category: '象形字', desc: '中间曲线象主流水流，两旁散点象水花飞溅。卜辞中用作河流名称及水患记录。' },
  { char: '\u706B', meaning: '火', category: '象形字', desc: '象火焰上腾之形，下宽上尖。卜辞中用作火灾、火星（大火星）等义。' },
  { char: '\u6728', meaning: '木 / 树', category: '象形字', desc: '上象枝桠，中象树干，下象根须，一株完整的树。卜辞中用作树木、木材及木星（岁星）。' },
  { char: '\u738B', meaning: '王 / 首领', category: '象形字', desc: '象斧钺之形，斧钺是王权的象征。卜辞中称商王为"王"，是最常见的称谓之一。' },
  { char: '\u5B50', meaning: '子', category: '象形字', desc: '象婴儿之形，大头、双臂、身体包裹。卜辞中用作子女义，亦为地支之首（子丑寅卯）。' },
  { char: '\u9F8D', meaning: '龙', category: '象形字', desc: '象龙之形，有角冠、巨口、长身卷尾。传说中能兴云雨的神兽，殷人信仰中的重要神灵。' },
  { char: '\u98A8', meaning: '风', category: '形声字', desc: '从虫凡声。卜辞中四方风各有专名，殷人对季风已有系统认识。' },
  { char: '\u4E0A', meaning: '上', category: '指事字', desc: '以一长横为基准，上方短横指示"上"的位置。与"下"相对，是中国最古老的指事字之一。' },
  { char: '\u4E0B', meaning: '下', category: '指事字', desc: '以一长横为基准，下方短横指示"下"的位置。简洁而明确的构字方式。' },
  { char: '\u571F', meaning: '土 / 土地', category: '象形字', desc: '象地上土块之形，一横为地面。卜辞中用作土地、社神等，是先民生息的根本。' },
  { char: '\u5973', meaning: '女', category: '象形字', desc: '象女子跪坐交手之形。卜辞中用作女性、配偶等义，是重要的性别标识字。' },
  { char: '\u4E2D', meaning: '中 / 中央', category: '指事字', desc: '一竖贯穿圆圈中部，表示正中。卜辞中用作中间、中等义，亦为族名和地名。' },
  { char: '\u98DF', meaning: '食 / 食物', category: '会意字', desc: '上为口，下为盛食物的器皿。卜辞中用作食物、食用、日食月食等义。' },
]
const filteredChars = computed(() => {
  let result = chars
  if (selectedCat.value !== '全部') result = result.filter(c => c.category === selectedCat.value)
  if (search.value) {
    const q = search.value
    result = result.filter(c => c.meaning.includes(q) || c.char === q || c.category.includes(q))
  }
  return result
})
</script>

<style scoped>
.dict-page{max-width:1000px;margin:0 auto;padding:0 20px 60px}
.search-bar{max-width:420px;margin:0 auto;position:relative}
.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:.95rem;color:var(--ink-wash);pointer-events:none}
.search-input{width:100%;padding:12px 40px 12px 44px;border:1px solid var(--paper-dark);border-radius:50px;font-size:.95rem;outline:none;background:#fff;box-sizing:border-box;font-family:inherit;transition:border-color .3s}
.search-input:focus{border-color:var(--gold)}
.search-clear{position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--ink-wash);font-size:1.1rem;padding:2px 6px}
.search-clear:hover{color:var(--cinnabar)}
.search-result-hint{text-align:center;color:var(--ink-wash);font-size:.85rem;margin-top:12px}
.filter-bar{display:flex;justify-content:center;gap:8px;margin-top:20px;flex-wrap:wrap}
.filter-tag{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.82rem;padding:6px 18px;cursor:pointer;font-family:inherit;letter-spacing:1px;transition:all .3s}
.filter-tag:hover{border-color:var(--gold);color:var(--gold)}
.filter-tag.active{background:var(--ink);color:var(--paper-light);border-color:var(--ink)}
.dict-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-top:24px}
.dict-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:22px 14px 18px;text-align:center;cursor:pointer;box-shadow:var(--shadow);transition:all .3s ease}
.dict-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.dict-char{font-family:'KaiTi','STKaiti',serif;font-size:46px;color:var(--ink);line-height:1.2;margin-bottom:8px;transition:color .3s}
.dict-card:hover .dict-char{color:var(--gold)}
.dict-meaning{font-size:.85rem;color:var(--ink-light);letter-spacing:1px;margin-bottom:4px}
.dict-category{font-size:.7rem;color:var(--ink-wash)}
.empty-state{text-align:center;padding:60px 20px;color:var(--ink-wash)}
.detail-overlay{position:fixed;inset:0;background:rgba(26,26,26,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px}
.detail-card{background:#fff;border-radius:var(--radius-lg);padding:40px 36px 32px;text-align:center;max-width:440px;width:100%;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.detail-close{position:absolute;top:16px;right:20px;background:none;border:none;font-size:1.5rem;color:var(--ink-wash);cursor:pointer;padding:4px 8px;line-height:1}
.detail-close:hover{color:var(--cinnabar)}
.detail-char{font-family:'KaiTi','STKaiti',serif;font-size:88px;color:var(--ink);line-height:1;margin-bottom:8px}
.detail-stamp{display:inline-block;font-size:12px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 12px;font-family:'KaiTi','STKaiti',serif;letter-spacing:3px;margin-bottom:12px}
.detail-title{font-family:'KaiTi','STKaiti',serif;font-size:1.4rem;color:var(--ink);letter-spacing:3px;margin-bottom:8px}
.detail-meta{margin-bottom:16px}
.meta-item{font-size:.85rem;color:var(--ink-wash)}
.meta-item strong{color:var(--ink);margin-right:6px}
.detail-desc{font-size:.9rem;color:var(--ink);line-height:1.9;text-align:left;margin-bottom:24px}
@media(max-width:500px){.dict-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}.detail-card{padding:28px 20px 24px}}
</style>
