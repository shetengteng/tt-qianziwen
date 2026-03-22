# 千字文静态网页 - 实现方案

> 架构参考：maozhuxiyulu 项目（Vue 3 CDN + 原生 CSS + JSON 数据分离）

## 1. 项目概述

构建一个展示《千字文》全文的静态网页，包含汉字原文与拼音注音，整体设计采用 shadcn 风格，字体古典优雅。

### 核心需求

- 千字文全文展示（250 句，每句 4 字，共 1000 字）
- 每个汉字上方标注拼音（`<ruby>` + `<rt>`）
- **每组对仗句附带注释**（白话文释义，点击/展开查看）
- 古典优雅的视觉风格 + shadcn 设计语言
- 响应式布局，适配桌面与移动端
- 暗色模式、拼音开关、注释开关、搜索高亮

---

## 2. 技术选型

> 对齐 maozhuxiyulu 架构：Vue 3 CDN + 纯 CSS 变量 + JSON 数据

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | Vue 3 CDN (`vue.global.prod.js`) | 与参考项目一致，轻量响应式 |
| 样式 | 纯 CSS + CSS 变量（shadcn 设计规范） | 与参考项目一致，无构建工具依赖 |
| 字体 | Noto Serif SC (汉字) + Noto Sans SC (拼音/正文) | 古典优雅，中文支持完善 |
| 拼音标注 | HTML `<ruby>` + `<rt>` 标签 | 语义化，浏览器原生支持 |
| 数据 | JSON 文件 + JS fallback（双保险） | 与参考项目一致 |
| 部署 | GitHub Pages（docs/ 目录） | 免费静态托管，与参考项目一致 |

---

## 3. 设计系统

### 3.1 配色方案

采用中国传统水墨配色，融合 shadcn 的简洁现代感。通过 CSS 变量实现亮/暗模式切换：

```css
:root {
  /* 水墨色系 */
  --ink-900: #1a1a2e;       /* 深墨色 - 汉字 */
  --ink-700: #2d2d44;       /* 墨色 - 标题 */
  --ink-500: #4a4a68;       /* 灰墨色 - 正文 */
  --ink-300: #6b7280;       /* 中灰 - 拼音 */
  --sienna: #8B4513;        /* 赭石色 - 强调/hover */
  --sienna-light: #A0522D;  /* 浅赭石 - 标签 */
  --paper-50: #faf8f5;      /* 宣纸色 - 背景 */
  --paper-100: #f5f0eb;     /* 浅宣纸 - 卡片 */
  --warm-200: #e8e4df;      /* 暖灰 - 边框 */

  /* 语义变量（与 maozhuxiyulu 对齐） */
  --bg: var(--paper-50);
  --bg-card: #ffffff;
  --bg-card-alpha: rgba(255, 255, 255, 0.92);
  --bg-nav: rgba(250, 248, 245, 0.85);
  --text-primary: var(--ink-900);
  --text-secondary: var(--ink-500);
  --text-muted: var(--ink-300);
  --border: var(--warm-200);
  --border-light: var(--paper-100);
  --accent: var(--sienna);
  --accent-bg: rgba(139, 69, 19, 0.08);
  --font-serif: 'Noto Serif SC', 'Songti SC', serif;
  --font-sans: 'Noto Sans SC', 'PingFang SC', sans-serif;
}

html.dark {
  --bg: #0f0e0d;
  --bg-card: #1a1918;
  --bg-card-alpha: rgba(26, 25, 24, 0.92);
  --bg-nav: rgba(15, 14, 13, 0.85);
  --text-primary: #f5f0eb;
  --text-secondary: #a8a29e;
  --text-muted: #78716c;
  --border: #292524;
  --border-light: #1c1917;
  --accent: #CD853F;
  --accent-bg: rgba(205, 133, 63, 0.12);
}
```

