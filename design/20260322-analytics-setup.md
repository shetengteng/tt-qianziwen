# 网站统计集成说明

本项目集成了两套网站统计工具：Google Analytics GA4（后台分析）和不蒜子（前端计数器）。

---

## 1. Google Analytics GA4

### 当前状态

代码已集成，但使用的是占位符 `G-XXXXXXXXXX`，需要替换为你的真实 Measurement ID。

### 设置步骤

https://analytics.google.com/analytics/web/provision/?authuser=1#/provision/create

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 用你的 Google 账号登录
3. 点击左下角 **管理（Admin）** → **创建账号（Create Account）**
4. 填写账号名称（如 `tt-qianziwen`），点击下一步
5. 创建媒体资源（Property），名称填 `千字文`
6. 选择 **Web** 平台，填写网站 URL：`https://shetengteng.github.io/tt-qianziwen/`
7. 创建完成后，进入 **数据流（Data Streams）** → 点击你的 Web 数据流
8. 复制 **衡量 ID（Measurement ID）**，格式为 `G-XXXXXXXXXX`

### 替换 ID

打开 `docs/index.html`，找到以下两处，将 `G-XXXXXXXXXX` 替换为你的真实 ID：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

```javascript
gtag('config', 'G-XXXXXXXXXX');
```

### 查看数据

1. 登录 [Google Analytics](https://analytics.google.com/)
2. 左侧菜单：
   - **报告 → 实时**：查看当前在线访客
   - **报告 → 生命周期 → 获取**：查看流量来源
   - **报告 → 生命周期 → 互动**：查看页面浏览量、停留时间
   - **报告 → 用户 → 人口统计**：查看访客地理位置
   - **报告 → 用户 → 技术**：查看设备、浏览器分布

### 注意事项

- GA4 数据通常有 24-48 小时延迟（实时报告除外）
- 首次设置后需要等待几小时才能看到数据
- 如果使用广告拦截器，自己的访问可能不会被记录

---

## 2. 不蒜子（busuanzi）

### 当前状态

已集成并生效，无需额外配置。

### 功能

- 页脚显示 **总浏览次数**（PV）和 **访客人数**（UV）
- 数据由不蒜子服务端统计，自动累加
- 无需注册账号

### 查看数据

直接在网站页脚即可看到：

```
总浏览 XXX 次 · 访客 XXX 人
```

### 注意事项

- 不蒜子是免费公共服务，数据不可导出
- 偶尔可能因服务不稳定导致数字显示为 `-`
- 不蒜子不提供后台管理界面，数据仅在页面上展示
- 如果需要重置计数，无法操作（这是服务限制）

---

## 两者对比

| 特性 | Google Analytics GA4 | 不蒜子 |
|------|---------------------|--------|
| 数据详细度 | 非常详细 | 仅 PV/UV |
| 后台管理 | 有完整后台 | 无 |
| 实时数据 | 支持 | 支持 |
| 隐私合规 | 需要 Cookie 声明 | 无 Cookie |
| 可靠性 | 高 | 偶尔不稳定 |
| 费用 | 免费 | 免费 |
| 配置难度 | 需要注册 + 替换 ID | 零配置 |
