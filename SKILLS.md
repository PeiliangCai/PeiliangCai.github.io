# Skill 使用指南

这份文档是当前环境可用 skill 的速查表。目标不是解释每个 skill 的全部内部规则，而是回答三个问题：

1. 什么时候该用哪个 skill
2. 怎么触发最稳
3. 应该怎么开口描述任务

## 如何触发 Skill

通常有两种方式：

1. 显式触发  
   直接在消息开头写 `$skill-name`

   例如：
   - `$frontend-design 优化当前首页的视觉设计`
   - `$karpathy-llm-wiki 把 agent-memory-mechanisms 编入 agents topic`

2. 自然语言触发  
   不写 `$skill-name`，但任务本身明确落在某个 skill 的职责上。

   例如：
   - “帮我把这个页面改得更美观一些”
   - “把这篇 blog 整理成 wiki 页面”

推荐规则：

- **显式触发最稳**
- 一个任务跨多个领域时，可以在同一句里点名多个 skill
- 新安装或修改 skill 后，通常需要重启 Codex 才会稳定生效

## Skill 速查表

### `frontend-design`

- 用途：前端页面、组件、主题、布局、交互和整体视觉升级
- 触发方式：
  - `$frontend-design`
  - “优化页面设计”
  - “重做这个前端界面”
  - “让这个页面更美观”
- 推荐说法：
  - `$frontend-design 优化当前首页的布局、配色和移动端适配`
  - `$frontend-design 重做 Blog 页面，让它更像知识库而不是普通博客`
  - `$frontend-design 提升 Portfolio 页的项目展示质感`
- 注意事项：
  - 适合视觉、交互、信息布局相关任务
  - 不适合拿来做纯后端逻辑或数据迁移
  - 如果你对风格有明确偏好，直接写出来，例如“更克制”“更科技感”“更偏学术主页”

### `karpathy-llm-wiki`

- 用途：把 blog/source 内容沉淀为 wiki，或基于已有 wiki 做查询、归档、lint
- 触发方式：
  - `$karpathy-llm-wiki`
  - “把这篇文章加入 wiki”
  - “What do I know about X?”
  - “检查当前 wiki”
- 推荐说法：
  - `$karpathy-llm-wiki 把 agent-memory-mechanisms 编入 agents topic`
  - `$karpathy-llm-wiki 总结当前 wiki 中关于 memory 和 RAG 的关系`
  - `$karpathy-llm-wiki 对当前 wiki 做一次 lint`
- 本项目约定：
  - source layer = `src/blogs/`
  - wiki layer = `src/wiki/`
- 注意事项：
  - 现在这个 skill 已经被改造成适配当前项目，不再默认使用 `raw/` 和 `wiki/`
  - wiki 文章来源字段使用 `Blog:`，不是 `Raw:`
  - 遇到具体值时，wiki 页面应追加内联索引，格式是 `值 [Blog: <slug>#<anchor>]`

### `imagegen`

- 用途：生成新图片，或编辑已有图片
- 触发方式：
  - “生成一张图片”
  - “把这张图改成另一种风格”
  - “给网站做一张背景图”
- 推荐说法：
  - `生成一张适合个人主页首屏的科技感背景图`
  - `把这张头像图改成更统一的深色风格`
- 注意事项：
  - 适合位图资产，不适合替代 HTML/CSS 直接做页面布局
  - 如果只是改前端样式，优先用 `frontend-design`

### `openai-docs`

- 用途：查询 OpenAI 官方文档、模型选择、API 用法、官方升级路径
- 触发方式：
  - “查一下 OpenAI 官方文档”
  - “现在该用哪个 OpenAI 模型”
  - “OpenAI Responses API 怎么用”
- 推荐说法：
  - `查一下 OpenAI 官方文档，看看现在最适合长上下文推理的模型是什么`
  - `基于官方文档解释 Chat Completions 和 Responses API 的区别`
- 注意事项：
  - 这个 skill 偏官方资料查询
  - 它不是你项目自己的 wiki，也不是通用网页搜索替代品

### `plugin-creator`

- 用途：创建或整理 Codex plugin 结构
- 触发方式：
  - “创建一个 Codex plugin”
  - “帮我生成 plugin 骨架”
  - `$plugin-creator`
- 推荐说法：
  - `$plugin-creator 为这个项目创建一个最小可用的 Codex plugin`
- 注意事项：
  - 只在你真的要做 Codex plugin 时才需要
  - 普通前端页面、博客、wiki 任务一般用不到

### `skill-creator`

- 用途：创建新的 skill，或重构已有 skill 的规则
- 触发方式：
  - “帮我做一个新的 skill”
  - “把这个工作流封装成 skill”
  - `$skill-creator`
- 推荐说法：
  - `$skill-creator 为论文阅读总结创建一个新 skill`
  - `$skill-creator 重构当前的 karpathy-llm-wiki skill 说明`
- 注意事项：
  - 当你发现某类重复工作总要反复解释时，就适合把它抽成 skill

### `skill-installer`

- 用途：列出可安装 skill，或从 GitHub 安装新 skill
- 触发方式：
  - “安装一个 skill”
  - “有哪些可以安装的 skill”
  - `$skill-installer`
- 推荐说法：
  - `$skill-installer 安装一个和前端页面设计相关的 skill`
  - `$skill-installer 列出当前可安装的官方 skill`
- 注意事项：
  - 安装完成后通常需要重启 Codex
  - 如果是第三方 skill，最好说明仓库来源

## 推荐写法示例

下面这些说法最稳，基本不会触发歧义：

- `$frontend-design 优化当前站点的暗色模式、移动端布局和导航视觉`
- `$karpathy-llm-wiki 把 src/blogs/agent-memory-mechanisms.md 编入 src/wiki/agents/agent-memory.md`
- `$karpathy-llm-wiki 对当前 wiki 做一次 lint，并检查具体值索引是否失效`
- `$skill-installer 安装一个适合知识库整理的 skill`
- `$skill-creator 为这个项目设计一个“论文笔记到 wiki”工作流 skill`
- `查一下 OpenAI 官方文档，确认现在推荐的 API 用法`

## 使用建议

- 如果你已经知道要用哪个 skill，直接写 `$skill-name`
- 如果你只知道目标，不知道 skill 名，也可以直接说任务
- 如果任务里既要“改界面”又要“整理知识”，可以明确写两个 skill：
  - `$frontend-design` + `$karpathy-llm-wiki`
- 如果你觉得一个工作流经常重复，可以考虑把它升级成新 skill，而不是每次重新解释