### 3.2 字体方案

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500&display=swap');
```

| 用途 | 字体 | 字重 |
|------|------|------|
| 汉字（正文） | Noto Serif SC | 400-600 |
| 标题 | Noto Serif SC | 700 |
| 拼音 | Noto Sans SC | 300-400 |
| UI 元素 | Noto Sans SC | 400-500 |

### 3.3 间距与尺寸

```
汉字大小:   桌面 2.25rem / 平板 2rem / 移动 1.75rem
拼音大小:   桌面 0.75rem / 平板 0.7rem / 移动 0.625rem
句间距:     桌面 2.5rem / 移动 1.5rem
段间距:     桌面 3rem / 移动 2rem
每行句数:   桌面 2句(8字) / 移动 1句(4字)
内容最大宽: 960px
```

---

## 4. 页面结构

### 4.1 整体布局

```
┌──────────────────────────────────────────────────────────────────┐
│                    NAVBAR (fixed, blur)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ☆ 千字文                [拼音] [注释] [暗色] [全文]       │  │
│  │    Thousand Character Classic                              │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    HERO (100vh, centered)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    hero-card-unified                        │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │              ─── 千 字 文 ───                        │  │  │
│  │  │           Thousand Character Classic                 │  │  │
│  │  │                                                      │  │  │
│  │  │           ☆ 每日一句 · Daily Verse                   │  │  │
│  │  │                                                      │  │  │
│  │  │          tiān  dì  xuán huáng                        │  │  │
│  │  │           天   地   玄   黄                           │  │  │
│  │  │          yǔ  zhòu hóng huāng                        │  │  │
│  │  │           宇   宙   洪   荒                           │  │  │
│  │  │                                                      │  │  │
│  │  │  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │  │  │
│  │  │  天是青黑色的，地是黄色的。                          │  │  │
│  │  │  宇宙形成于混沌蒙昧的状态中。                        │  │  │
│  │  │                                                      │  │  │
│  │  │           南朝梁 · 周兴嗣 编纂                       │  │  │
│  │  │                                                      │  │  │
│  │  │         [换一句]  [浏览全文]                          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │                       ∨ (scroll hint)                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    FULLTEXT SECTION                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  全文 · Full Text                          250 句          │  │
│  │                                                            │  │
│  │  [搜索框: 搜索汉字或拼音...]                               │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  VERSE PAIR (上下句对仗)                             │  │  │
│  │  │                                                      │  │  │
│  │  │   tiān  dì  xuán huáng     yǔ  zhòu hóng huāng     │  │  │
│  │  │    天   地   玄   黄        宇   宙   洪   荒        │  │  │
│  │  │                                                      │  │  │
│  │  │   rì  yuè  yíng  zè       chén  xiù  liè zhāng     │  │  │
│  │  │    日   月   盈   昃        辰   宿   列   张        │  │  │
│  │  │                                                      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (段落分隔) ─ ─ ─ ─ ─ ─ ─ ─   │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │   hán  lái  shǔ  wǎng    qiū shōu dōng cáng       │  │  │
│  │  │    寒   来   暑   往        秋   收   冬   藏        │  │  │
│  │  │                                                      │  │  │
│  │  │   rùn  yú  chéng  suì     lǜ   lǚ  tiáo yáng      │  │  │
│  │  │    闰   余   成   岁        律   吕   调   阳        │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ···  (共 125 组对仗句)                                    │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                         FOOTER                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  千字文 · 中华经典蒙学读物                                 │  │
│  │  Thousand Character Classic · Since 6th Century            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 正文排版详细原型（桌面端 - 每行 2 句对仗 + 注释）

```
┌──────────────────────────────────────────────────────────────────────┐
│  verse-pair (卡片)                                                   │
│                                                                      │
│    tiān  dì  xuán huáng     yǔ  zhòu hóng huāng                    │
│     天   地   玄   黄        宇   宙   洪   荒                      │
│                                                                      │
│    rì  yuè  yíng  zè       chén  xiù  liè zhāng                    │
│     日   月   盈   昃        辰   宿   列   张                      │
│                                                                      │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │
│  📖 天是青黑色的，地是黄色的。宇宙形成于混沌蒙昧的状态中。          │
│     [展开详细注释 ∨]                                                 │
│                                                                      │
│  ┌ (展开后) ─────────────────────────────────────────────────────┐   │
│  │ 玄，指天的颜色，青黑色。黄，指地的颜色。                      │   │
│  │ 洪荒，指混沌蒙昧的状态，传说中天地开辟之前的景象。            │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (段落间距) ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

┌──────────────────────────────────────────────────────────────────────┐
│  verse-pair (卡片)                                                   │
│                                                                      │
│    hán  lái  shǔ  wǎng    qiū shōu dōng cáng                      │
│     寒   来   暑   往        秋   收   冬   藏                      │
│                                                                      │
│    rùn  yú  chéng  suì     lǜ   lǚ  tiáo yáng                     │
│     闰   余   成   岁        律   吕   调   阳                      │
│                                                                      │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄   │
│  📖 寒暑循环变换，来了又去。秋天收割庄稼，冬天储藏粮食。            │
│     [展开详细注释 ∨]                                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**注释展示规则：**
- 简要释义（`note`）默认显示在对仗句下方，字号 0.8125rem，颜色 `var(--text-secondary)`
- 详细注释（`note_detail`）默认折叠，点击"展开"按钮显示
- 提供全局"注释开关"按钮，可一键隐藏/显示所有注释
- 注释区域与诗句区域通过细虚线分隔

### 4.3 单字 Ruby 标注结构

```
     ┌─────────┐
     │  tiān   │  ← <rt> 拼音，0.75rem，var(--text-muted)
     │         │
     │   天    │  ← <ruby> 汉字，2.25rem，var(--text-primary)
     │         │
     └─────────┘

