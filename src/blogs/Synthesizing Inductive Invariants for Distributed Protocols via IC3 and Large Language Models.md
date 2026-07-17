---
title: Synthesizing Inductive Invariants for Distributed Protocols via IC3 and Large Language Models
date: 2026-07-15
category: 论文阅读
tags: [IC3, LLM, Formal-Verification, Distributed-Systems, Invariant]
summary: 围绕分布式协议验证论文，整理 Protocol、Safety、Invariant、Inductive Invariant 与 IC3/LLM 的核心概念。
---

# 论文阅读基础概念总结：Protocol、Safety、Invariant、Inductive Invariant 与 IC3/LLM

## 1. Protocol 是什么？

一个协议可以粗略理解为：

```text
Protocol = Init + Next
```

其中：

### 1.1 Init：初始状态

`Init` 描述系统刚开始时允许处于什么状态。

例如在 3 个节点 A、B、C 的 Leader 选举协议中：

```text
Init:
- 所有节点都还没有投票
- 当前不存在 Leader
```

### 1.2 Next：状态转移规则

`Next` 描述系统从当前状态出发，下一步允许执行什么动作，以及状态如何发生变化。

例如：

```text
Next:
1. 一个尚未投票的节点可以给某个候选人投票
2. 已经投过票的节点不能再次投票
3. 获得多数票的候选人可以成为 Leader
```

因此：

```text
Init：系统从哪里开始
Next：系统每一步允许怎么变化
```

系统的实际运行过程可以表示为：

```text
S0 --Next--> S1 --Next--> S2 --Next--> S3 ...
↑
Init
```

其中 `S0` 是满足 `Init` 的初始状态。

---

# 2. State 和 Reachable State 是什么？

## 2.1 State：状态

State 表示某一时刻系统中所有变量的具体取值。

例如：

```text
votes[A] = {A, C}
votes[B] = {B}
leader[A] = true
leader[B] = false
leader[C] = false
```

这就是一个状态。

只要变量的取值在语法和类型上合法，它就可以构成一个“可能描述出来的状态”。

但是：

> 能被描述出来，不代表这个状态真的可以由协议运行到达。

---

## 2.2 Reachable State：可达状态

可达状态指：

> 从某个满足 `Init` 的初始状态出发，按照 `Next` 中规定的合法动作执行有限次后，能够真正到达的状态。

即：

```text
Init
  ↓
S0
  ↓ Next
S1
  ↓ Next
S2
...
```

其中的 `S0、S1、S2...` 都是 Reachable States。

---

## 2.3 Unreachable State：不可达状态

有些状态虽然变量取值合法，但不存在：

```text
Init --Next--> ... --Next--> S
```

这样的合法路径。

这种状态称为不可达状态。

例如协议规定：

```text
每个节点只能投一次票
```

那么下面这种状态就可能是不可达的：

```text
C ∈ votes[A]
同时
C ∈ votes[B]
```

因为这意味着 C 给两个不同候选人都投过票。

---

# 3. Safety Property 是什么？

Safety Property 是我们最终想证明的安全性质。

可以简单理解为：

> 某种坏事情永远不会发生。

在 Leader 选举例子中：

```text
Safety:
任意时刻最多只能有一个 Leader
```

也就是：

```text
不存在 x != y，
使得 leader[x] = true
并且 leader[y] = true
```

Safety 只规定了最终不能发生什么。

它并没有完整描述：

> 系统真实可达状态究竟具有哪些内部特征。

---

# 4. 为什么不能只用 Safety 直接完成归纳证明？

假设我们想证明：

```text
不能同时有两个 Leader
```

自然会尝试证明：

```text
1. Init => Safety
2. Safety ∧ Next => Safety'
```

其中：

- `Safety` 表示当前状态满足安全性质；
    
- `Next` 表示执行了一步合法协议动作；
    
- `Safety'` 表示下一状态仍然满足 Safety。
    

问题出现在第二条：

```text
Safety ∧ Next => Safety'
```

它检查的是：

> 所有满足 Safety 的当前状态，在执行一步 Next 后是否仍满足 Safety。

