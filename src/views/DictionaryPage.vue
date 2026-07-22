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

      <div class="search-methods">
        <div class="pinyin-index">
          <span class="pinyin-label">拼音：</span>
          <button v-for="letter in pinyinLetters" :key="letter" class="pinyin-btn"
            :class="{ active: selectedPinyin === letter }"
            @click="togglePinyin(letter)">{{ letter }}</button>
          <button class="pinyin-btn pinyin-clear" v-if="selectedPinyin" @click="selectedPinyin = ''">清除</button>
        </div>
        <div class="radical-index">
          <span class="radical-label">部首：</span>
          <button v-for="r in commonRadicals" :key="r" class="radical-btn"
            :class="{ active: selectedRadical === r }"
            @click="toggleRadical(r)">{{ r }}</button>
          <button class="radical-btn radical-clear" v-if="selectedRadical" @click="selectedRadical = ''">全部</button>
        </div>
      </div>

      <div class="filter-bar">
        <button v-for="cat in categories" :key="cat" class="filter-tag"
          :class="{ active: selectedCat === cat }"
          @click="selectedCat = cat">{{ cat }}</button>
      </div>
    </div>

    <div v-if="filteredChars.length === 0 && (search || selectedCat !== '全部' || selectedPinyin || selectedRadical)" class="empty-state">
      <p>暂无匹配的甲骨文字</p>
    </div>

    <div class="dict-grid">
      <div v-for="(char, idx) in filteredChars" :key="char.char" class="dict-card"
        :style="{ animationDelay: idx * 0.03 + 's' }" @click="selected = char">
        <img v-if="(char as any).rubbingImg" :src="(char as any).rubbingImg" class="dict-rubbing-img" alt="" />
        <div class="dict-char">{{ char.char }}</div>
        <div class="dict-meaning">{{ char.meaning }}</div>
        <div class="dict-pinyin">{{ char.pinyin }}</div>
        <div class="dict-category">{{ char.category }}</div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selected" class="detail-overlay" @click.self="closeDetail">
        <div class="detail-card">
          <button class="detail-close" @click="closeDetail">&times;</button>
          <button class="bookmark-btn"
            :class="{ bookmarked: isBookmarked(selected.char) }"
            @click="toggleBookmark(selected)"
            :title="isBookmarked(selected.char) ? '取消收藏' : '收藏'">
            <span v-if="isBookmarked(selected.char)" class="heart-full">&#10084;</span>
            <span v-else class="heart-empty">&#9825;</span>
          </button>
          <img v-if="(selected as any).rubbingImg" :src="(selected as any).rubbingImg" class="detail-rubbing-img" alt="" />
          <div class="detail-char">{{ selected.char }}</div>
          <div class="detail-stamp">甲骨文</div>
          <div class="detail-pinyin">{{ selected.pinyin }}</div>
          <h2 class="detail-title">{{ selected.meaning }}</h2>
          <hr class="ink-divider" />

          <div class="evolution-section">
            <h3 class="section-label">字形演变</h3>
            <div class="evolution-timeline">
              <div class="timeline-line"></div>
              <div class="timeline-stages">
                <div class="timeline-stage" v-for="stage in evolutionStages" :key="stage.key">
                  <div class="stage-dot"></div>
                  <div class="stage-label">{{ stage.label }}</div>
                  <div class="stage-era">{{ stage.era }}</div>
                  <div class="stage-desc">{{ (selected.evolution as any)[stage.key] }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="shuowen-section" v-if="selected.shuowen">
            <h3 class="section-label">《说文解字》</h3>
            <blockquote class="shuowen-quote">
              <p>{{ selected.shuowen }}</p>
            </blockquote>
          </div>

          <p class="detail-desc">{{ selected.desc }}</p>

          <div class="detail-meta">
            <span class="meta-item"><strong>字型类别</strong> {{ selected.category }}</span>
            <span class="meta-item"><strong>部首</strong> {{ selected.radical }}</span>
            <span class="meta-item" v-if="selected.era"><strong>时期</strong> {{ selected.era }}</span>
          </div>
          <button class="btn-outline" @click="closeDetail">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useRoute } from 'vue-router'

