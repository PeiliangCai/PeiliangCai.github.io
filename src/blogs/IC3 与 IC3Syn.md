---
title: IC3 与 IC3Syn 核心内容总结
date: 2026-07-16
category: 论文阅读
tags: [IC3, IC3Syn, TLA+, Formal-Verification, Distributed-Systems]
summary: 梳理 IC3、IC3Syn、TLA+ 状态、Frame、Blocking Clause 与归纳不变量等形式化验证基础。
---

# IC3 与 IC3Syn 核心内容总结

## 1. 基础概念

### 1.1 TLA+ State

TLA+ 中的一个 **State（状态）**，表示系统在某一时刻所有状态变量取值的完整快照。

例如：

```text
votes  = {A -> B, C -> B}
leader = B
term   = 2
```

整体构成一个状态 (s)。

一次具体执行可以表示为：

[  
s_0 \rightarrow s_1 \rightarrow s_2 \rightarrow \cdots  
]

其中：

- (s_i)：某一时刻的完整系统状态；
    
- `Next(s,s')`：描述从状态 (s) 到状态 (s') 是否是协议允许的状态转移；
    
- `Init`：描述初始状态；
    
- `Safety`：描述一个状态是否满足需要证明的安全性质。
    

---

## 2. Safety、Reachable 与 Inductive Invariant

### 2.1 Safety 是一个状态谓词

[  
Safety(s)  
]

从集合角度，可以把它理解为：

# [  
\llbracket Safety\rrbracket

{s\mid s\models Safety}  
]

即：

> 所有满足 Safety 性质的状态组成的集合。

注意：

[  
s\models Safety  
]

并不意味着：

[  
s\text{ 一定可达}  
]

因此通常：

[  
Reachable\subseteq Safety  
]

但 `Safety` 中可能包含：

- 真正可达的状态；
    
- 需要很多步才能到达的状态；
    
- 实际上永远不可达的状态。
    

---

### 2.2 为什么 Safety 本身不一定是 Inductive Invariant？

因为可能存在：

[  
s\models Safety  
]

但：

