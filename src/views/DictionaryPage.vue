<template>
  <div class="dict-page">
    <div class="page-header">
      <h1>&#128218; 甲骨字典</h1>
      <p>收录常用甲骨文字，支持搜索和浏览</p>
      <div class="search-bar">
        <input v-model="search" type="text" placeholder="输入文字搜索..." class="search-input" />
      </div>
    </div>

    <div class="dict-grid">
      <div v-for="char in filteredChars" :key="char.char" class="dict-card" @click="selected = char">
        <div class="dict-char">{{ char.char }}</div>
        <div class="dict-label">{{ char.meaning }}</div>
      </div>
    </div>

    <div v-if="selected" class="detail-modal" @click.self="selected = null">
      <div class="detail-card">
        <div class="detail-char">{{ selected.char }}</div>
        <h2>{{ selected.meaning }}</h2>
        <p><strong>字型类别：</strong>{{ selected.category }}</p>
        <p><strong>释义：</strong>{{ selected.desc }}</p>
        <button class="btn-close" @click="selected = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const selected = ref<null | typeof chars[0]>(null)

const chars = [
  { char: '\u65E5', meaning: '日/太阳', category: '象形字', desc: '外圆象太阳之形，中一点象光。卜辞中用作白天、日期，也作祭名。' },
  { char: '\u6708', meaning: '月/月亮', category: '象形字', desc: '象半月之形。卜辞中用作月份、夜晚。' },
  { char: '\u4EBA', meaning: '人', category: '象形字', desc: '象人侧立之形。卜辞中用作人类、人们。' },
  { char: '\u5927', meaning: '大', category: '象形字', desc: '象人正面站立张开双臂之形，表示大的意思。' },
  { char: '\u5929', meaning: '天/天空', category: '会意字', desc: '从大从一，一人头上为天。卜辞中也指上天、天帝。' },
  { char: '\u96E8', meaning: '雨', category: '象形字', desc: '上象云，下象雨滴下落。卜辞中常见"其雨""不雨"等。' },
  { char: '\u5C71', meaning: '山', category: '象形字', desc: '象山峰起伏之形。卜辞中用作地名和山神。' },
  { char: '\u6C34', meaning: '水', category: '象形字', desc: '象水流之形，中间曲线为主流，两旁点为水花。' },
  { char: '\u706B', meaning: '火', category: '象形字', desc: '象火焰上腾之形。卜辞中用作火、火灾。' },
  { char: '\u6728', meaning: '木/树', category: '象形字', desc: '上象枝，中象干，下象根。卜辞中用作树木、木星。' },
  { char: '\u738B', meaning: '王/首领', category: '象形字', desc: '象斧钺之形，象征权力。卜辞中指商王。' },
  { char: '\u5B50', meaning: '子', category: '象形字', desc: '象婴儿之形，有头有身有双臂。卜辞中用作子女、地支名。' },
  { char: '\u9F8D', meaning: '龙', category: '象形字', desc: '象龙之形，有角有身。传说中能兴云雨的神兽。' },
  { char: '\u98A8', meaning: '风', category: '形声字', desc: '从虫凡声。卜辞中四方风各有专名。' },
  { char: '\u4E0A', meaning: '上', category: '指事字', desc: '以一横为基准，短横在上表示上方。' },
  { char: '\u4E0B', meaning: '下', category: '指事字', desc: '以一横为基准，短横在下表示下方。' },
]

const filteredChars = computed(() => {
  if (!search.value) return chars
  return chars.filter(c => c.meaning.includes(search.value) || c.char === search.value)
})
</script>

<style scoped>
.dict-page { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
.page-header { text-align: center; margin-bottom: 30px; }
.page-header h1 { font-size: 28px; color: #1a1a2e; }
.page-header p { color: #888; margin: 8px 0 16px; }

.search-bar { max-width: 400px; margin: 0 auto; }
.search-input { width: 100%; padding: 12px 20px; border: 2px solid #e0d6c8; border-radius: 50px; font-size: 16px; outline: none; text-align: center; box-sizing: border-box; }
.search-input:focus { border-color: #c9a96e; }

.dict-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; margin-top: 24px; }
.dict-card { background: white; border-radius: 12px; padding: 20px 10px; text-align: center; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.06); transition: transform 0.3s, box-shadow 0.3s; }
.dict-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
.dict-char { font-size: 42px; font-family: 'KaiTi','STKaiti',serif; color: #c9a96e; margin-bottom: 8px; }
.dict-label { font-size: 13px; color: #666; }

.detail-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.detail-card { background: white; border-radius: 16px; padding: 40px; text-align: center; max-width: 400px; width: 90%; }
.detail-char { font-size: 80px; font-family: 'KaiTi','STKaiti',serif; color: #c9a96e; margin-bottom: 16px; }
.detail-card h2 { font-size: 22px; color: #1a1a2e; margin-bottom: 12px; }
.detail-card p { font-size: 14px; color: #555; margin: 6px 0; text-align: left; line-height: 1.7; }
.btn-close { margin-top: 20px; padding: 10px 30px; background: #e0d6c8; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
</style>