const chars = [
  {
    "char": "日",
    "meaning": "日 / 太阳",
    "pinyin": "rì",
    "category": "象形字",
    "radical": "日",
    "era": "殷商",
    "shuowen": "实也。太阳之精不亏。从囗一。象形。",
    "desc": "外圆象太阳之形，中一点象光。卜辞中用作白天、日期，亦作祭名。殷人记日以干支，十日为一旬。",
    "evolution": {
      "oracle": "象太阳之形，外圆中有一点，或作椭圆中加短横。最早见于武丁时期卜辞。",
      "bronze": "圆转为方，外框趋近方形，中点变为短横，商周金文中形体趋于规整。",
      "seal": "小篆承金文，外框长方，中间一横，笔势圆转匀称。",
      "clerical": "隶书变圆为方折，外框成扁\"口\"形，中横平直，奠定楷书基础。",
      "regular": "楷书定型为\"日\"，扁方形，中横连接左右，笔画分明。"
    }
  },
  {
    "char": "月",
    "meaning": "月 / 月亮",
    "pinyin": "yuè",
    "category": "象形字",
    "radical": "月",
    "era": "殷商",
    "shuowen": "阙也。太阴之精。象形。",
    "desc": "象半月之形，缺而不满。卜辞中记月份、夜晚皆用此字。殷历以月相变化定朔望。",
    "evolution": {
      "oracle": "象半月之形，缺而不满，以别于\"日\"。上弦下弦各有异体。",
      "bronze": "金文保持半月形状，内饰增加短竖或点，与\"夕\"字有时混用。",
      "seal": "小篆规范为长弧形，下方开口处加一短竖，形体优美。",
      "clerical": "隶书变为长方形，内部两横，字形稳定为今之\"月\"。",
      "regular": "楷书承隶书，\"月\"字瘦长，左竖撇出，中间两横靠左不接右。"
    }
  },
  {
    "char": "人",
    "meaning": "人",
    "pinyin": "rén",
    "category": "象形字",
    "radical": "人",
    "era": "殷商",
    "shuowen": "天地之性最贵者也。象臂胫之形。",
    "desc": "象人侧立垂臂之形，肢体完备而简洁。卜辞中大量出现，是最基础的象形字，也是众多汉字的构件。",
    "evolution": {
      "oracle": "象人侧立垂臂之形，有头、躯干、臂、胫，线条简洁而生动。",
      "bronze": "金文仍为侧立人形，但线条加粗，多用于铭文，偶尔增饰笔。",
      "seal": "小篆人头变为短撇，手臂前伸，下肢弯曲，形体更加抽象化。",
      "clerical": "隶书头部为短撇，身体为一长撇一长捺，已是\"人\"字雏形。",
      "regular": "楷书定型为一撇一捺，撇短捺长，两笔相交成稳定结构。"
    }
  },
  {
    "char": "大",
    "meaning": "大",
    "pinyin": "dà",
    "category": "象形字",
    "radical": "大",
    "era": "殷商",
    "shuowen": "天大，地大，人亦大。故大象人形。",
    "desc": "象人正面站立、张开双臂之形，以大人之形表\"大\"义。引申为规模大、程度深。\"太\"\"天\"皆从此出。",
    "evolution": {
      "oracle": "象人正面站立、张开双臂之形，以大人之形表\"大\"义，姿态舒展。",
      "bronze": "金文延续正面人形，双臂平展，下肢分立，形体更加方正。",
      "seal": "小篆头部为一横，双臂为一横，身体和下肢为撇捺，结构接近\"大\"。",
      "clerical": "隶书平横变为波磔，撇捺开张舒展，已具\"大\"字今形。",
      "regular": "楷书定型为一横一撇一捺，横平撇直捺舒展，简单而有力。"
    }
  },
  {
    "char": "天",
    "meaning": "天 / 天空",
    "pinyin": "tiān",
    "category": "会意字",
    "radical": "大",
    "era": "殷商",
    "shuowen": "颠也。至高无上。从一大。",
    "desc": "从\"大\"从\"一\"，一人头顶之上即为天。卜辞中亦指上天、天帝，是殷人祭祀的重要对象。",
    "evolution": {
      "oracle": "从\"大\"从\"口\"（或方形、圆形），以人头顶上方的符号表示天空。",
      "bronze": "金文上部符号演变为圆点或短横，下方保持正面人形，含义明确。",
      "seal": "小篆从\"一\"\"大\"，上部为一横画，下部为人形，结构定形。",
      "clerical": "隶书承小篆，上横平直，下撇捺舒展，\"天\"字成形。",
      "regular": "楷书定型为两横一撇一捺，上横短下横长，\"天\"字至今如是。"
    }
  },
  {
    "char": "雨",
    "meaning": "雨",
    "pinyin": "yǔ",
    "category": "象形字",
    "radical": "雨",
    "era": "殷商",
    "shuowen": "水从云下也。一象天，冂象云，水霝其闲也。",
    "desc": "上象云层，下象雨滴下落之形。商代以农为本，卜辞中频繁出现\"其雨\"\"不雨\"\"大雨\"\"小雨\"等。",
    "evolution": {
      "oracle": "上横象天，中为云层，下为雨滴下落之形，雨点多寡不一。",
      "bronze": "金文上部云层简化，下部雨滴改为短竖或点，整体趋于方正。",
      "seal": "小篆上部为\"雨\"头（一+冂+四点），下部为雨滴，结构繁化。",
      "clerical": "隶书简化篆书，\"雨\"头定型，内部四点排列整齐。",
      "regular": "楷书承隶书，外部为\"雨\"框，内部四点均匀分布，字形稳定。"
    }
  },
  {
    "char": "山",
    "meaning": "山",
    "pinyin": "shān",
    "category": "象形字",
    "radical": "山",
    "era": "殷商",
    "shuowen": "宣也。宣气散，生万物。有石而高。象形。",
    "desc": "三峰并立，中高旁低，象山脉连绵起伏之形。卜辞中多用作地名及山神祭祀。",
    "evolution": {
      "oracle": "三峰并立，中高旁低，象山脉连绵起伏之形，简洁明快。",
      "bronze": "金文山峰变矮变宽，三峰轮廓更加饱满，偶有填实写法。",
      "seal": "小篆三峰演变为三竖加一横底，左右两竖略短，中竖最长。",
      "clerical": "隶书中竖变直，左右两竖外斜，底部一横平稳，\"山\"字成形。",
      "regular": "楷书定型为三竖加底横，中竖居中，左右竖外展，如山之形。"
    }
  },
  {
    "char": "水",
    "meaning": "水",
    "pinyin": "shuǐ",
    "category": "象形字",
    "radical": "水",
    "era": "殷商",
    "shuowen": "准也。北方之行。象众水并流，中有微阳之气也。",
    "desc": "中间曲线象主流水流，两旁散点象水花飞溅。卜辞中用作河流名称及水患记录。",
    "evolution": {
      "oracle": "中间曲线象主流水流，两旁散点象水花飞溅，动感十足。",
      "bronze": "金文中流水曲线加粗，两旁点画减少或规整化，趋于方正。",
      "seal": "小篆规范为中间长竖加左右各两短弧，如水流分岔之形。",
      "clerical": "隶书中间竖画为竖钩，左为横撇，右为撇捺，已具\"水\"形。",
      "regular": "楷书定型为竖钩加左横撇右撇捺，笔画清晰，水流之意犹存。"
    }
  },
  {
    "char": "火",
    "meaning": "火",
    "pinyin": "huǒ",
    "category": "象形字",
    "radical": "火",
    "era": "殷商",
    "shuowen": "毁也。南方之行。炎而上。象形。",
    "desc": "象火焰上腾之形，下宽上尖。卜辞中用作火灾、火星（大火星）等义。",
    "evolution": {
      "oracle": "象火焰上腾之形，下宽上尖，有数焰并起之状。",
      "bronze": "金文火焰趋于对称，两侧弯曲如翼，中央主体突出。",
      "seal": "小篆上部为火苗，下部两弧为火焰，左右对称，有装饰感。",
      "clerical": "隶书简化为左右两点加中间\"人\"字，已脱离象形趣味。",
      "regular": "楷书定型为左右两点加一撇一捺（或竖撇捺），笔画简洁。"
    }
  },
  {
    "char": "木",
    "meaning": "木 / 树",
    "pinyin": "mù",
    "category": "象形字",
    "radical": "木",
    "era": "殷商",
    "shuowen": "冒也。冒地而生。东方之行。从屮，下象其根。",
    "desc": "上象枝桠，中象树干，下象根须，一株完整的树。卜辞中用作树木、木材及木星（岁星）。",
    "evolution": {
      "oracle": "上象枝桠，中象树干，下象根须，一株完整的树，形态自然。",
      "bronze": "金文树干加粗，上下分枝对称，有时顶部加短横表示树冠。",
      "seal": "小篆中竖贯穿，上为弯曲歧枝，下为根部，线条圆转流畅。",
      "clerical": "隶书简化为横竖撇捺，上部为横竖交叉，下部撇捺如根。",
      "regular": "楷书定型为十字交叉加撇捺，即为今\"木\"字，结构稳固。"
    }
  },
  {
    "char": "王",
    "meaning": "王 / 首领",
    "pinyin": "wáng",
    "category": "象形字",
    "radical": "王",
    "era": "殷商",
    "shuowen": "天下所归往也。董仲舒曰：古之造文者，三画而连其中谓之王。",
    "desc": "象斧钺之形，斧钺是王权的象征。卜辞中称商王为\"王\"，是最常见的称谓之一。",
    "evolution": {
      "oracle": "象斧钺之形，刃部朝下，斧钺是王权的象征。早期形体与\"士\"相近。",
      "bronze": "金文斧钺形逐渐简化，出现三横一竖的形态，是权力符号。",
      "seal": "小篆定型为三横一竖贯穿，上两横近，下一横远，按许慎说\"三画连其中\"。",
      "clerical": "隶书三横平直，中竖贯通，笔画明确，\"王\"字成形。",
      "regular": "楷书三横一竖，上两横间距略小，下横较长，结构端严。"
    }
  },
  {
    "char": "子",
    "meaning": "子",
    "pinyin": "zǐ",
    "category": "象形字",
    "radical": "子",
    "era": "殷商",
    "shuowen": "十一月，阳气动，万物滋，人以为称。象形。",
    "desc": "象婴儿之形，大头、双臂、身体包裹。卜辞中用作子女义，亦为地支之首（子丑寅卯）。",
    "evolution": {
      "oracle": "象婴儿之形，大头、双臂上扬、身体包裹在襁褓中，仅露头和手。",
      "bronze": "金文婴儿头部圆大，身体线条更加抽象，双手简化为交叉笔画。",
      "seal": "小篆头部变为扁圆形，双臂简化，身体长曲，字形工整。",
      "clerical": "隶书变为横钩加竖钩加横，头部、手臂、身体分别线条化。",
      "regular": "楷书定型为横钩/竖钩/横的组合，\"子\"字三笔结构简洁。"
    }
  },
  {
    "char": "龙",
    "meaning": "龙",
    "pinyin": "lóng",
    "category": "象形字",
    "radical": "龍",
    "era": "殷商",
    "shuowen": "鳞虫之长。能幽能明，能细能巨，能短能长。春分而登天，秋分而潜渊。",
    "desc": "象龙之形，有角冠、巨口、长身卷尾。传说中能兴云雨的神兽，殷人信仰中的重要神灵。",
    "evolution": {
      "oracle": "象龙之形，有角冠、巨口、长身卷尾，形态各异，或简或繁。",
      "bronze": "金文龙形更加繁复，角冠高耸，身体盘曲，鳞纹可见，气势雄健。",
      "seal": "小篆从\"肉\"从\"飛\"省，右旁为\"龍\"之形声结构，笔画增多。",
      "clerical": "隶书大幅简化，左\"立\"右\"月\"加下三横等，繁体\"龍\"初见雏形。",
      "regular": "楷书繁体\"龍\"共十六画，简体作\"龙\"，从\"尤\"省加一撇。"
    }
  },
  {
    "char": "风",
    "meaning": "风",
    "pinyin": "fēng",
    "category": "形声字",
    "radical": "風",
    "era": "殷商",
    "shuowen": "八风也。东方曰明庶风，东南曰清明风……风动虫生。故虫八日而化。从虫凡声。",
    "desc": "从虫凡声。卜辞中四方风各有专名，殷人对季风已有系统认识。",
    "evolution": {
      "oracle": "借\"凤\"字为\"风\"，凤鸟高飞鼓翼生风，或于\"凡\"旁加数点表风动。",
      "bronze": "金文出现从\"虫\"\"凡\"声的形声结构，\"虫\"旁与风动虫生有关。",
      "seal": "小篆定型为从\"虫\"\"凡\"声，\"風\"字结构与今繁体相同。",
      "clerical": "隶书外框方正，内部\"虫\"\"凡\"笔画平直，繁体\"風\"成形。",
      "regular": "楷书繁体\"風\"九画，简体作\"风\"，内部简化为乂。"
    }
  },
  {
    "char": "上",
    "meaning": "上",
    "pinyin": "shàng",
    "category": "指事字",
    "radical": "一",
    "era": "殷商",
    "shuowen": "高也。此古文上。指事也。",
    "desc": "以一长横为基准，上方短横指示\"上\"的位置。与\"下\"相对，是中国最古老的指事字之一。",
    "evolution": {
      "oracle": "以一长横为基准，上方短横指示\"上\"的位置，简洁而明确。",
      "bronze": "金文延续甲骨文写法，长短横对比更加分明，偶有竖笔连接。",
      "seal": "小篆变为竖弯加短横，即从\"一\"从\"卜\"省，形态变化较大。",
      "clerical": "隶书恢复为上下两横，上短下长，简洁易识。",
      "regular": "楷书定型为上短下长两横，加一竖画，\"上\"字三画至今。"
    }
  },
  {
    "char": "下",
    "meaning": "下",
    "pinyin": "xià",
    "category": "指事字",
    "radical": "一",
    "era": "殷商",
    "shuowen": "底也。指事。",
    "desc": "以一长横为基准，下方短横指示\"下\"的位置。简洁而明确的构字方式。",
    "evolution": {
      "oracle": "以一长横为基准，下方短横指示\"下\"的位置。简洁而明确的构字方式。",
      "bronze": "金文写法与甲骨文一致，长短横对比明确，偶有竖笔。",
      "seal": "小篆变为竖弯加短横在下，形体与\"上\"相对，但变化一致。",
      "clerical": "隶书恢复为上下关系，上长下短，加竖画，即为\"下\"。",
      "regular": "楷书定型为上长下短两横加一竖，\"下\"字三画至今。"
    }
  },
  {
    "char": "土",
    "meaning": "土 / 土地",
    "pinyin": "tǔ",
    "category": "象形字",
    "radical": "土",
    "era": "殷商",
    "shuowen": "地之吐生物者也。二象地之下、地之中，物出形也。",
    "desc": "象地上土块之形，一横为地面。卜辞中用作土地、社神等，是先民生息的根本。",
    "evolution": {
      "oracle": "象地上土块之形，一横为地面，上方菱形或椭圆为土块。",
      "bronze": "金文土块演变为十字形或填实菱形，与\"社\"字相关。",
      "seal": "小篆规范为两横加一竖，上横短下横长，竖画贯穿。",
      "clerical": "隶书两横平直，中竖垂直，已具\"土\"形，笔画方正。",
      "regular": "楷书定型为两横一竖，上横短下横长，结构稳重如大地。"
    }
  },
  {
    "char": "女",
    "meaning": "女",
    "pinyin": "nǚ",
    "category": "象形字",
    "radical": "女",
    "era": "殷商",
    "shuowen": "妇人也。象形。王育说。",
    "desc": "象女子跪坐交手之形。卜辞中用作女性、配偶等义，是重要的性别标识字。",
    "evolution": {
      "oracle": "象女子跪坐交手之形，两臂交叉于前，姿态恭顺。",
      "bronze": "金文跪坐姿势不变，头部和手臂线条更加圆润，女子形象柔美。",
      "seal": "小篆头部简化为短横，身体弯曲，两臂交叉，字形趋于抽象。",
      "clerical": "隶书变为左右结构，一撇一点加\"女\"部，\"女\"字三笔初成。",
      "regular": "楷书定型为折笔加撇加横，\"女\"字三画，柔中带刚。"
    }
  },
  {
    "char": "中",
    "meaning": "中 / 中央",
    "pinyin": "zhōng",
    "category": "指事字",
    "radical": "丨",
    "era": "殷商",
    "shuowen": "内也。从口丨，上下通。",
    "desc": "一竖贯穿圆圈中部，表示正中。卜辞中用作中间、中等义，亦为族名和地名。",
    "evolution": {
      "oracle": "一竖贯穿圆圈或方框中部，表示正中。或有飘带装饰的繁形。",
      "bronze": "金文延续中竖贯穿圆形或方形，飘带形更加繁复，用于旌旗。",
      "seal": "小篆从\"口\"\"丨\"，外框方正，中竖贯穿，简洁明快。",
      "clerical": "隶书外\"口\"方正，中竖垂直穿过，\"中\"字规范成形。",
      "regular": "楷书定型为扁\"口\"加中竖贯穿，\"中\"字四画，端正中和。"
    }
  },
  {
    "char": "食",
    "meaning": "食 / 食物",
    "pinyin": "shí",
    "category": "会意字",
    "radical": "食",
    "era": "殷商",
    "shuowen": "一米也。从皀亼声。或说：亼，一粒也。",
    "desc": "上为口，下为盛食物的器皿。卜辞中用作食物、食用、日食月食等义。",
    "evolution": {
      "oracle": "上为口（倒口向下），下为盛食物的器皿（皀），合表进食之义。",
      "bronze": "金文上下结构不变，器皿形更加规整，上部倒口简化为三角形。",
      "seal": "小篆从\"皀\"\"亼\"声，字形分为上下两部，笔画繁密。",
      "clerical": "隶书简化，上部为\"人\"加一横，下部为\"良\"省，繁体\"食\"成形。",
      "regular": "楷书定型为人+良，繁体\"食\"九画，简体省去一点，八画。"
    }
  },
  {
    "char": "心",
    "meaning": "心",
    "pinyin": "xīn",
    "category": "象形字",
    "radical": "心",
    "era": "殷商",
    "shuowen": "人心，土藏，在身之中。象形。博士说以为火藏。",
    "desc": "象心脏之形，内分左右心房。古人认为心主思维，故凡从心之字多与思想感情有关。",
    "evolution": {
      "oracle": "象心脏之形，曲线勾勒心房轮廓，内分左右。古文字中极为形象。",
      "bronze": "金文心脏轮廓更加饱满，内部结构清晰可见，有时简化为三点。",
      "seal": "小篆规范为三曲笔加一点，上部开口如心字形，笔画优美。",
      "clerical": "隶书变为三点加卧钩，左右两点加中间一点，\"心\"字形已具。",
      "regular": "楷书定型为三点一卧钩，左点、挑点、右点加卧钩，即为今\"心\"。"
    }
  },
  {
    "char": "鱼",
    "meaning": "鱼",
    "pinyin": "yú",
    "category": "象形字",
    "radical": "魚",
    "era": "殷商",
    "shuowen": "水虫也。象形。鱼尾与燕尾相似。",
    "desc": "象鱼之形，有头、身、鳞、尾。卜辞中用作渔猎及祭祀供品。",
    "evolution": {
      "oracle": "象鱼之形，有头、身、鳞、尾，侧视全形，线条生动。",
      "bronze": "金文鱼形更加规整，头部简化，鱼身有鳞纹装饰，尾部夸张。",
      "seal": "小篆上部为\"鱼\"头，中为田形鱼身，下部为四点尾，已脱离图画。",
      "clerical": "隶书头部为撇横，中为\"田\"，下四点，繁体\"魚\"成形。",
      "regular": "楷书繁体\"魚\"十一画，简体\"鱼\"八画，下四点改为一横。"
    }
  },
  {
    "char": "鸟",
    "meaning": "鸟",
    "pinyin": "niǎo",
    "category": "象形字",
    "radical": "鳥",
    "era": "殷商",
    "shuowen": "长尾禽总名也。象形。",
    "desc": "象鸟之形，有喙、头、身、翅、尾、爪。卜辞中用为鸟名及图腾。",
    "evolution": {
      "oracle": "象鸟侧视之形，有喙、头、身、翅、尾、爪，特征俱全。",
      "bronze": "金文鸟形更加装饰化，冠羽、尾羽夸张，线条繁复精美。",
      "seal": "小篆以\"鳥\"（长尾禽）构形，上部为头冠，下部四点象爪尾。",
      "clerical": "隶书上部简化为白/日，下部四点排列，繁体\"鳥\"成形。",
      "regular": "楷书繁体\"鳥\"十一画，简体\"鸟\"五画，以横代四点。"
    }
  },
  {
    "char": "虎",
    "meaning": "虎",
    "pinyin": "hǔ",
    "category": "象形字",
    "radical": "虎",
    "era": "殷商",
    "shuowen": "山兽之君。从虍，虎足象人足。象形。",
    "desc": "象虎侧视之形，大口、利齿、斑纹、长尾。卜辞中用为方国名及狩猎对象。",
    "evolution": {
      "oracle": "象虎侧视之形，大口、利齿、斑纹、长尾，威风凛凛。",
      "bronze": "金文虎头更加夸张，大口獠牙突出，身体简化，保留斑纹。",
      "seal": "小篆从\"虍\"（虎头）从\"人\"，虎足象人足，字形变抽象。",
      "clerical": "隶书\"虍\"部为虎头，\"几\"为虎身，繁体\"虎\"成形。",
      "regular": "楷书定型为\"虍\"加\"几\"，\"虎\"字八画，简化明显。"
    }
  },
  {
    "char": "鹿",
    "meaning": "鹿",
    "pinyin": "lù",
    "category": "象形字",
    "radical": "鹿",
    "era": "殷商",
    "shuowen": "兽也。象头角四足之形。",
    "desc": "象鹿侧视之形，有角、头、身、足。卜辞中记猎鹿甚多，是殷人重要的狩猎对象。",
    "evolution": {
      "oracle": "象鹿侧视之形，有角、头、身、足，鹿角多叉，特征鲜明。",
      "bronze": "金文鹿角简化，身体变方正，四足减为两足，趋于符号化。",
      "seal": "小篆鹿角变为点横组合，身体方正，下部为\"比\"形足。",
      "clerical": "隶书广头下加\"比\"，上方横点表示鹿角，\"鹿\"字成形。",
      "regular": "楷书定型为广字头下加\"比\"，\"鹿\"字十一画，简体同形。"
    }
  },
  {
    "char": "牛",
    "meaning": "牛",
    "pinyin": "niú",
    "category": "象形字",
    "radical": "牛",
    "era": "殷商",
    "shuowen": "大牲也。牛，件也。件，事理也。象角头三、封尾之形。",
    "desc": "象牛首正面之形，双角向上弯曲。卜辞中用作祭祀牺牲和财产。",
    "evolution": {
      "oracle": "象牛首正面之形，双角向上弯曲，面部简洁，是极具辨识度的象形字。",
      "bronze": "金文牛角缩短，面部线条加粗，整体趋于方正，祭祀铭文中常见。",
      "seal": "小篆双角变短横，中间横竖表示面部，笔画抽象化。",
      "clerical": "隶书变为短撇加两横一竖，\"牛\"字四画，角形已失。",
      "regular": "楷书定型为撇加两横一竖，\"牛\"字四画，简洁大方。"
    }
  },
  {
    "char": "羊",
    "meaning": "羊",
    "pinyin": "yáng",
    "category": "象形字",
    "radical": "羊",
    "era": "殷商",
    "shuowen": "祥也。从𠁥，象头角足尾之形。孔子曰：牛羊之字以形举也。",
    "desc": "象羊首正面之形，角向下弯曲。古以羊为祥，是重要的祭品和食物来源。",
    "evolution": {
      "oracle": "象羊首正面之形，角向下弯曲，与\"牛\"字角向上相对，区分明确。",
      "bronze": "金文羊角更加弯曲，面部线条饱满，铭文中用作\"吉祥\"之\"祥\"。",
      "seal": "小篆上为羊角（两点），中为两横，下为短竖，结构规范。",
      "clerical": "隶书上两点为羊角，三横为面部，中间一竖贯穿。",
      "regular": "楷书定型为两点加三横一竖，\"羊\"字六画，温顺典雅。"
    }
  },
  {
    "char": "马",
    "meaning": "马",
    "pinyin": "mǎ",
    "category": "象形字",
    "radical": "馬",
    "era": "殷商",
    "shuowen": "怒也。武也。象马头髦尾四足之形。",
    "desc": "象马侧视之形，突出长脸、鬃毛、四蹄。卜辞中用作车马和田猎。",
    "evolution": {
      "oracle": "象马侧视之形，突出长脸、鬃毛、四蹄，尾部修长飘逸。",
      "bronze": "金文马形更加雄伟，鬃毛三撇，四蹄分明，用于车马铭刻。",
      "seal": "小篆从\"馬\"，上部为头鬃，中为身，下四点象四蹄。",
      "clerical": "隶书上部为横竖组合，下部四点排列，繁体\"馬\"成形。",
      "regular": "楷书繁体\"馬\"十画，简体\"马\"三画，以横代四点。"
    }
  },
  {
    "char": "豕",
    "meaning": "豕 / 猪",
    "pinyin": "shǐ",
    "category": "象形字",
    "radical": "豕",
    "era": "殷商",
    "shuowen": "彘也。竭其尾，故谓之豕。象毛足而后有尾。",
    "desc": "象猪侧视之形，突出长嘴和肥腹。是最早驯化的家畜之一。",
    "evolution": {
      "oracle": "象猪侧视之形，突出长嘴和肥腹，尾巴短小下垂。",
      "bronze": "金文猪形简化，嘴部变短，腹部仍突出，尾形可见。",
      "seal": "小篆从\"彑\"（猪头）从\"豕\"，头部与身体分离表示，结构清晰。",
      "clerical": "隶书简化为横撇加弯钩加两撇一捺，\"豕\"字成形。",
      "regular": "楷书定型为横撇弯钩加两撇一捺，\"豕\"字七画。"
    }
  },
  {
    "char": "犬",
    "meaning": "犬 / 狗",
    "pinyin": "quǎn",
    "category": "象形字",
    "radical": "犬",
    "era": "殷商",
    "shuowen": "狗之有县蹄者也。象形。孔子曰：视犬之字如画狗也。",
    "desc": "象犬侧视张口之形。卜辞中用为狩猎助手及牺牲。",
    "evolution": {
      "oracle": "象犬侧视张口之形，头向上昂，腹部瘦削，尾上扬，与豕区别。",
      "bronze": "金文犬形线条化，头部和身体轮廓清晰，尾仍上翘。",
      "seal": "小篆从\"犬\"，为左撇右捺加一点，已是抽象化的兽形符号。",
      "clerical": "隶书犬旁变为\"犭\"（反犬旁），\"犬\"字本身为大字加一点。",
      "regular": "楷书定型为大字右上加一点，\"犬\"字四画，作偏旁时为\"犭\"。"
    }
  },
  {
    "char": "田",
    "meaning": "田 / 田地",
    "pinyin": "tián",
    "category": "象形字",
    "radical": "田",
    "era": "殷商",
    "shuowen": "陈也。树谷曰田。象四囗。十，阡陌之制也。",
    "desc": "象纵横交错的田界。卜辞中用作农田和田猎，反映殷代农猎并重的经济。",
    "evolution": {
      "oracle": "象纵横交错的田界，内部田垄或四或六或九格不等。",
      "bronze": "金文田界趋于规整，多为四格或九格，用于赏赐田地的铭文。",
      "seal": "小篆外框方正，内为十字分隔，标准的四格田形。",
      "clerical": "隶书外框略扁，内部十字分明，已与今\"田\"无异。",
      "regular": "楷书定型为外框内十字，\"田\"字五画，方正稳重。"
    }
  },
  {
    "char": "禾",
    "meaning": "禾 / 谷物",
    "pinyin": "hé",
    "category": "象形字",
    "radical": "禾",
    "era": "殷商",
    "shuowen": "嘉谷也。二月始生，八月而孰，得时之中，故谓之禾。从木，从𠂹省。",
    "desc": "上象谷穗下垂，下象根茎。卜辞中记作物生长和收成，是农业社会的基本文字。",
    "evolution": {
      "oracle": "上象谷穗下垂，下象根茎，中部为茎叶，一株完整的谷物。",
      "bronze": "金文谷穗变为横弯，茎秆竖直，根部简化，整体规整。",
      "seal": "小篆上部为穗（短撇），中部为茎叶，下部为根，结构清晰。",
      "clerical": "隶书穗部为平撇，茎干为竖，根部为撇捺，\"禾\"字成形。",
      "regular": "楷书定型为撇加木，\"禾\"字五画，穗垂之意犹在。"
    }
  },
  {
    "char": "黄",
    "meaning": "黄 / 黄色",
    "pinyin": "huáng",
    "category": "象形字",
    "radical": "黃",
    "era": "殷商",
    "shuowen": "地之色也。从田从炗，炗亦声。炗，古文光。",
    "desc": "一说象佩玉璜之形。卜辞中用作颜色词和地名。",
    "evolution": {
      "oracle": "一说象佩玉璜之形，中有圆孔，上下有系带，后借为颜色词。",
      "bronze": "金文璜形更加规整，系带线条明确，铭文中用作赏赐黄色物品。",
      "seal": "小篆从\"田\"从\"炗\"，表示土地之光色，结构繁化。",
      "clerical": "隶书简化为共字头加由，\"黄\"字初具规模。",
      "regular": "楷书定型为共头由字底，\"黄\"字十一画，简体为十一画。"
    }
  },
  {
    "char": "白",
    "meaning": "白 / 白色",
    "pinyin": "bái",
    "category": "象形字",
    "radical": "白",
    "era": "殷商",
    "shuowen": "西方色也。阴用事，物色白。从入合二。二，阴数。",
    "desc": "一说象米粒之形。卜辞中用作颜色和地名。\"白\"亦是\"伯\"的初文。",
    "evolution": {
      "oracle": "一说象米粒之形，或象日光初升之状，表白色之义。",
      "bronze": "金文延续甲骨文形，或为椭圆中加一点，或为尖顶形。",
      "seal": "小篆从\"入\"从\"二\"，按许慎说\"从入合二\"表西方白色。",
      "clerical": "隶书变为短撇加日字，上尖下方，\"白\"字成形。",
      "regular": "楷书定型为短撇加\"日\"，\"白\"字五画，简洁明朗。"
    }
  },
  {
    "char": "赤",
    "meaning": "赤 / 红色",
    "pinyin": "chì",
    "category": "会意字",
    "radical": "赤",
    "era": "殷商",
    "shuowen": "南方色也。从大从火。",
    "desc": "从大从火，大火之色为赤。殷人尚白少赤，但此字已见诸卜辞。",
    "evolution": {
      "oracle": "从大从火，大火之色为赤，上为正面人形，下为火焰。",
      "bronze": "金文上下结构不变，火焰形简化为短横加撇捺，人形仍可辨。",
      "seal": "小篆从\"大\"\"火\"，上\"大\"下\"火\"，结构不变但笔画规范。",
      "clerical": "隶书上\"大\"下\"火\"，大之撇捺与火之撇捺相呼应。",
      "regular": "楷书定型为十字头加火字底或两点底，\"赤\"字七画。"
    }
  },
  {
    "char": "血",
    "meaning": "血",
    "pinyin": "xiě",
    "category": "指事字",
    "radical": "血",
    "era": "殷商",
    "shuowen": "祭所荐牲血也。从皿，一象血形。",
    "desc": "器皿中有一圆点表示血液。用于祭祀中的血祭之礼。",
    "evolution": {
      "oracle": "器皿中有一圆点表示血液，用于祭祀中的血祭之礼。",
      "bronze": "金文皿形规整，内部点画清晰，表血之意明确。",
      "seal": "小篆从\"皿\"，上有一点表示血，结构简洁。",
      "clerical": "隶书皿部变为方框加横，上有一点或短横。",
      "regular": "楷书定型为短撇加皿，即\"血\"字六画，古意犹存。"
    }
  },
  {
    "char": "臣",
    "meaning": "臣",
    "pinyin": "chén",
    "category": "象形字",
    "radical": "臣",
    "era": "殷商",
    "shuowen": "牵也。事君也。象屈服之形。",
    "desc": "象竖目之形，屈身俯首之状。卜辞中用作臣僚，是商王的下属官吏。",
    "evolution": {
      "oracle": "象竖目之形，屈身俯首之状，表示臣服之意。",
      "bronze": "金文竖目形更加规整，外框方正，内横清晰，铭文中指臣僚。",
      "seal": "小篆外框长方，内部横画均匀，已具\"臣\"字今形。",
      "clerical": "隶书外框变扁，内部横画分明，\"臣\"字成形。",
      "regular": "楷书定型为横竖折横竖折竖，\"臣\"字六画。"
    }
  },
  {
    "char": "目",
    "meaning": "目 / 眼睛",
    "pinyin": "mù",
    "category": "象形字",
    "radical": "目",
    "era": "殷商",
    "shuowen": "人眼。象形。重童子也。",
    "desc": "象人眼之形，外框为眼眶，内为瞳仁。卜辞中用作观察、监视义。",
    "evolution": {
      "oracle": "象人眼之形，外框为眼眶，内为瞳仁，横向放置。",
      "bronze": "金文眼眶变方正，瞳仁以圆点或短横表示，写法规整。",
      "seal": "小篆外框长方，内部两横，眼眶和瞳孔分明，竖立放置。",
      "clerical": "隶书外框扁方，内部两横或一横，已竖置为\"目\"形。",
      "regular": "楷书定型为竖长方框加两横，\"目\"字五画，端正。"
    }
  },
  {
    "char": "耳",
    "meaning": "耳 / 耳朵",
    "pinyin": "ěr",
    "category": "象形字",
    "radical": "耳",
    "era": "殷商",
    "shuowen": "主听也。象形。",
    "desc": "象耳朵轮廓之形。卜辞中用为听、闻义，亦是人体的基本构件字。",
    "evolution": {
      "oracle": "象耳朵轮廓之形，外廓弯曲，内有耳道，与今耳形相近。",
      "bronze": "金文耳朵轮廓趋于方正，内部结构清晰，竖立放置。",
      "seal": "小篆外廓长方，内部横竖交叉，笔画规范，已具\"耳\"形。",
      "clerical": "隶书横竖笔画分明，外廓简化为横竖结构。",
      "regular": "楷书定型为横竖横竖横横横，\"耳\"字六画。"
    }
  },
  {
    "char": "口",
    "meaning": "口 / 嘴巴",
    "pinyin": "kǒu",
    "category": "象形字",
    "radical": "口",
    "era": "殷商",
    "shuowen": "人所以言食也。象形。",
    "desc": "象人口张开之形。凡与言语、饮食相关之字多从口。",
    "evolution": {
      "oracle": "象人口张开之形，上唇弧形，嘴角上扬或平直，形态简洁。",
      "bronze": "金文口形趋于方正，四角分明，与今\"口\"字相近。",
      "seal": "小篆完全方正，四角直角，已是标准的方形。",
      "clerical": "隶书承小篆，方形外框，笔画平直。",
      "regular": "楷书定型为竖横折横，\"口\"字三画，四四方方。"
    }
  },
  {
    "char": "手",
    "meaning": "手",
    "pinyin": "shǒu",
    "category": "象形字",
    "radical": "手",
    "era": "殷商",
    "shuowen": "拳也。象形。",
    "desc": "象手掌五指之形。凡与动作相关的字多从手，是汉字的重要部首。",
    "evolution": {
      "oracle": "象手掌五指之形，中间为掌，上下为指，或作三指简形。",
      "bronze": "金文手掌更加规整，五指简化为三画，线条分明。",
      "seal": "小篆规范为弯曲的指掌轮廓，上部为指，下部为腕，笔画圆转。",
      "clerical": "隶书变为三横一竖钩，横为指，竖钩为掌腕，简洁。",
      "regular": "楷书定型为三横一竖钩，\"手\"字四画。作偏旁时为\"扌\"。"
    }
  },
  {
    "char": "止",
    "meaning": "止 / 足趾",
    "pinyin": "zhǐ",
    "category": "象形字",
    "radical": "止",
    "era": "殷商",
    "shuowen": "下基也。象草木出有址，故以止为足。",
    "desc": "象脚掌和脚趾之形。凡与行走相关的字多从止，如步、此、正等。",
    "evolution": {
      "oracle": "象脚掌和脚趾之形，上为三趾，下为脚掌轮廓，简朴逼真。",
      "bronze": "金文脚趾和脚掌线条分明，有时趾数变少，趋于方正。",
      "seal": "小篆规范为中间竖加左右斜笔，上部为趾，下部为掌。",
      "clerical": "隶书变为竖加横竖组合，以横代趾，以竖代掌。",
      "regular": "楷书定型为竖加短竖加横，\"止\"字四画，脚趾之意犹在。"
    }
  },
  {
    "char": "行",
    "meaning": "行 / 行走",
    "pinyin": "xíng",
    "category": "象形字",
    "radical": "行",
    "era": "殷商",
    "shuowen": "人之步趋也。从彳从亍。",
    "desc": "象十字路口之形，本义为道路，引申为行走。卜辞中亦用为\"行走\"义。",
    "evolution": {
      "oracle": "象十字路口之形，四通八达，中心为交叉点。",
      "bronze": "金文路口形更加方正，四角分明，常用作道路义。",
      "seal": "小篆规范为左右对称结构，左为\"彳\"右为\"亍\"，各三笔。",
      "clerical": "隶书左右两部分更加分明，左双人旁，右\"亍\"，结构对称。",
      "regular": "楷书定型为双人旁加\"亍\"，\"行\"字六画，道路之意存焉。"
    }
  },
  {
    "char": "来",
    "meaning": "来 / 到来",
    "pinyin": "lái",
    "category": "象形字",
    "radical": "來",
    "era": "殷商",
    "shuowen": "周所受瑞麦来麰。一来二缝，象芒朿之形。天所来也，故为行来之来。",
    "desc": "本象麦穗之形，借为\"往来\"之\"来\"。卜辞中大量用作动词。",
    "evolution": {
      "oracle": "本象麦穗之形，顶部为麦芒，中部为穗，下部为茎。",
      "bronze": "金文麦穗形更加装饰化，芒刺明显，茎秆粗壮。",
      "seal": "小篆规范为从\"來\"形，上部为芒，中部为穗形，下部为茎根。",
      "clerical": "隶书变为横竖撇捺组合，麦穗之意淡化，已近今\"来\"。",
      "regular": "楷书定型为横点撇横竖撇捺，\"来\"字七画，简体从之。"
    }
  },
  {
    "char": "出",
    "meaning": "出 / 出去",
    "pinyin": "chū",
    "category": "会意字",
    "radical": "凵",
    "era": "殷商",
    "shuowen": "进也。象草木益滋，上出达也。",
    "desc": "从止从凵，脚从坑中跨出。与\"各\"（进入）相对，是最基本的运动动词。",
    "evolution": {
      "oracle": "从止从凵，上部为脚趾（止），下部为坑穴（凵），脚从坑中跨出。",
      "bronze": "金文止和凵的界限更加清晰，上部止形规范，下部凵形方正。",
      "seal": "小篆变为两山相叠，上部为\"屮\"（草），下部为\"凵\"，按许说象草木出地。",
      "clerical": "隶书简化为竖折加竖加竖折，\"出\"字初具规模。",
      "regular": "楷书定型为竖折竖加竖折竖，\"出\"字五画，两个山相叠。"
    }
  },
  {
    "char": "入",
    "meaning": "入 / 进入",
    "pinyin": "rù",
    "category": "指事字",
    "radical": "入",
    "era": "殷商",
    "shuowen": "内也。象从上俱下也。",
    "desc": "象尖锐物进入之形，与\"人\"字区分明显。卜辞中用作进入、收入义。",
    "evolution": {
      "oracle": "象尖锐物进入之形，上尖下宽，与\"人\"字侧立之形区分明显。",
      "bronze": "金文笔势与甲骨文一致，尖头和展开的尾部分明。",
      "seal": "小篆规范为左右对称的弧形，上尖下分，笔画优美。",
      "clerical": "隶书变为撇捺组合，左撇右捺，上尖下展。",
      "regular": "楷书定型为撇捺，\"入\"字两画，简洁明了。"
    }
  },
  {
    "char": "一",
    "meaning": "一",
    "pinyin": "yī",
    "category": "指事字",
    "radical": "一",
    "era": "殷商",
    "shuowen": "惟初太始，道立于一。造分天地，化成万物。",
    "desc": "以一道横画表示数目一。是最简单的指事字，也是数字体系的基础。",
    "evolution": {
      "oracle": "以一道横画表示数目一，简单直接。",
      "bronze": "金文延续一横写法，笔画更加粗壮有力。",
      "seal": "小篆一横圆转起笔，垂露收笔，讲究笔法。",
      "clerical": "隶书一横平直，蚕头燕尾，波磔分明。",
      "regular": "楷书定型为一横，左低右高，遒劲有力。\"一\"字最为简单。"
    }
  },
  {
    "char": "三",
    "meaning": "三",
    "pinyin": "sān",
    "category": "指事字",
    "radical": "一",
    "era": "殷商",
    "shuowen": "天地人之道也。从三数。",
    "desc": "以三道横画表示数目三。\"三\"又常表示多数，如\"三思\"\"再三\"。",
    "evolution": {
      "oracle": "以三道横画表示数目三，等距排列。",
      "bronze": "金文三横平行等距，笔画工整。",
      "seal": "小篆三横均匀，每笔起收圆转。",
      "clerical": "隶书三横平直，中横略短，波磔分明。",
      "regular": "楷书定型为三横，上两横短、下横长，间距均匀。"
    }
  },
  {
    "char": "五",
    "meaning": "五",
    "pinyin": "wǔ",
    "category": "指事字",
    "radical": "二",
    "era": "殷商",
    "shuowen": "五行也。从二，阴阳在天地间交午也。",
    "desc": "甲骨文\"五\"作X形交叉，至西周中后期方定型为今日写法。",
    "evolution": {
      "oracle": "甲骨文\"五\"作X形交叉，两线斜交，与今日写法迥异。",
      "bronze": "金文仍为X形，但线条加粗，上下有时加短横。",
      "seal": "小篆变为上下两横中间交叉，按许说\"阴阳在天地间交午\"。",
      "clerical": "隶书变为横竖折横，中间交叉演化为竖折，已近今形。",
      "regular": "楷书定型为横竖折横，\"五\"字四画，稳定至今。"
    }
  },
  {
    "char": "十",
    "meaning": "十",
    "pinyin": "shí",
    "category": "指事字",
    "radical": "十",
    "era": "殷商",
    "shuowen": "数之具也。一为东西，丨为南北，则四方中央备矣。",
    "desc": "以一竖画表示数目十。殷人以十进制计数，卜辞中大量使用。",
    "evolution": {
      "oracle": "以一竖画表示数目十，简单直接。",
      "bronze": "金文竖画加粗，中部有时加圆点或短横装饰。",
      "seal": "小篆竖画中加短横，横竖交叉，按许说表四方中央。",
      "clerical": "隶书横竖交叉，\"十\"字定型。",
      "regular": "楷书定型为横竖交叉，\"十\"字两画，横短竖长，上小下大。"
    }
  }
]