但是：

```text
满足 Safety 的状态
```

并不等于：

```text
真实可达状态
```

通常：

```text
Reachable ⊂ Safe
```

也就是说：

> 所有真实可达状态应该都是安全的，但很多满足 Safety 的状态其实根本不可达。

---

# 5. 为什么验证器会考虑不可达状态？

假设存在这样一个状态：

```text
leader[A] = true
leader[B] = false

B 已经拥有多数票
```

这个状态当前仍然满足 Safety，因为目前只有 A 是 Leader。

但是下一步 B 可以成为 Leader，于是：

```text
leader[A] = true
leader[B] = true
```

Safety 被破坏。

因此：

```text
Safety ∧ Next => Safety'
```

无法成立。

但这个中间状态可能根本不是真实可达状态。

例如它可能隐含：

```text
某个节点同时给 A 和 B 投了票
```

违反了协议真实运行历史。

问题在于：

> 当我们只用 `Safety` 作为当前状态的约束时，验证器并不知道当前状态是不是从 `Init` 真正运行过来的。

`Next` 只描述：

> 当前状态和下一状态之间的一步转移是否合法。

它不会自动证明：

> 当前状态本身一定是由 Init 经过很多次 Next 产生的。

因此验证器可能会考虑：

```text
满足 Safety
但实际上不可达
```

的状态。

---

# 6. 为什么归纳时不能只考虑 Reachable States？

理论上当然可以。

我们真正想证明的本来就是：

```text
∀ s ∈ Reachable:
    Safety(s)
```

问题在于：

> 要只检查 Reachable States，就必须首先知道哪些状态是 Reachable。

而精确求出：

```text
Reachable
```

本身通常就是一个很困难的问题。

因为判断某个状态 `S` 是否可达，需要判断是否存在某条路径：

```text
Init
  ↓
S1
  ↓
S2
  ↓
...
  ↓
S
```

路径长度可能非常长。

对于复杂分布式系统，节点、消息、日志等组合还可能导致状态空间爆炸。

所以：

### 暴力枚举方法

直接从 Init 开始：

```text
Init
↓
枚举所有 Next 后继
↓
继续枚举后继
↓
直到没有新状态
```

优点：

```text
得到的都是真实 Reachable States
```

缺点：

```text
状态数量可能爆炸，甚至状态空间可能无界
```

### Inductive Invariant 方法

不精确求出 Reachable，而是寻找一个容易描述的集合 `Inv`：

```text
Reachable ⊆ Inv
```

然后要求：

```text
Inv ⊆ Safe
```

从而得到：

```text
Reachable ⊆ Inv ⊆ Safe
```

于是可以证明：

```text
所有 Reachable States 都满足 Safety
```

---

# 7. Invariant 是什么？

Invariant 可以理解为：

> 在所有真实可达状态中始终成立的性质。

例如：

```text
Inv1:
不存在同一个 voter 同时给两个不同 candidate 投过票
```

如果所有真实运行过程中的状态都满足这个性质，那么它就是一个 invariant。

数学上：

```text
∀ s ∈ Reachable:
    Inv(s) = true
```

等价地，如果把所有满足 Inv 的状态记作：

```text
[[Inv]] = {s | Inv(s) = true}
```

那么：

```text
Reachable ⊆ [[Inv]]
```

注意：

> `Inv` 描述的状态集合一般比真实 Reachable 集合更大。

即：

```text
Reachable ⊂ [[Inv]]
```

因为可能存在一些：

```text
满足 Inv
但因为其他原因仍然不可达
```

的状态。

---

# 8. Invariant 和 Inductive Invariant 的区别

## 8.1 Invariant

只要求：

```text
所有真实可达状态都满足它
```

即：

```text
Reachable => Inv
```

---

## 8.2 Inductive Invariant

Inductive Invariant 是一种可以直接通过归纳法证明的 Invariant。

它需要满足：

```text
1. Init => Inv
2. Inv ∧ Next => Inv'
```

第一条表示：

> 所有初始状态都满足 Inv。

