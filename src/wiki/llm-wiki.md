---
title: LLM-wiki 工作流
category: Knowledge System
tags: [LLM, Wiki, Knowledge Management]
updated: 2026-04-29
summary: 将长文、资料和项目笔记整理为由 LLM 辅助维护的 Markdown wiki，并通过本站提供阅读入口。
source: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
---

# LLM-wiki 工作流

LLM-wiki 的核心不是一个固定软件，而是一种内容维护方式：把原始材料、链接、笔记和代码资料交给 LLM 辅助整理，再产出一组互相链接的 Markdown wiki 页面。

本站的 Wiki 区域可以作为这组 Markdown 页面的前端。内容仍然保存在仓库中，部署后可以像 Blog 一样被浏览、分类和链接。

## 推荐结构

- `src/wiki/*.md`：面向读者的 wiki 页面。
- `src/blogs/*.md`：更完整的文章、教程、记录。
- 原始资料可以暂时放在外部文档或私有目录中，由 LLM 辅助提炼后再提交到 `src/wiki`。

## 适合放进 Wiki 的内容

1. 概念解释：例如 Agentic RAG、Self-RAG、多智能体规划。
2. 项目索引：记录系统架构、模块边界、关键决策。
3. 论文笔记：整理问题、方法、实验结论和局限。
4. 常用命令和配置：保留可复用的工程知识。

## 与 Blog 的关系

Blog 更适合线性长文，Wiki 更适合持续更新的知识节点。一个主题可以先在 Wiki 中维护结构化知识，成熟后再扩展为 Blog 文章。