const route = useRoute()
const search = ref('')
const selected = ref<null | typeof chars[0]>(null)
const selectedCat = ref('全部')
const selectedPinyin = ref('')
const selectedRadical = ref('')

watch(() => route.query.q, (q) => {
  if (q) search.value = q as string
})

const categories = ['全部', '象形字', '会意字', '指事字', '形声字']
const pinyinLetters = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','W','X','Y','Z']

const commonRadicals = [
  '日','月','人','口','手','木','水','火','土','金','王','女','子','山','雨','風','龍','魚','鳥','虎','鹿','牛','馬','羊','犬','豕','田','禾','心','耳','目','止','行'
]

const evolutionStages = [
  { key: 'oracle', label: '甲骨文', era: '商' },
  { key: 'bronze', label: '金文', era: '周' },
  { key: 'seal', label: '小篆', era: '秦' },
  { key: 'clerical', label: '隶书', era: '汉' },
  { key: 'regular', label: '楷书', era: '唐' }
]

function togglePinyin(letter: string) {
  selectedPinyin.value = selectedPinyin.value === letter ? '' : letter
}
function toggleRadical(r: string) {
  selectedRadical.value = selectedRadical.value === r ? '' : r
}
function closeDetail() { selected.value = null }

const bookmarks = ref<Array<{char: string; meaning: string; category: string}>>([])