[  
Next(s,s')  
]

且：

[  
s'\not\models Safety  
]

即：

```text
s                  s'
满足 Safety   ─→   违反 Safety
                 Next
```

因此 Safety 本身可能不对 `Next` 封闭。

真正的归纳不变式 (Inv) 需要满足：

[  
Init\Rightarrow Inv  
]

[  
Inv(s)\land Next(s,s')  
\Rightarrow Inv(s')  
]

[  
Inv\Rightarrow Safety  
]

即：

1. 所有初始状态满足 (Inv)；
    
2. 从满足 (Inv) 的状态执行任意合法 `Next` 后仍满足 (Inv)；
    
3. 所有满足 (Inv) 的状态都满足 Safety。
    

因此：

[  
Reachable\subseteq Inv\subseteq Safety  
]

注意：

[  
Inv\neq Reachable  
]

是完全允许的。

归纳不变式只需要是 Reachable 的一个安全、且对 Next 封闭的过近似。

---

# 3. IC3 的核心思想

IC3（又常称 PDR，Property Directed Reachability）的目标不是精确枚举所有可达状态，而是：

> 通过不断发现“可能通向 Safety violation 的状态”，并学习新的约束 Clause 来排除不必要的不可达状态，逐渐构造一个 Inductive Invariant。

核心过程可以概括为：

```text
寻找可能一步进入 Unsafe 的状态
        ↓
向前反推 predecessor
        ↓
如果追到 Init
    → 找到真实反例
否则
    → 学习 Clause 阻塞不可达状态
        ↓
加强 Frames
        ↓
传播 Clauses
        ↓
寻找 Fixed Point
```

---

# 4. IC3 中的 Frame (F_k)

IC3 维护一个 Frame 序列：

[  
F_0,F_1,F_2,\dots  
]

其中：

[  
F_0=Init  
]

而 (F_k) 可以理解为：

> 对从 Init 出发、至多经过 (k) 步能够到达的状态集合的一个逻辑过近似。

设真正至多 (k) 步可达的状态集合为：

[  
R_{\le k}  
]

那么：

[  
R_{\le k}  
\subseteq  
\llbracket F_k\rrbracket  
]

但通常：

[  
R_{\le k}  
\neq  
\llbracket F_k\rrbracket  
]

因此 (F_k) 中可能包含：

- 至多 (k) 步真正可达的状态；
    
- 需要超过 (k) 步才能到达的状态；
    
- 永远不可达的状态。
    

所以：

[  
s\in F_k  
]

并不能推出：

[  
s\in R_{\le k}  
]

但：

[  
s\in R_{\le k}  
]

必须保证：

[  
s\in F_k  
]

---

## 5. Frame 的公式与状态集合

IC3Syn 中非零 Frame 以 `Safety` 为基础，再通过 Blocking Clauses 加强。

例如：

# [  
F_i

Safety\land C_1\land C_2  
]

从集合角度：

# [  
\llbracket F_i\rrbracket

\llbracket Safety\rrbracket  
\cap  
\llbracket C_1\rrbracket  
\cap  
\llbracket C_2\rrbracket  
]

因此：

> `∧ C` 的作用就是从当前状态集合中进一步筛选出满足 (C) 的状态。

Clause 越多：

[  
Safety  
]

[  
Safety\land C_1  
]

[  
Safety\land C_1\land C_2  
]

对应的状态集合越小。

因此：

[  
F_i\Rightarrow F_{i+1}  
]

从集合角度意味着：

[  
\llbracket F_i\rrbracket  
\subseteq  
\llbracket F_{i+1}\rrbracket  
]

即较浅的 Frame 通常约束更强、集合更小。

---

# 6. Frontier Bad State

假设当前最深 Frame 为：

[  
F_{k-1}  
]

IC3 首先寻找一个状态：

[  
s_{k-1}\in F_{k-1}  
]

使得存在：

[  
Next(s_{k-1},s_{bad})  
]

且：

[  
s_{bad}\not\models Safety  
]

即：

```text
s_{k-1}              s_bad
满足 Safety    ─→    违反 Safety
                  Next
```

因此本文讨论中的 **frontier bad state** 更准确地说，是一个：

> **能够经过一步 Next 到达 Safety-violating state 的前驱状态。**

它自己通常仍然满足 Safety。

IC3Syn 使用 Apalache 执行这种 Frontier Query 和后续的 Predecessor Query。

---

# 7. Backward Predecessor Search

找到：

[  
s_{k-1}\rightarrow Bad  
]

后，IC3 不会立即认为系统 Unsafe，而是向前寻找 predecessor。

例如：

[  
s_{k-2}\rightarrow s_{k-1}  
]

再寻找：

[  
s_{k-3}\rightarrow s_{k-2}  
]

形成：

[  
s_i  
\rightarrow  
s_{i+1}  
\rightarrow  
\cdots  
\rightarrow  
s_{k-1}  
\rightarrow  
Bad  
]

注意：

> 一个状态可能有多个 predecessor。

例如：

```text
a1 ─┐
    │
b1 ─┼──→ a2
    │
c1 ─┘
```

IC3 通常通过 symbolic query 按需找到一个 predecessor witness，而不是一次枚举所有 predecessor。

---

## 8. Backward Search 的两种结果

### 情况 1：一路反推到 (F_0)

因为：

[  
F_0=Init  
]

如果得到：

[  
s_0\in Init  
]

并形成：

[  
s_0  
\rightarrow  
s_1  
\rightarrow  
\cdots  
\rightarrow  
s_{k-1}  
\rightarrow  
Bad  
]

那么就存在一条真正从 Init 出发到 Safety violation 的执行路径。

因此：

[  
\boxed{\text{System Unsafe}}  
]

这是真实 Counterexample。

---

### 情况 2：反推到 (F_i)，但在 (F_{i-1}) 中找不到 predecessor

假设：

[  
s_i\in F_i  
]

但不存在：

[  
s_{i-1}\in F_{i-1}  
]

满足：

[  
Next(s_{i-1},s_i)  
]

那么 (s_i) 就是当前的 **predecessor-free bad state**。

直观上说明：

> (s_i) 被 (F_i) 的过近似错误地包含进来了，但当前较浅 Frame 并不能支持它作为一个真正需要保留的状态。

于是需要学习一个 Clause：

[  
C_n  
]

满足：

[  
C_n(s_i)=False  
]

从而把 (s_i) 排除。

---

# 9. Blocking Clause

Blocking Clause 的目的不是简单删除一个具体状态，而是希望找到一个更一般的协议性质：

[  
C_n  
]

使它能够：

1. 排除当前 predecessor-free bad state；
    
2. 不排除真正的 reachable states；
    
3. 满足 IC3 Frame 所要求的 admission 条件。
    

例如，不是简单写：

```text
state ≠ s_i
```

而可能学习：

[  
Committed(n)  
\Rightarrow  
ReceivedAllVotes(n)  
]

这种协议级的普遍规律。

一个 Clause 如果在 level (i) 被接纳，IC3Syn 会把它插入：

[  
F_1,F_2,\dots,F_i  
]

而不是直接加入所有更深 Frame。

这样可以维持：

[  
F_1\Rightarrow F_2\Rightarrow\cdots  
]

更深的 Frame 是否也能加入该 Clause，要由后续 Clause Push 决定。论文明确说明，admitted clauses 会插入 level 1 到当前 level 的 Frames。

---

# 10. Admission Check

LLM 生成一个 Clause 后，IC3Syn 不会直接使用。

它需要经过验证。

主要思想是确认：

### ① 不会错误排除初始状态

需要保证所有 Init 状态仍满足该 Clause。

### ② Clause 能安全加入目标 Frame

需要通过 target-frame admission condition，即确认 Clause 相对于当前 Frame 内容具有所需的相对归纳性。

### ③ 不会排除真正的 reachable states

IC3Syn 使用 TLC 在有限实例的 concrete reachable states 上筛选 LLM 生成的候选 Clause。

因此整个过程是：

```text
LLM 生成 Candidate Clause
          ↓
TLC 检查具体 Reachable States
          ↓
Apalache 进行 Symbolic Admission Check
          ↓
通过
          ↓
正式加入 Frames
```

因此：

> LLM 只是提出候选规律，最终是否采用完全由形式验证工具决定。

这保证了 LLM 本身即使生成错误内容，也不会直接破坏验证结果的可靠性。

---

# 11. Blocking 后并不会马上新建 Frame

假设当前最深 Frame 为：

[  
F_{k-1}  
]

发现一个 frontier bad state，反推并生成 Clause：

[  
C_1  
]

将相关 bad state 阻塞后，IC3Syn 会重新查询：

> (F_{k-1}) 中还有没有其他能够一步进入 Safety violation 的状态？

如果又找到：

[  
b_{k-1}\rightarrow Bad  
]

就继续：

```text
Backward Search
    ↓
Blocking
    ↓
学习新的 Clause
```

因此一个 Frontier Blocking round 可能是：

```text
发现 bad state a
    ↓
Backward
    ↓
Blocking C1
    ↓
重新查询 Frontier

发现 bad state b
    ↓
Backward
    ↓
Blocking C2
    ↓
重新查询 Frontier

发现 bad state c
    ↓
...
```

直到：

[  
F_{k-1}\land Next  
\Rightarrow  
Safety'  
]

即：

> 当前最深 Frame 中已经不存在一步可以进入 Safety violation 的状态。

此时才认为当前 Frontier Fully Blocked。

---

# 12. 新建 Frame

当前 Frontier 完全 Block 后，IC3Syn 才新增：

[  
F_k  
]

新的非零 Frame 以 `Safety` 为基础。

可以直观理解为：

[  
F_k=Safety  
]

然后进入：

[  
\boxed{Clause\ Push}  
]

论文 Algorithm 1 的顺序是：

```text
BlockFrontier
    ↓
PushClausesForward
（其中 append fresh frame）
    ↓
FindFixpoint
```

即：

[  
\boxed{  
\text{Block 当前 Frontier}  
\rightarrow  
\text{新增 Frame 并 Push}  
\rightarrow  
\text{检查 Fixed Point}  
}  
]

---

# 13. Clause Push

假设：

# [  
F_{k-1}

Safety\land C_1\land C_2\land C_3  
]