第二条表示：

> 只要当前状态满足 Inv，并按照协议合法执行一步，那么下一状态仍然满足 Inv。

因此：

```text
Init 时成立
+
每一步都保持成立
=
所有可达状态中永远成立
```

所以：

```text
Inductive Invariant
一定是
Invariant
```

但：

```text
Invariant
不一定是
Inductive Invariant
```

---

# 9. 为什么普通 Invariant 可能不是 Inductive Invariant？

假设性质 `P` 在所有真实可达状态中都成立。

所以它确实是 Invariant。

但是可能存在一个不可达状态 `S`：

```text
P(S) = true
```

并且存在合法的一步状态转移：

```text
S --Next--> S'
```

而：

```text
P(S') = false
```

那么：

```text
P ∧ Next => P'
```

就不成立。

所以：

> P 虽然在所有真实运行中一直成立，但如果把所有满足 P 的状态都拿来做一步归纳，其中某些不可达状态会破坏归纳性。

因此 P 是：

```text
Invariant
```

但不是：

```text
Inductive Invariant
```

---

# 10. Safety 与 Invariant、Inductive Invariant 的关系

如果协议实际上是安全的，那么：

```text
所有 Reachable States 都满足 Safety
```

因此从严格意义上：

> Safety 本身也可以视为一个 Invariant。

但是 Safety 往往不是 Inductive Invariant。

例如：

```text
Safety:
不能同时有两个 Leader
```

存在一个不可达状态：

```text
A 已经是 Leader
B 不是 Leader
但 B 已经拥有多数票
```

它仍然满足 Safety。

但执行一步：

```text
B 成为 Leader
```

Safety 就被破坏。

所以：

```text
Safety ∧ Next => Safety'
```

可能不成立。

因此我们需要寻找一个更强的：

```text
Inductive Invariant Inv
```

满足：

```text
Init => Inv
Inv ∧ Next => Inv'
Inv => Safety
```

最终：

```text
Reachable ⊆ [[Inv]] ⊆ [[Safety]]
```

---

# 11. Leader 选举例子中的 Safety 和 Inductive Invariant

假设有 A、B、C 三个节点。

## Safety

```text
最多只能有一个 Leader
```

---

## 一个可能的 Inductive Invariant

可以由若干性质组成：

```text
Inv = Inv1 ∧ Inv2 ∧ Inv3
```

### Inv1

```text
任何 voter 都不会同时给两个不同 candidate 投票
```

### Inv2

```text
如果 x 是 Leader，
那么 x 必须拥有多数票
```

即：

```text
leader[x] => Majority(x)
```

### Inv3

```text
两个不同 candidate 不能同时拥有多数票
```

即：

```text
x != y
=>
¬(Majority(x) ∧ Majority(y))
```

那么：

```text
leader[A] ∧ leader[B]
        ↓ 根据 Inv2
Majority(A) ∧ Majority(B)
        ↓ 与 Inv3 矛盾
false
```

因此：

```text
Inv => Safety
```

---

# 12. 为什么 Next 里的规则又会出现在 Invariant 中？

这里必须区分：

> 行为规则和状态性质不是同一个东西。

假设 `Next` 中规定：

```text
已经投过票的 voter 不能再次执行 Vote 动作
```

这是：

> 对下一步行为的限制。

例如：

```text
如果 voted[B] = true
那么 Next 不允许 B 再投票
```

而由：

```text
Init:
一开始没人投票
```

加上：

```text
Next:
投过票的人不能再次投票
```

可以推导出一个状态性质：

```text
任何真实可达状态中，
都不会存在 B 同时给 A 和 C 投过票
```

也就是：

```text
¬(B ∈ votes[A] ∧ B ∈ votes[C])
```

这个才是 Invariant。

因此不是：

```text
Next 变成了 Inv
```

而是：

```text
Init + Next
       ↓
经过任意多步运行后可以推出
       ↓
某个始终成立的状态性质 Inv
```

可以理解为：

```text
Next：
规定“以后不允许怎么做”

Inv：
总结“因为过去每一步都遵守了 Next，
所以现在一定不会出现什么状态”
```

