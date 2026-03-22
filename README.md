# 千字文 · Thousand Character Classic

千字文全文在线阅读，含拼音注音与白话文注释。古典水墨风格，响应式设计。

**在线访问**: [https://shetengteng.github.io/tt-qianziwen/](https://shetengteng.github.io/tt-qianziwen/)

## 功能

- 千字文全文展示（250 句，125 组对仗，共 1000 字）
- 每字拼音注音（`<ruby>` 标签）
- 白话文注释 + 可展开详细注释
- 搜索高亮（支持汉字、拼音、注释内容）
- 每日一句 / 随机换一句
- 亮色 / 暗色模式切换
- 拼音开关、注释开关
- 响应式布局（桌面 / 平板 / 手机）

## 技术栈

| 项目 | 选择 |
|------|------|
| 框架 | Vue 3 CDN |
| 样式 | 纯 CSS + CSS 变量（shadcn 风格） |
| 字体 | Noto Serif SC + Noto Sans SC |
| 数据 | JSON + JS fallback |
| 部署 | GitHub Pages（`docs/` 目录） |

## 项目结构

```
docs/
├── index.html              # 主页面
├── css/style.css           # 样式
├── js/
│   ├── app.js              # Vue 3 应用逻辑
│   └── qianziwen-data.js   # 数据 fallback
└── data/qianziwen.json     # 千字文数据（主数据源）
```

## 本地运行

```bash
cd docs
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## License

MIT