新增：

[  
F_k=Safety  
]

IC3 会尝试把：

[  
C_1,C_2,C_3  
]

向 (F_k) 传播。

对于 Clause (C)，Push 的核心思想是检查：

> 从 (F_{k-1}) 中允许的状态执行一步 Next 后，是否仍然保证满足 (C)？

即检查：

[  
F_{k-1}\land Next  
\Rightarrow  
C'  
]

如果成立：

[  
C  
]

可以加入：

[  
F_k  
]

如果：

[  
C_1,C_2  
]

成功，而：

[  
C_3  
]

失败，则：

# [  
F_k

Safety\land C_1\land C_2  
]

而：

# [  
F_{k-1}

Safety\land C_1\land C_2\land C_3  
]

因此：

[  
\llbracket F_{k-1}\rrbracket  
\subseteq  
\llbracket F_k\rrbracket  
]

---

# 14. 为什么 Clause 会 Push 失败？

假设：

[  
C_3\in F_{k-1}  
]

这只说明：

> (C_3) 可以合法地约束当前较浅层 Frame。

但并不代表：

[  
C_3  
]

自身已经是全局 Inductive Invariant。

可能存在：

[  
s\in F_{k-1}  
]

且：

[  
s\rightarrow s'  
]

其中：

[  
s\models C_3  
]