HTML 结构:
<ruby class="char">天<rt>tiān</rt></ruby>
```

### 4.4 移动端布局（每行 1 句）

```
┌──────────────────────────┐
│                          │
│   tiān  dì  xuán huáng   │
│    天   地   玄   黄      │
│                          │
│   yǔ  zhòu hóng huāng   │
│    宇   宙   洪   荒      │
│                          │
│   rì  yuè  yíng  zè     │
│    日   月   盈   昃      │
│                          │
│   chén xiù  liè zhāng   │
│    辰   宿   列   张      │
│                          │
└──────────────────────────┘
```

---

## 5. 项目结构

> 对齐 maozhuxiyulu 的 docs/ 部署目录结构

```
tt-qianziwen/
├── docs/                              # GitHub Pages 部署目录
│   ├── index.html                     # 主页面（Vue 3 模板）
│   ├── css/
│   │   └── style.css                  # 全量样式（CSS 变量 + 组件样式）
│   ├── js/
│   │   ├── app.js                     # Vue 3 应用逻辑
│   │   └── qianziwen-data.js          # 千字文数据 fallback
│   ├── data/
│   │   └── qianziwen.json             # 千字文数据（主数据源）
│   └── img/
│       └── favicon.svg                # 网站图标
├── docs/                              # 文档目录
│   └── 20260322-implementation-plan.md
└── design/
```

### 5.1 数据结构设计

```json
[
  {
    "id": 1,
    "line1": ["天", "地", "玄", "黄"],
    "pinyin1": ["tiān", "dì", "xuán", "huáng"],
    "line2": ["宇", "宙", "洪", "荒"],
    "pinyin2": ["yǔ", "zhòu", "hóng", "huāng"],
    "note": "天是青黑色的，地是黄色的。宇宙形成于混沌蒙昧的状态中。",
    "note_detail": "玄，指天的颜色，青黑色。黄，指地的颜色。洪荒，指混沌蒙昧的状态，传说中天地开辟之前的景象。"
  },
  {
    "id": 2,
    "line1": ["日", "月", "盈", "昃"],
    "pinyin1": ["rì", "yuè", "yíng", "zè"],
    "line2": ["辰", "宿", "列", "张"],
    "pinyin2": ["chén", "xiù", "liè", "zhāng"],
    "note": "太阳有正有斜，月亮有圆有缺。星辰布满在无边的太空中。",
    "note_detail": "盈，月光圆满。昃，太阳西斜。辰宿，星辰。列张，分布排列。"
  }
]
```

每条记录 = 一组对仗句（上句 line1 + 下句 line2），共 125 条。

**注释字段说明：**
- `note`: 白话文简要释义（默认展示）
- `note_detail`: 详细注释，含逐字解释和典故出处（展开查看）

### 5.2 index.html 核心结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>千字文 · Thousand Character Classic</title>
  <link rel="stylesheet" href="./css/style.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
</head>
<body>
  <div id="app">
    <!-- Navbar: 固定顶部, 毛玻璃, 品牌 + 操作按钮 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">...</nav>

    <!-- Hero: 100vh, 居中卡片, 每日一句 -->
    <section class="hero">
      <div class="hero-card-unified">
        <!-- 每日随机对仗句 + 换一句按钮 -->
      </div>
    </section>

    <!-- 全文: 搜索 + 对仗句网格 + 注释 -->
    <section id="fulltext-section" class="fulltext-section">
      <div class="search-wrapper">...</div>
      <div class="verses-container">
        <div class="verse-pair anim-fade-up" v-for="pair in filteredVerses" :key="pair.id">
          <!-- 上句 -->
          <div class="verse-line">
            <ruby v-for="(char, i) in pair.line1" class="char">
              {{ char }}<rt v-show="showPinyin">{{ pair.pinyin1[i] }}</rt>
            </ruby>
          </div>
          <!-- 下句 -->
          <div class="verse-line">
            <ruby v-for="(char, i) in pair.line2" class="char">
              {{ char }}<rt v-show="showPinyin">{{ pair.pinyin2[i] }}</rt>
            </ruby>
          </div>
          <!-- 注释区域 -->
          <div class="verse-note" v-if="showNotes && pair.note">
            <p class="note-brief">{{ pair.note }}</p>
            <button class="note-toggle" @click="toggleDetail(pair.id)"
              v-if="pair.note_detail">
              {{ expandedNotes.has(pair.id) ? '收起' : '展开详细注释' }}
            </button>
            <p class="note-detail" v-if="expandedNotes.has(pair.id)">
              {{ pair.note_detail }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">...</footer>
  </div>

  <script src="./js/qianziwen-data.js"></script>
  <script src="./js/app.js"></script>
</body>
</html>
```