Invariant 相当于把：

```text
Init + Next + 任意长的合法运行历史
```

压缩总结成一些静态状态规律。

---

# 13. 为什么还需要显式写出这些 Invariant？

因为 `Next` 只描述一步转移。

它可以告诉验证器：

```text
S 到 S' 这一步是否合法
```

但是如果直接给验证器一个状态 `S`，单看 `Next` 无法立即知道：

```text
S 是不是从 Init 经过任意多次 Next 真正运行过来的
```

要判断这一点，本质上是在求 Reachability。

Invariant 的作用之一就是：

> 用比较简单的逻辑性质，对所有真实可达状态进行概括。

例如：

```text
任何真实可达状态中都不存在重复投票
```

这样验证器在后续证明时就不必重新追溯整个历史。

---

# 14. IC3 为什么需要不断寻找 Blocking Clause？

IC3 不试图精确求出：

```text
Reachable
```

而是维护对可达状态的某种近似。

初始近似可能比较宽：

```text
包含所有 Reachable States
同时也包含很多 Unreachable States
```

其中某些不可达状态可能：

```text
当前满足 Safety
但下一步可以进入 Bad State
```

于是 IC3 会尝试排除这些状态。

过程大致是：

```text
发现 Bad State
      ↓
寻找一步能够进入 Bad State 的 predecessor
      ↓
发现某个危险状态
      ↓
寻找一个 Blocking Clause
      ↓
排除这一类状态
      ↓
让状态近似更加精确
```

Blocking Clause 可以理解为：

> 一条用来排除某类危险状态的逻辑规则。

---

# 15. LLM 到底生成什么？

在这类 IC3 + LLM 方法中，更准确地说：

> LLM 通常不是一次性直接生成最终完整的 Inductive Invariant。

而是根据：

```text
协议 Init + Next
+
当前发现的 Bad States / Dangerous States
```

生成：

```text
Candidate Blocking Clauses
```

即候选阻塞规则。

例如 IC3 找到危险状态：

```text
leader[A] = true

votes[A] = {A, C}
votes[B] = {B, C}
```

LLM 观察到：

```text
C 同时出现在 votes[A] 和 votes[B]
```

再结合协议中的：

```text
一个 voter 只能投一次票
```

可能抽象出：

```text
∀ voter, x, y:
x != y
=>
¬(voter ∈ votes[x] ∧ voter ∈ votes[y])
```

即：

```text
任何 voter 都不能同时给两个不同 candidate 投票
```

LLM 所做的事情可以理解为：

```text
具体危险状态
      +
阅读协议 Init / Next
      ↓
分析危险状态为什么理论上不应该出现
      ↓
从具体状态进行泛化
      ↓
生成一般性的 Candidate Clause
```

---

# 16. 为什么不能直接相信 LLM？

因为 LLM 可能生成过强或者错误的规则。

例如：

```text
如果 A 是 Leader，
那么其他节点一票都不能获得
```

这虽然可能排除当前危险状态，但可能错误地排除了真实合法状态。

因此：

```text
LLM
只负责提出候选规则
```

真正决定规则能否使用的是形式化验证工具。

整体过程可以理解为：

```text
IC3 找到危险状态
        ↓
LLM 根据协议和危险状态生成 Candidate Clauses
        ↓
形式化工具检查
        ↓
错误或过强
→ 丢弃

正确且满足要求
→ 加入 Frame
        ↓
继续寻找新的危险状态
        ↓
不断迭代
```

---

# 17. 最终 Invariant 是否就是 Inductive Invariant？

在本文讨论的 IC3 语境下：

> 最终收敛得到的 Invariant，更准确地说就是最终的 Inductive Invariant。

它需要满足：

```text
Init => Inv
Inv ∧ Next => Inv'
Inv => Safety
```

所以前面提到的：

```text
Final Invariant
```

更严谨的叫法应该是：

```text
Final Inductive Invariant
```

或者：

```text
最终归纳不变量
```

LLM 生成的是：