async function loadBookmarks() {
  const { data: sess } = await supabase.auth.getSession()
  if (sess.session?.user) {
    const { data } = await supabase.from('bookmarks').select('*').eq('user_id', sess.session.user.id)
    if (data) bookmarks.value = data
  }
}

async function saveBookmark(item: { char: string; meaning: string; category: string }) {
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session?.user) return
  await supabase.from('bookmarks').insert({
    user_id: sess.session.user.id,
    char: item.char,
    meaning: item.meaning,
    category: item.category
  })
}

async function removeBookmark(char: string) {
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session?.user) return
  await supabase.from('bookmarks').delete().eq('user_id', sess.session.user.id).eq('char', char)
}

function isBookmarked(char: string): boolean {
  return bookmarks.value.some(b => b.char === char)
}

async function toggleBookmark(item: typeof chars[0]) {
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session?.user) { alert('请先登录'); return }
  const idx = bookmarks.value.findIndex(b => b.char === item.char)
  if (idx >= 0) {
    bookmarks.value.splice(idx, 1)
    await removeBookmark(item.char)
  } else {
    bookmarks.value.push({ char: item.char, meaning: item.meaning, category: item.category })
    await saveBookmark({ char: item.char, meaning: item.meaning, category: item.category })
  }
}

onMounted(() => {
  loadBookmarks()
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selected.value) { selected.value = null }
}

