# QuanDB - Quantumult X Data Manager

**QuanDB** 是一个专为 **Quantumult X** 设计的轻量级、移动端优先的数据管理工具。
它允许你通过 Web 界面直接查看、编辑、添加和删除 QX 的持久化存储数据 (`$prefs`)。

## ✨ 特性

- **📱 移动端优先设计**：完美适配 iOS，支持深色模式 (Dark Mode)。
- **🚀 极致性能**：
  - **惰性渲染 (Lazy Rendering)**：由纯文本预览，点击按钮才解析和高亮 JSON，解决大数据量导致的页面卡顿。
  - **按需加载**：手风琴交互模式，展开某项时才从后端拉取最新数据，保证数据实时性。
- ** 原生体验 (Web App)**：支持添加到 iOS 主屏幕，自动隐藏浏览器地址栏，适配刘海屏，体验如同原生 App。
- **🛠 全功能管理**：
  - 查看 (View) / 编辑 (Edit) / 新增 (Add) / 删除 (Delete)。
  - 智能 JSON 格式化与语法高亮。
  - 支持“关注列表”机制，只显示你关心的 Key。

## 📥 安装方法

### 配置 Quantumult X

在 Quantumult X 的配置文件中找到 `[http_backend]` 字段（如果没有请手动添加），加入以下配置：

```conf
[http_backend]
[https://raw.githubusercontent.com/Neurocoda/QuanDB/main/QX_DB_Manager.js](https://raw.githubusercontent.com/Neurocoda/QuanDB/main/QX_DB_Manager.js), tag=QuanDB, path=^/db/, enabled=true
```

### 📱 效果展示

<p align="center">
  <img src="https://github.com/user-attachments/assets/2ebfcd86-f254-4361-9005-13c0301100ce" alt="添加为 Web APP" width="320" />
  &nbsp;&nbsp;&nbsp; <img src="https://github.com/user-attachments/assets/a5e2568f-fa6e-407f-911b-0e5ace885f92" alt="界面展示" width="320" />
</p>