```text
局部 Candidate Blocking Clauses
```

这些 Clauses 经过验证、加入 IC3 的 Frame，并不断传播和收敛。

最终 IC3 得到的固定点对应：

```text
Inductive Invariant
```

---

# 18. 有限状态与无限/无界协议

一个分布式协议可能允许：

```text
节点数 N = 1, 2, 3, 4, ...
```

因此整个协议族可能是无界的。

验证时通常不会：

```text
从无限多种状态中随便抽取有限几个状态
```

更准确的做法是：

> 先把协议参数固定成一个有限实例。

例如：

```text
N = 3
Server = {A, B, C}
```

然后分析这个有限实例中的状态空间。

即：

```text
无界协议
节点数量 N 任意
       ↓
选择有限实例
N = 3
       ↓
分析这个实例的可达状态
       ↓
帮助发现 Candidate Invariant
```

关键问题是：

```text
N = 3 时成立
```

并不能自动推出：

```text
任意 N 都成立
```

因此有限实例更适合：

> 帮助发现可能具有一般性的 Invariant。

随后还需要进一步证明：

```text
这个 Invariant 对任意参数规模都成立
```

才能完成真正的无界协议验证。

---

# 19. 整体概念关系

可以最终记成下面这张图：

```text
                   Protocol
              ┌──────────────┐
              │ Init + Next  │
              └──────┬───────┘
                     │
                     │ 实际运行
                     ↓
              Reachable States
                     │
                     │ 全部满足
                     ↓
                  Invariant

Inductive Invariant 是一种特殊 Invariant：

Init => Inv
Inv ∧ Next => Inv'

如果还满足：

Inv => Safety

那么：

Reachable ⊆ [[Inv]] ⊆ [[Safety]]

因此：

所有 Reachable States 都满足 Safety
```

---

# 20. 最重要的几个结论

### 结论 1

```text
Protocol = Init + Next
```

`Init` 决定从哪里开始，`Next` 决定每一步怎么走。

### 结论 2

Safety 是最终验证目标：

```text
某种坏事情永远不会发生
```

### 结论 3

验证器之所以可能考虑不可达状态，是因为归纳证明通常不是精确枚举 Reachable，而是在一个更大的状态集合上进行推理。

### 结论 4

Invariant 是：

```text
所有真实可达状态中始终成立的性质
```

但满足 Invariant 的状态不一定都是真实可达状态。

因此：

```text
Reachable ⊆ [[Inv]]
```

### 结论 5

Inductive Invariant 必须满足：

```text
Init => Inv
Inv ∧ Next => Inv'
```

如果还满足：

```text
Inv => Safety
```

就可以证明协议安全。

### 结论 6

Safety 本身如果协议确实安全，也属于 Invariant，但它可能不是 Inductive Invariant，因为某些满足 Safety 的不可达状态可能一步进入 Bad State。

### 结论 7

Next 中的协议规则和 Inv 中的状态性质不是一回事：

```text
Next：
限制每一步允许如何行动

Inv：
总结 Init + Next 经过任意多步运行后，
当前状态始终具有的性质
```

### 结论 8

IC3 的核心思想之一是：

```text
不用精确求出 Reachable
而是不断加强对 Reachable 的近似
直到得到一个能够推出 Safety 的 Inductive Invariant
```

### 结论 9

LLM 更准确的作用不是直接生成最终完整 Inductive Invariant，而是：

```text
根据 Protocol + Bad States
生成 Candidate Blocking Clauses
```

然后由形式化验证工具筛选正确规则。

最终多个有效 Clauses 随着 IC3 Frame 收敛，形成最终的 Inductive Invariant。

### 结论 10

整个过程可以高度概括为：

```text
Protocol: Init + Next
          ↓
IC3 寻找危险状态
          ↓
LLM 根据危险状态猜测一般性规则
          ↓
形式化工具验证 Candidate Clauses
          ↓
不断排除危险的不可达状态
          ↓
状态近似逐渐变精确
          ↓
得到 Inductive Invariant
          ↓
Inv => Safety
          ↓
证明协议安全
```