const filteredChars = computed(() => {
  let result = chars
  if (selectedCat.value !== '全部') result = result.filter(c => c.category === selectedCat.value)
  if (search.value) {
    const q = search.value
    result = result.filter(c => c.meaning.includes(q) || c.char === q || c.category.includes(q) || c.pinyin.includes(q.toLowerCase()))
  }
  if (selectedPinyin.value) {
    result = result.filter(c => c.pinyin.charAt(0).toUpperCase() === selectedPinyin.value.toUpperCase())
  }
  if (selectedRadical.value) {
    result = result.filter(c => c.radical === selectedRadical.value)
  }
  return result
})
</script>

<style scoped>
.dict-page{max-width:1000px;margin:0 auto;padding:0 20px 60px}

/* ------ 搜索条 ------ */
.search-bar{max-width:420px;margin:0 auto;position:relative}
.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:.95rem;color:var(--ink-wash);pointer-events:none}
.search-input{width:100%;padding:12px 40px 12px 44px;border:1px solid var(--paper-dark);border-radius:50px;font-size:.95rem;outline:none;background:#fff;box-sizing:border-box;font-family:inherit;transition:border-color .3s}
.search-input:focus{border-color:var(--gold)}
.search-clear{position:absolute;right:14px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--ink-wash);font-size:1.1rem;padding:2px 6px}
.search-clear:hover{color:var(--cinnabar)}
.search-result-hint{text-align:center;color:var(--ink-wash);font-size:.85rem;margin-top:12px;animation:fadeIn .3s ease}