但：

[  
s'\not\models C_3  
]

因此：

[  
F_{k-1}\land Next  
\not\Rightarrow  
C_3'  
]

所以无法 Push。

这说明：

> (C_3) 目前只具有有限深度的相对归纳性，而不能证明它在更深层继续成立。

---

# 15. Push 失败不等于 Safety 被违反

这是一个重要区别。

如果：

[  
C_3  
]

Push 失败，只说明存在：

[  
s\rightarrow s'  
]

使：

[  
s'\not\models C_3  
]

但完全可能：

[  
s'\models Safety  
]

因此：

[  
\neg C_3  
]

不等于：

[  
\neg Safety  
]

Clause 通常是比 Safety 更强的辅助性质。

---

# 16. 如果一个用于阻塞 Frontier Bad State 的 Clause 无法 Push，会发生什么？

假设之前有：

[  
b\in F_{k-1}  
]

且：

[  
b\rightarrow Bad  
]

IC3 学习：

[  
C_3  
]

使：

[  
C_3(b)=False  
]

于是 (b) 被从 (F_{k-1}) 排除。

但如果：

[  
C_3  
]

无法 Push 到：

[  
F_k  
]

那么：

[  
F_k  
]

中确实可能再次包含：

[  
b  
]

于是下一轮：

[  
b\in F_k  
]

且：

[  
b\rightarrow Bad  
]

Frontier Query 可能再次找到它。

IC3Syn 就会重新执行：

```text
Backward Search
    ↓
Blocking
    ↓
寻找新的、更强或更合适的 Clause
```

因此：

[  
\boxed{  
\text{在某一层 Block}  
\neq  
\text{从此永远 Block}  
}  
]

只有能够不断向更深 Frame Push，并最终保留在 Fixed Point 中的 Clauses，才真正成为最终归纳不变式的一部分。

IC3Syn 对 push-failure counterexample 还会额外进行一次 opportunistic blocking 尝试。

---

# 17. 为什么 (F_k) 不是 (F_{k-1}) 的精确一步后继集合？

IC3 只要求类似：

[  
Post(F_{k-1})  
\subseteq  
F_k  
]

而不是：

# [  
Post(F_{k-1})

F_k  
]

其中：

[  
Post(F_{k-1})  
]

表示从 (F_{k-1}) 中状态执行一步 Next 后真正可能得到的所有后继状态。

因此：

```text
           F_k
┌─────────────────────────┐
│                         │
│    Post(F_{k-1})        │
│    ┌──────────────┐     │
│    │              │     │
│    └──────────────┘     │
│                         │
└─────────────────────────┘
```

(F_k) 只是这些后继状态的过近似。

这就是为什么：

# [  
F_{k-1}

Safety\land C_1\land C_2  
]

而：

# [  
F_k

Safety\land C_1  
]

仍然可以成立。

