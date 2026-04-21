---
title: 开源版 Claude Design — 自带密钥、本地优先、Apache-2.0
description: 寻找 Claude Design 的开源替代方案？Open CoDesign 就是——自托管、多模型 BYOK、本地优先、Apache-2.0，支持 macOS、Windows、Linux。
head:
  - - meta
    - property: og:title
      content: 开源版 Claude Design — Open CoDesign
  - - meta
    - property: og:description
      content: Open CoDesign 是开源版 Claude Design。自托管、BYOK、本地优先。Anthropic、OpenAI、Gemini、DeepSeek、Ollama 任选。
---

# 开源版 Claude Design

**Open CoDesign** 是开源版 Claude Design——Anthropic Claude Design 的开源替代方案。一个桌面 AI 设计工具：输入提示词，几秒钟生成 HTML 原型、React 组件、幻灯片、PDF、营销素材——全部在你的电脑上运行，用你已经付费的任意 AI 模型。Apache-2.0 协议。

[下载 macOS / Windows / Linux 版 →](https://github.com/OpenCoworkAI/open-codesign/releases) · [快速开始（90 秒）](./quickstart) · [在 GitHub 上 Star](https://github.com/OpenCoworkAI/open-codesign)

## 为什么要用开源版 Claude Design？

Anthropic 的 Claude Design 本身是个好产品，但它强制三件事并不适合所有团队：

1. **订阅锁定**——$200/月且有流量上限，草稿阶段也没法控制成本
2. **单一模型上限**——只能用 Claude Opus，没有 GPT、Gemini、本地模型
3. **云端处理**——每个提示、每个设计都上传到 Anthropic 的服务器，没有完整的导出、没有版本历史、没有代码库感知

Open CoDesign 是为了需要 BYOK 成本控制、多模型灵活性、或数据本地隐私的团队准备的开源替代方案。

## Open CoDesign vs Claude Design

|                       | Open CoDesign（开源）       | Claude Design |
| --------------------- | :-------------------------: | :-----------: |
| 协议                  | **Apache-2.0**              | 闭源          |
| 运行环境              | **本地（macOS / Windows / Linux）** | 云端（浏览器） |
| 支持模型              | **任意——Anthropic、OpenAI、Gemini、DeepSeek、OpenRouter、SiliconFlow、Ollama、OpenAI 兼容** | 仅 Anthropic Opus |
| Keyless 代理          | **支持（IP 白名单）**       | 不支持        |
| 配置导入              | **Claude Code + Codex，一键** | 不支持      |
| 内置设计 skill        | **12 个模块（幻灯片、仪表盘、落地页……）** | 无 |
| 内置 demo             | **15 个即用模板**           | 空白画布      |
| 数据位置              | **本机 SQLite**             | Anthropic 服务器 |
| 版本历史              | **本地快照**                | 无            |
| 导出                  | **HTML、PDF、PPTX、ZIP、Markdown** | HTML     |
| 行内元素评论          | **支持（AI 只重写该区域）** | 不支持        |
| AI 可调滑块           | **支持**                    | 不支持        |
| 响应式框架            | **手机 / 平板 / 桌面**      | 有限          |
| 价格                  | **免费（仅 token 成本）**   | 订阅制        |

## 你会得到什么

- **任意 API Key**——Anthropic Claude、OpenAI GPT、Google Gemini、DeepSeek、OpenRouter、SiliconFlow、本地 Ollama，或任意 OpenAI 兼容端点
- **一键导入 Claude Code 或 Codex 配置**——provider、model、Key 一次带过来
- **12 个内置设计 skill 模块**——幻灯片、仪表盘、落地页、SVG 图表、玻璃质感、编辑排版、Hero、定价、页脚、聊天 UI、数据表格、日历
- **15 个 demo 提示词**，EN + 简体中文——落地页、仪表盘、演讲幻灯片、定价页、移动应用、聊天 UI、日历、收据、作品集、设置面板等等
- **行内评论 → AI 局部改写**——在预览中点击任意元素留下评论，模型只重写该区域
- **AI 生成可调滑块**——模型主动给出值得调的参数（颜色、间距、字体），拖动即可微调
- **手机 / 平板 / 桌面响应式框**——真实响应式预览，一键切换
- **五种导出**——HTML（内联 CSS）、PDF（本机 Chrome）、PPTX、ZIP、Markdown，全部本地生成
- **设置 4 个 tab**——Models、Appearance（深浅色 + EN/ZH）、Storage、Advanced
- **默认零遥测**——SQLite 保存设计，Electron `safeStorage` 加密保存密钥

## 这是 Claude Design 的 fork 吗？

不是。Open CoDesign 是一个独立的 clean-room 开源项目，受 Claude Design 启发，但没有使用任何 Anthropic 私有代码。"Claude Design" 名字属于 Anthropic；我们是开源替代方案，与 Anthropic 无关联。

## 安装

- [下载预构建安装包](https://github.com/OpenCoworkAI/open-codesign/releases)——macOS DMG、Windows EXE、Linux AppImage
- [90 秒快速开始](./quickstart)——从提示词到导出
- [从源码构建](./quickstart#从源码构建)——Node 22 LTS + pnpm 9.15+

## 常见问题

- **真的免费吗？** 是。你只需向你自带的模型 provider 支付 token 成本。
- **会上传数据到云吗？** 只会把你发送的提示词发给你自己配置的 provider。数据不会流向 OpenCoworkAI 或任何共享后端。
- **能用 Ollama 吗？** 能。任何 OpenAI 兼容端点都可以，keyless 代理也支持。
- **能自托管吗？** 它就是桌面应用——本身就完全跑在你电脑上。
- **什么协议？** Apache-2.0。可 Fork、可商用、可分发，保留 NOTICE 即可。

准备好尝试开源版 Claude Design 了？[立即下载 Open CoDesign →](https://github.com/OpenCoworkAI/open-codesign/releases)
