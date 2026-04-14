---
title: 深入理解 Agentic RAG：从理论到落地
date: 2024-04-14
category: 大模型工程
tags: [RAG, AI-Agent, LLM]
---

# 深入理解 Agentic RAG：从理论到落地

在传统 RAG (Retrieval-Augmented Generation) 体系中，检索和生成往往是线性的。而 **Agentic RAG** 引入了“智能体”的概念，让系统具备了自我反思、动态规划和工具调用的能力。

## 为什么需要 Agentic RAG？

传统的 RAG 在处理以下问题时表现不佳：
1. **复杂问题**：需要多次检索和推理才能回答。
2. **知识噪声**：检索到的内容可能无关紧要。
3. **幻觉控制**：生成内容可能偏离事实。

## 核心架构

```python
def agentic_rag_loop(query):
    # 动态规划
    plan = planner.create_plan(query)
    
    # 迭代检索
    for step in plan:
        context = retriever.search(step)
        # 自我反思
        if not evaluator.is_relevant(context):
            continue
```

## 总结

Agentic RAG 不是简单的检索+生成，而是一场关于“思维链路”的革新。