(F_k) 虽然更大，但只要它仍然覆盖 (F_{k-1}) 的所有必要后继即可。

---

# 18. Fixed Point

Clause Push 结束后，IC3Syn 检查所有相邻 Frame：

[  
F_i\stackrel{?}=F_{i+1}  
]

如果存在：

[  
F_i=F_{i+1}  
]

那么达到 Fixed Point。

IC3 Frame 维护一步转移关系：

[  
F_i\land Next  
\Rightarrow  
F_{i+1}'  
]

而：

[  
F_i=F_{i+1}  
]

因此：

[  
F_i\land Next  
\Rightarrow  
F_i'  
]

即：

> (F_i) 对 Next 封闭。

再结合：

[  
Init\Rightarrow F_i  
]

以及：

[  
F_i\Rightarrow Safety  
]

得到：

[  
\boxed{  
F_i  
\text{ 是一个 Candidate Inductive Invariant}  
}  
]

因此：

[  
Reachable  
\subseteq  
F_i  
\subseteq  
Safety  
]

IC3Syn 在有限实例上得到 Candidate Invariant，随后使用 TLAPS 对完整无界协议证明其归纳性。

---

# 19. IC3Syn 相比标准 IC3 的核心变化

## 19.1 标准 IC3

标准 IC3 的核心是：

```text
发现 Bad/CTI
    ↓
Backward Search
    ↓
SAT Generalization
    ↓
自动生成 Blocking Clause
    ↓
Push
    ↓
Fixed Point
```

在布尔有限状态系统中，可以利用 SAT-derived Boolean Cube Generalization 自动学习 Clause。

---

## 19.2 TLA+ 分布式协议的问题

TLA+ 协议状态可能包含：

- Set；
    
- Function；
    
- Quantifier；
    
- Node；
    
- Quorum；
    
- Log；
    
- Vote；
    
- Configuration 等复杂协议级结构。
    

例如真正需要的不变式可能是：

[  
\forall n.,  
Committed(n)  
\Rightarrow  
ReceivedAllVotes(n)  
]

传统 Boolean Cube Generalization 很难自然生成这种协议级条件。

因此 IC3Syn 使用 LLM 来承担：

[  
\boxed{  
\text{Blocking Clause Generation}  
}  
]

论文强调，标准 IC3 可以机械地 generalize Boolean cubes，而 IC3Syn 面对的是包含集合、函数和量词的 TLA+ 协议，因此改用 LLM 生成协议级 Clause。

---

# 20. IC3Syn 中各组件的分工

## IC3 Controller

负责：

- 管理 Frames；
    
- Frontier Query；
    
- Backward Predecessor Search；
    
- Blocking；
    
- Clause Push；
    
- Fixed Point Detection。
    

即：

[  
\boxed{  
IC3\text{ 负责决定“当前缺什么约束”}  
}  
]

---

## LLM

输入包括：

- 完整 TLA+ Specification；
    
- 当前 Bad States；
    
- 之前 Clause 的验证结果；
    
- 反例反馈等。
    

负责生成：

[  
Candidate\ Blocking\ Clauses  
]

即：

[  
\boxed{  
LLM\text{ 负责猜测“这个约束可能是什么”}  
}  
]

关键设计是：

> LLM 不需要一次生成完整 Inductive Invariant，而只需要针对当前具体 Bad State 生成局部 Blocking Clause。

这样：

[  
\text{Global Invariant Synthesis}  
]

被拆成：

[  
\text{Many Focused Blocking Tasks}  
]

这是 IC3Syn 的核心思想之一。

---

## Apalache

负责 Symbolic Queries：

- Frontier Query；
    
- Predecessor Query；
    
- Clause Admission；
    
- Clause Push。
    

即主要解决：

[  
\exists s  
]

类型的符号状态搜索问题，并返回具体 Witness State。

---

## TLC

负责：

- 枚举有限实例中的 concrete reachable states；
    
- 检查 LLM Clause 是否错误排除真实 reachable states；
    
- 根据 Clause 能 block 多少 Bad States 进行筛选和排序。
    

即：

[  
\boxed{  
TLC\text{ 主要负责 Concrete Clause Screening}  
}  
]