### 5.3 app.js 核心逻辑（对齐 maozhuxiyulu 模式）

```javascript
const { createApp, ref, computed, onMounted, watch, nextTick } = Vue;

const app = createApp({
  setup() {
    const verses = ref([]);           // 全部对仗句
    const searchQuery = ref('');       // 搜索关键词
    const currentVerse = ref(null);    // Hero 当前展示句
    const isScrolled = ref(false);     // 导航栏滚动状态
    const isDark = ref(false);         // 暗色模式
    const showPinyin = ref(true);      // 拼音开关
    const showNotes = ref(true);       // 注释开关
    const expandedNotes = ref(new Set()); // 展开的详细注释 ID 集合
    const isAnimating = ref(false);    // 动画状态

    const filteredVerses = computed(() => {
      /* 搜索过滤：匹配汉字、拼音、注释内容 */
    });

    function getDailyVerse() { /* 每日随机句 */ }
    function nextVerse() { /* 换一句 */ }
    function toggleDark() { /* 暗色模式切换 */ }
    function togglePinyin() { /* 拼音显隐 */ }
    function toggleNotes() { /* 注释显隐 */ }
    function toggleDetail(id) { /* 展开/收起单条详细注释 */ }
    function scrollToFulltext() { /* 滚动到全文 */ }

    onMounted(async () => {
      // 1. 恢复暗色模式偏好
      // 2. 加载 JSON 数据（fallback 到 JS 内联）
      // 3. 设置每日一句
      // 4. 监听滚动
      // 5. 初始化滚动动画
    });

    return { /* 暴露所有响应式数据和方法 */ };
  }
});

app.mount('#app');
```

---

## 6. 交互功能

| 功能 | 优先级 | 说明 | 参考 maozhuxiyulu |
|------|--------|------|-------------------|
| 每日一句 | P0 | Hero 区随机展示一组对仗句 + 注释 | ✅ getDailyQuote |
| 换一句 | P0 | 随机切换 Hero 展示句 | ✅ nextQuote |
| 拼音开关 | P0 | 切换显示/隐藏拼音 | 新增 |
| **注释展示** | **P0** | **每组对仗句下方显示白话文释义** | **新增** |
| **注释开关** | **P0** | **全局切换注释显示/隐藏** | **新增** |
| **详细注释展开** | **P1** | **点击展开逐字解释和典故出处** | **新增** |
| 搜索高亮 | P0 | 输入汉字、拼音或注释内容，过滤匹配句 | ✅ searchQuery |
| 暗色模式 | P0 | 深色背景 + 浅色文字 | ✅ toggleDark |
| 滚动动画 | P1 | 段落进入视口时淡入 | ✅ IntersectionObserver |
| 字体大小调节 | P2 | 小/中/大 三档切换 | 新增 |

---

## 7. 响应式断点

```
桌面 (≥1024px):  每行 2 句对仗（8字），汉字 2.25rem，max-width: 960px
平板 (≥768px):   每行 2 句对仗（8字），汉字 2rem
手机 (<768px):    每行 1 句（4字），汉字 1.75rem，隐藏 navbar-subtitle
极小 (<480px):    汉字 1.5rem，按钮全宽
```

---

## 8. 性能考虑

- **字体加载**: `font-display: swap` 防止 FOIT，系统宋体作为 fallback
- **数据双保险**: JSON fetch + JS fallback（与 maozhuxiyulu 一致）
- **滚动动画**: IntersectionObserver 懒触发，`prefers-reduced-motion` 降级
- **无构建工具**: 纯 CDN + 原生 CSS，零构建依赖
- **GitHub Pages**: docs/ 目录直接部署

---

## 9. 实施步骤

| 阶段 | 内容 | 预估时间 |
|------|------|----------|
| Phase 1 | 准备千字文完整数据（125 组对仗句 JSON） | 30min |
| Phase 2 | 搭建 docs/ 目录结构 + index.html 骨架 | 20min |
| Phase 3 | 编写 style.css（CSS 变量 + 组件样式 + 暗色模式） | 40min |
| Phase 4 | 编写 app.js（Vue 3 逻辑：数据加载、搜索、切换） | 40min |
| Phase 5 | 正文排版（ruby 标注 + 响应式网格 + 段落分隔） | 30min |
| Phase 6 | 细节打磨（动画、hover、skeleton、scroll-hint） | 20min |