/* ------ 拼音检索 ------ */
.search-methods{margin-top:16px;display:flex;flex-direction:column;align-items:center;gap:10px}
.pinyin-index,.radical-index{display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:center;max-width:700px}
.pinyin-label,.radical-label{font-size:.82rem;color:var(--ink-wash);letter-spacing:1px;margin-right:4px;white-space:nowrap}
.pinyin-btn{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.75rem;padding:4px 9px;cursor:pointer;font-family:inherit;border-radius:3px;transition:all .2s;min-width:26px;text-align:center}
.pinyin-btn:hover{border-color:var(--gold);color:var(--gold)}
.pinyin-btn.active{background:var(--ink);color:var(--paper-light);border-color:var(--ink)}
.pinyin-clear{color:var(--cinnabar-light);border-color:var(--cinnabar-light);font-size:.72rem}

/* ------ 部首检索 ------ */
.radical-btn{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.8rem;padding:4px 10px;cursor:pointer;font-family:'KaiTi','STKaiti',serif;border-radius:3px;transition:all .2s;white-space:nowrap}
.radical-btn:hover{border-color:var(--gold);color:var(--gold)}
.radical-btn.active{background:var(--cinnabar);color:#fff;border-color:var(--cinnabar)}
.radical-clear{font-size:.72rem;font-family:inherit;color:var(--ink-wash)}

/* ------ 分类筛选 ------ */
.filter-bar{display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap}
.filter-tag{background:var(--paper);border:1px solid var(--paper-dark);color:var(--ink-wash);font-size:.82rem;padding:6px 18px;cursor:pointer;font-family:inherit;letter-spacing:1px;transition:all .3s}
.filter-tag:hover{border-color:var(--gold);color:var(--gold)}
.filter-tag.active{background:var(--ink);color:var(--paper-light);border-color:var(--ink)}

/* ------ 卡片网格 ------ */
.dict-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-top:24px}
.dict-card{background:#fff;border:1px solid var(--paper-dark);border-radius:var(--radius-md);padding:22px 14px 18px;text-align:center;cursor:pointer;box-shadow:var(--shadow);transition:all .3s ease;opacity:0;animation:cardIn .4s ease forwards}
@keyframes cardIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.dict-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--gold-pale)}
.dict-char{font-family:'KaiTi','STKaiti',serif;font-size:46px;color:#3d3522;line-height:1.2;margin-bottom:8px;transition:color .3s,transform .3s;background:radial-gradient(circle at 20% 30%,rgba(139,119,80,.07) 0%,transparent 40%),radial-gradient(circle at 80% 70%,rgba(139,119,80,.05) 0%,transparent 35%),linear-gradient(135deg,#f5ede0,#ece0cc 30%,#e6d8c0 60%,#f0e5d5);border:2px solid var(--gold-pale);border-radius:8px;box-shadow:inset 0 2px 4px rgba(0,0,0,.1),inset 0 -1px 0 rgba(255,255,255,.6),0 3px 8px var(--shadow);text-shadow:1px 1px 0 rgba(255,255,255,.4),-1px -1px 0 rgba(0,0,0,.15);padding:8px 16px;display:inline-block}
.dict-card:hover .dict-char{color:#2d2518;transform:scale(1.05)}
.dict-meaning{font-size:.85rem;color:var(--ink-light);letter-spacing:1px;margin-bottom:2px}
.dict-pinyin{font-size:.72rem;color:var(--gold);margin-bottom:4px}
.dict-category{font-size:.7rem;color:var(--ink-wash)}

/* ------ 空状态 ------ */
.empty-state{text-align:center;padding:60px 20px;color:var(--ink-wash)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}

/* ------ 详情浮层 ------ */
.detail-overlay{position:fixed;inset:0;background:rgba(26,26,26,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;padding:20px;overflow-y:auto}
.detail-card{background:#fff;border-radius:var(--radius-lg);padding:40px 36px 32px;text-align:center;max-width:520px;width:100%;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:modalIn .3s ease;max-height:90vh;overflow-y:auto}
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.detail-close{position:absolute;top:16px;right:20px;background:none;border:none;font-size:1.5rem;color:var(--ink-wash);cursor:pointer;padding:4px 8px;line-height:1}
.detail-close:hover{color:var(--cinnabar)}

/* ------ 收藏按钮 ------ */
.bookmark-btn{position:absolute;top:16px;left:20px;background:none;border:none;font-size:1.4rem;cursor:pointer;padding:4px 8px;line-height:1;transition:all .3s}
.heart-empty{color:var(--ink-wash);transition:all .3s}
.heart-full{color:var(--cinnabar);transition:all .3s}
.bookmark-btn:hover .heart-empty{color:var(--cinnabar-light)}
.bookmark-btn:hover .heart-full{transform:scale(1.2)}

.detail-char{font-family:'KaiTi','STKaiti',serif;font-size:88px;color:#3d3522;line-height:1;margin-bottom:6px;background:radial-gradient(circle at 15% 25%,rgba(139,119,80,.08) 0%,transparent 45%),radial-gradient(circle at 85% 75%,rgba(139,119,80,.05) 0%,transparent 40%),linear-gradient(145deg,#f5ede0,#ece0cc 30%,#e6d8c0 60%,#f0e5d5);border:2px solid var(--gold-pale);border-radius:12px;box-shadow:inset 0 3px 6px rgba(0,0,0,.12),inset 0 -2px 0 rgba(255,255,255,.6),0 4px 12px var(--shadow);text-shadow:2px 2px 0 rgba(255,255,255,.45),-2px -1px 0 rgba(0,0,0,.18);padding:12px 24px;display:inline-block}
.detail-stamp{display:inline-block;font-size:12px;color:var(--cinnabar-light);border:1px solid var(--cinnabar-light);padding:2px 12px;font-family:'KaiTi','STKaiti',serif;letter-spacing:3px;margin-bottom:4px}
.detail-pinyin{font-size:1rem;color:var(--gold);letter-spacing:2px;margin-bottom:8px}
.detail-title{font-family:'KaiTi','STKaiti',serif;font-size:1.4rem;color:var(--ink);letter-spacing:3px;margin-bottom:8px}

/* ------ 字形演变时间轴 ------ */
.evolution-section{margin-top:12px;margin-bottom:16px}
.section-label{font-size:.85rem;color:var(--ink-wash);letter-spacing:2px;margin-bottom:16px;font-weight:normal}
.evolution-timeline{position:relative;padding:8px 0 20px}
.timeline-line{position:absolute;top:14px;left:10%;right:10%;height:3px;background:var(--gold-pale);z-index:0}
.timeline-stages{display:flex;justify-content:space-between;position:relative;z-index:1}
.timeline-stage{flex:1;text-align:center;padding:0 4px;min-width:0}
.stage-dot{width:14px;height:14px;border-radius:50%;background:var(--paper-light);border:3px solid var(--gold);margin:0 auto 6px;position:relative;z-index:2}
.stage-label{font-size:.75rem;color:var(--ink);font-family:'KaiTi','STKaiti',serif;letter-spacing:1px;margin-bottom:2px}
.stage-era{font-size:.65rem;color:var(--ink-wash);margin-bottom:6px}
.stage-desc{font-size:.72rem;color:var(--ink-light);line-height:1.6;text-align:left;padding:0 2px}

/* ------ 说文解字引用 ------ */
.shuowen-section{margin-bottom:16px;text-align:left}
.shuowen-quote{margin:0;padding:12px 16px;border-left:3px solid var(--gold);background:var(--paper-light);border-radius:0 var(--radius) var(--radius) 0}
.shuowen-quote p{font-size:.85rem;color:var(--ink-light);line-height:1.9;font-style:italic;letter-spacing:1px;margin:0}

.detail-desc{font-size:.9rem;color:var(--ink);line-height:1.9;text-align:left;margin-bottom:16px}
.detail-meta{display:flex;justify-content:center;gap:20px;margin-bottom:16px;flex-wrap:wrap}
.meta-item{font-size:.85rem;color:var(--ink-wash)}
.meta-item strong{color:var(--ink);margin-right:6px}

/* ------ 移动端 ------ */
@media(max-width:500px){
  .dict-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px}
  .detail-card{padding:28px 16px 24px}
  .timeline-stages{flex-wrap:wrap;justify-content:center;gap:8px}
  .timeline-line{display:none}
  .timeline-stage{flex:0 0 auto;width:30%;margin-bottom:12px}
  .stage-desc{font-size:.7rem;text-align:center}
  .detail-meta{gap:12px}
}

.dict-rubbing-img{width:100%;height:60px;object-fit:contain;border-radius:4px;margin-bottom:4px;filter:sepia(0.35) contrast(1.1);background:rgba(245,237,224,0.5)}
.detail-rubbing-img{width:130px;height:130px;object-fit:contain;border-radius:8px;margin-bottom:12px;filter:sepia(0.35) contrast(1.1);border:1px solid var(--paper-dark);background:rgba(245,237,224,0.3)}
</style>