---

## TLAPS

最终用于证明：

> 在有限实例上合成出的 Candidate Invariant 是否对完整无界协议真正归纳成立。

因此整体思路是：

```text
有限实例
    ↓
IC3Syn + LLM
    ↓
Candidate Invariant
    ↓
TLAPS
    ↓
证明完整无界协议的 Inductiveness
```

---

# 21. IC3Syn 完整工作流程

```text
输入：
Init
Next
Safety
TLA+ Specification

        ↓

初始化 Frames
F0 = Init
F1 = Safety

        ↓

【1】Frontier Query

在当前最深 Frame F_{k-1} 中寻找：

s ∈ F_{k-1}
s --Next--> ¬Safety

        ↓

没有？
→ 当前 Frontier fully blocked

有？
        ↓

【2】Backward Predecessor Search

s_{k-1}
↑
s_{k-2}
↑
...
↑
s_i

        ↓

是否追到 F0？

    ├── 是
    │
    │   Init → ... → Bad
    │
    │   → 真实 Counterexample
    │   → Unsafe
    │
    └── 否
        ↓

在 Fi 找到 predecessor-free state

        ↓

【3】Blocking Clause Search

先查询 Clause Memory

已有 Clause 能 Block？
    ├── 是 → Admission
    │
    └── 否 → LLM 生成 Candidate Clauses

        ↓

TLC Screening

        ↓

Apalache Admission Check

        ↓

通过的 Clause 加入 F1 ... Fi

        ↓

重新查询 Frontier

        ↓

直到：
F_{k-1} ∧ Next ⇒ Safety'

        ↓

【4】新增 Fresh Frame F_k

        ↓

【5】Clause Push

尝试逐层传播已有 Clauses

Fi ∧ Next ⇒ C' ?

    ├── 成立 → Push C 到 Fi+1
    │
    └── 不成立
         → Push Failure
         → IC3Syn 可尝试 Opportunistic Blocking

        ↓

【6】Fixed Point Check

是否存在：

Fi = Fi+1 ?

    ├── 是
    │
    │   → Candidate Inductive Invariant
    │
    │   → TLAPS 验证完整无界协议
    │
    └── 否
        ↓

以新的最深 Frame F_k
重新开始 Frontier Query
```

该总体流程对应论文中 IC3 Controller 的 `BlockFrontier → PushClausesForward → FindFixpoint` 主循环。

---

# 22. 最核心的理解

IC3 的目标并不是：

[  
\boxed{  
\text{精确计算所有 Reachable States}  
}  
]

而是：

[  
\boxed{  
\text{逐步构造 Reachable States 的安全过近似}  
}  
]

使最终得到：

[  
Reachable  
\subseteq  
Inv  
\subseteq  
Safety  
]

并且：

[  
Inv\land Next  
\Rightarrow  
Inv'  
]

IC3Syn 则进一步把：

[  
\boxed{  
\text{“如何生成复杂的 Blocking Clause？”}  
}  
]

这个传统 IC3 难以直接解决的 TLA+ 协议级推理问题交给 LLM。

因此 IC3Syn 的核心分工可以概括为：

[  
\boxed{  
IC3：  
确定哪里需要补充 Invariant  
}  
]

[  
\boxed{  
LLM：  
提出可能的 Invariant Clause  
}  
]

[  
\boxed{  
TLC + Apalache：  
验证 Clause 是否可靠  
}  
]

[  
\boxed{  
IC3：  
把局部 Clause 逐步 Push、组合，  
最终形成 Candidate Inductive Invariant  
}  
]

[  
\boxed{  
TLAPS：  
证明 Candidate Invariant  
对完整无界协议真正成立  
}  
]

因此，IC3Syn 的本质不是：

> **让 LLM 一次性“猜出完整 Invariant”。**

而是：

> **利用 IC3 把一个全局、困难的 Invariant Synthesis 问题拆解成一系列具体的 Bad-State Blocking 问题，让 LLM 只负责生成局部协议级 Clause，再由形式化工具验证，最终由 IC3 将这些局部 Clause 组织成完整的 Inductive Invariant。**

这也是 IC3Syn 最核心的设计思想。
