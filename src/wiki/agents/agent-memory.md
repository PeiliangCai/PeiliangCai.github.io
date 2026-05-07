---
title: Agent Memory
category: Agents
tags: [AI-Agent, Memory, LLM, RAG]
updated: 2026-05-07
summary: Agent 记忆机制的分层结构、写入策略、召回机制，以及它和 RAG 的关系。
source: /blog/agent-memory-mechanisms
---

# Agent Memory

> Sources: Peiliang Cai, 2026-05-07
> Blog: [agent-memory-mechanisms](../../blogs/agent-memory-mechanisms.md)

## Overview

Agent memory is the mechanism that lets an agent preserve continuity across turns, tasks, and sessions. A usable memory system does not simply replay the full chat history. It chooses what is worth storing, stores it in the right layer, and retrieves a small amount of relevant context when needed.

## Memory Layers

### Working Memory

Working memory is the short-lived task state kept close to the active context window. It typically includes the goal, constraints, completed steps, tool outputs, and unresolved questions for the current task.

This layer is cheap to read and highly relevant to the current turn, but it is capacity-limited. For engineering work, structured task state is usually more stable than relying on raw conversation history alone.

### Long-Term Memory

Long-term memory stores information that remains useful across tasks and sessions. Typical examples include:

- user preferences
- project conventions
- recurring environment issues
- reusable domain knowledge

This layer should usually be retrieved rather than pasted wholesale into the prompt. Common storage forms include structured records, vector databases, and markdown wiki pages.

### Episodic Memory

Episodic memory records what happened in a specific task or session: the user's request, the actions taken, the failures encountered, and the final resolution.

It is useful for retrospection and for avoiding repeated mistakes. In practice, build failures, deployment incidents, or toolchain conflicts often belong here before they are abstracted into more stable guidance.

### Semantic Memory

Semantic memory captures generalized knowledge distilled from repeated experience. Instead of storing the full event, it stores the rule or fact that can transfer to future tasks.

Examples include architectural constraints, deployment rules, and security boundaries. This layer is usually more durable than episodic logs because it is less tied to a single conversation.

### Procedural Memory

Procedural memory stores how work should be done. It is the layer for repeatable workflows, engineering checklists, and operating conventions.

Typical examples include:

- inspect data flow before refactoring a view
- verify mobile text fit after UI changes
- distinguish source errors from local environment errors before debugging build failures

Procedural memory fits well in agent instructions, project docs, and wiki pages.

## Write Policy

Not everything should be written into long-term memory. Information is worth storing when it is likely to be reused, captures an explicit user preference, explains an important decision, prevents repeated failure, or describes a stable property of the project.

Transient logs, unverified guesses, and one-off intermediate states should usually stay out of long-term memory.

## Recall Strategy

Memory quality depends as much on recall as on storage. A practical retrieval flow filters candidates by project context, ranks by relevance and recency, and injects only a small set of high-value memories into the active context.

Poor recall can either flood the prompt with irrelevant material or omit the exact experience that would have improved the agent's next step.

## Relationship to RAG

Memory and RAG overlap but are not the same thing.

- RAG emphasizes retrieving facts from an external knowledge base.
- Memory emphasizes continuity across the user, the task, and the operating environment.

In a larger agent system, RAG often retrieves documents while memory preserves preferences, task state, and accumulated operational experience.

## Recommended Structure

A practical agent memory system can be divided into four layers [Blog: agent-memory-mechanisms#9-一个推荐架构]:

- Working Memory [Blog: agent-memory-mechanisms#9-一个推荐架构]
- Episodic Memory [Blog: agent-memory-mechanisms#9-一个推荐架构]
- Semantic Memory [Blog: agent-memory-mechanisms#9-一个推荐架构]
- Procedural Memory [Blog: agent-memory-mechanisms#9-一个推荐架构]

For a personal knowledge site, a good baseline is:

- use blog posts for long-form reasoning [Blog: agent-memory-mechanisms#9-一个推荐架构]
- use wiki pages for stable concepts [Blog: agent-memory-mechanisms#9-一个推荐架构]
- keep project conventions in docs and structured data [Blog: agent-memory-mechanisms#2-长期记忆跨会话复用的知识]
- ask after each task whether anything should be promoted into the wiki

## See Also

- [LLM-wiki 工作流](../llm-wiki.md)
- [LLM-wiki 迭代方法](../llm-wiki-iteration.md)
