---
title: 《SoulX-Duplug》论文阅读报告
date: 2026-05-30
category: 论文阅读
tags: [Speech, Dialogue, AI-Agent]
summary: 阅读 SoulX-Duplug，梳理全双工语音对话中的状态预测、VAD、ASR 与模块化控制思路。
---

论文链接：https://arxiv.org/abs/2603.14877
# 1. 小记
## 1.1 论文中所提到的一些专有名词解释
1. 全双工：通信双方可以**同时发送和接受信息**，而不是必须一方说完另一方才能说。该论文中指用户和 AI 可以像真人聊天一样，存在**同时说话、打断、插话、边听边回应**等交互形式。

| 模式              | 含义           | 例子                |
| --------------- | ------------ | ----------------- |
| 单工 Simplex      | 只能单向传输       | 只能单向传输            |
| 半双工 Half-Duplex | 双方都能说，但不能同时说 | 对讲机：按住说话，松开后对方才能说 |
| 全双工 Full-Duplex | 双方可以同时说和听    | 电话通话、真人面对面对话      |

2. VAD（Voice Activity Detection）：语音活动检测，用于
3. ASR（Automatic Speech Recognition）：自动语音识别，将用户说的内容识别成文字。
4. TTS（Text-to-Speech）：文本转语音 /   语音合成，作用和 ASR 的正好相反。
5. 端到端 End-to-End：从原始输入到最终输出，中间尽量不手工拆分模块，而是由一个统一模型直接学习整个映射过程。
6. SDM（Spoken Dialogue Model）：口语对话模型 / 语音对话模型
## 1.2 全双工语音对话系统面临的困境
1. **训练数据难以获取**：全双工语音对话数据难获取。该类数据集需要支持：用户说话时系统也可能说话；系统说话时用户可能插话、打断、附和、纠正；系统需要判断自己该继续说、停下、让话还是接话。所以全双工训练数据需要包含更复杂的交互状态。
	原因
	1. 真实全双工对话本身就难采集
	2. 标注成本很高
	3. 数据分布更细碎

| 状态            | 含义            |
| ------------- | ------------- |
| 用户真正想打断系统     | 系统应该停止输出      |
| 用户只是“嗯、对、是的”  | 系统不应该停        |
| 用户还没说完，只是短暂停顿 | 系统不应该抢话       |
| 用户已经说完并等待回应   | 系统应该接话        |
| 用户边听边反馈       | 系统要区分是反馈还是新问题 |

2. **灾难性遗忘**：模型在学习新任务或新能力时，可能会明显丢失原来已经学会的能力。
3. **可扩展性有限**：现有全双工语音对话系统往往和特定模型、特定数据、特定语言、特定场景强绑定，难以低成本迁移、升级和扩展。
SoulX-Duplug 的核心解决方向是：把全双工对话中最关键的“状态预测 / 轮次控制”单独做成一个可插拔模块，而不是重新训练整个语音对话系统。

# 2. 论文介绍
## 2.1 论文概述
本文作者提出了一个名为 **SoulX-Duplug** 的插件，它本质上是一个用于全双工语音对话系统的**流式对话状态预测模块**。
该插件的作用：判断语音对话过程中“AI 什么时候该听、什么时候该停、什么时候继续等用户说完”的一个控制插件。
SoulX-Duplug 将“听到声音（VAD）””识别内容（ASR）“”判断用户意图/对话状态“这三件事放在一个统一的流式模块中共同完成，从而让系统不再只是根据有没有声音来打断 AI，而是根据用户说话的语义和对话状态来控制 AI。  

## 2.2 三种全双工口语对话系统示意图
![[Pasted image 20260524205327.png]]
图 1：三种全双工口语对话系统的示意图。(a): 端到端连续输出全双工模型。(b): 端到端状态驱动全双工模型。(c): 模块化状态驱动全双工系统。
1. 第一种（端到端连续输出）：
	1. 模型同时负责听、理解、判断轮次、生成语音。
	2. 输入是用户语音流 + AI 自己之前说出的语音流；输出是 AI 新生成的语音流
2. 第二种（端到端状态驱动）：
	1. 将“状态控制”显式化，但是该内部预测器（状态预测机制）仍然“长”在端到端模型里面。
	2. 与第一种的区别：内部增加了一个状态开关，能够明确显示当前状态（生成、暂停、沉默等）
3. 第三种（模块化状态驱动）：
	1. 将“状态控制”和“回答生成”拆开，可以让半双工语音系统具备全双工能力

## 2.3 SoulX-Duplug 架构
![[Pasted image 20260525113211.png]]
图 4：SoulX-Duplug 的架构。该模型以交错音频标记、文本标记和状态标记的方式运行，确保在预测状态标记时能够获取文本信息。在训练过程中，语音活动检测（VAD）、自动语音识别（ASR）和状态预测是端到端优化的。在推理过程中，一个轻量级的最先进 ASR 模型通过教师强制提供文本指导。

**SoulX-Duplug 核心结构**：用户音频流 -> 音频编码器 / tokenizer -> 音频 token -> 流式语言模型 -> 交替预测：1. ASR 文本 token：用户说了什么。2. 状态 token：用户当前处于什么对话状态。
其输入主要是**用户实时语音**，输出有两类：
1. 文本 token：识别用户说了什么
2. 状态 token：判断当前对话状态。（用于控制外部语音对话系统）

**音频 token、文本 token、状态token**：系统会将语音切成很多很短的小块（**audio chunks**），每个小块会被转成音频 token，例如：
```
audio_1, audio_2, audio_3, ...
```
然后模型会在这些音频 token 后面插入或预测对应的文本 token 和状态 token。可以抽象为：
```
音频片段1 → 文本 token1 → 状态 token1
音频片段2 → 文本 token2 → 状态 token2
音频片段3 → 文本 token3 → 状态 token3
...
```
这就是所谓的 interleaved audio tokens, text tokens and state tokens，即：音频 token、文本 token、状态 token 交错排列。
所以 SoulX-Duplug 的关键思想是：状态预测不能只依赖声学特征，还要利用文本语义。

## 2.4 SoulX-Duplug 所设计的任务
SoulX-Duplug 内部同时涉及三个任务。
1. **VAD**：判断有没有**有效**用户语音
2. **ASR**：识别用户说了什么。
	1. 作用：该步的输出是给状态预测模块提供语义信息。
3. **状态预测**（核心）：判断当前对话状态

状态 token：

| 状态               | 含义                           |
| ---------------- | ---------------------------- |
| user_idle        | 表示当前音频片段不包含语义内容，例如静音或噪声      |
| user_nonidle     | 表示该片段包含有语义意义的语音              |
| user_backchannel | 代表用户回话行为                     |
| user_complete    | 表示用户的发言在语义上已经完整，助手可以接话       |
| user_incompelete | 表示用户暂停了，但其话语在语义上不完整，因此助手应该等待 |

## 2.5 SoulX-Duplug 的训练思路
端到端优化：在 SoulX-Duplug 这个插件内部，VAD、ASR、状态预测这几个任务一起训练、一起优化。
SoulX-Duplug 的训练思路：
```
输入音频
   ↓
同时学习：
   - 识别语音内容
   - 判断语音活动
   - 预测用户状态
```
好处：这样 ASR 学到的文本信息可以帮助状态预测，状态预测任务也会促使模型学习更适合对话控制的语音表示。

论文中的三个**训练阶段**：
1. Stage 1：非流式 ASR 预训练
2. Stage 2：流式 ASR 适配
3. Stage 3：双工状态预测微调。（模型会对 VAD、ASR 和 state prediction 进行端到端优化）
前两个阶段主要让模型具备语音识别能力，第三阶段让模型专门实时对话管理，也就是判断用户是 idle、nonidle、backchannel、complete 还是 incomplete。

**推理阶段**：即实际部署使用时，作者没有完全依赖 SoulX-Duplug 自己生成 ASR 文本，而是引入了一个外部轻量 ASR 模型（SenseVoice Small）。
这样做的优点：更稳更快，减少错误传播，因为 SoulX-Duplug 主要负责状态判断。

两个阶段的区别：
```
训练阶段是“培养能力”：让模型学会语音识别和状态预测之间的关系。  
推理阶段是“稳定使用”：用外部 ASR 给出更可靠文本，让模型更专注于状态判断。
```

## 2.6 全双工 SDM 评估
大多数基准关注的两个核心任务：
1. **何时说话**：系统是否能在用户说完话后适当时刻接话。
2. **何时停止**：系统是否能在用户发起中断时及时终止输出。

评估指标：
1. **成功率**：衡量正确接话或成功处理中断的比例
2. **错误率**：包括误启动率（把噪声等当成用户人声）和误停止率，量化不恰当的响应或过早终止
3. **延迟**：接话延迟和停止延迟，评估系统的时序响应能力

# 3 实验准备
## 3.1 benchmark 总览

| Benchmark                   | 评估对象        | 语言    | 主要用途                          |
| --------------------------- | ----------- | ----- | ----------------------------- |
| Bilingual Easy Turn Testset | 状态预测模块本身    | 中文、英文 | 评估模型判断用户话语是否“说完”的能力           |
| Bilingual Full-Duplex-Bench | 完整全双工语音对话系统 | 中文、英文 | 评估系统级全双工交互能力，包括停顿处理、接话、附和、打断等 |
论文中提出了 **SoulX-Duplug-Eval** 实际上由两部分组成：
1. 扩展后的 **Bilingual Easy Turn Testset**，用于 **duplex state prediction**
2. **Bilingual Full-Duplex-Bench**，用于系统级 **full-duplex dialogue evaluation**。

### 3.1.1 Bilingual Easy Turn Testset
简介：该 benchmark 主要用于评估 **SoulX-Duplug** 这个状态预测模块本身，而不是评估完整语言对话系统。    
英文扩展集 **Easy Turn testset-En** 包含两类样本：

| 类别         | 含义                  | 样本数量 |
| ---------- | ------------------- | ---- |
| Complete   | 用户话语语义完整，AI 可以接话    | 318  |
| Incomplete | 用户话语语义不完整，AI 应该继续等待 | 299  |
**评估指标**：

| 指标            | 含义                           | 评价方向     | 解释                            |
| ------------- | ---------------------------- | -------- | ----------------------------- |
| ACCComplete   | Complete 类样本的预测准确率           | 越**高**越好 | 衡量模型能否正确判断“用户已经说完，可以轮到 AI 回答” |
| ACCIncomplete | Incomplete 类样本的预测准确率         | 越**高**越好 | 衡量模型能否正确判断“用户还没说完，AI 不应该抢话”   |
| Avg. ACC      | Complete 与 Incomplete 的平均准确率 | 越**高**越好 | 衡量状态预测模块整体判断“接话/等待”的能力        |
| Latency       | 推理延迟                         | 越**低**越好 | 衡量状态预测模块从接收音频到输出状态判断所需时间      |
补充：
1. ACCComplete 和 ACCIncomplete 本是两个对立的面，区分出来的原因是两者所导致的后果不同。
	1. ACCComplete 误判后果：误判会导致等待、冷场、响应慢
	2. ACCIncomplete 误判后果：误判会导致抢话、打断用户

### 3.1.2 Bilingual Full-Duplex-Bench
简介：该 benchmark 用于评估完整的全双工语音对话系统，而不是单独评估状态预测模块

子任务：

| 子任务                    | 评估目标        | 核心问题                        |
| ---------------------- | ----------- | --------------------------- |
| Pause Handling         | 停顿处理能力      | 用户只是停顿但没说完时，AI 是否会错误抢话      |
| Turn Taking            | 接话能力        | 用户真正说完后，AI 是否能及时开始回应        |
| User Backchannel       | 用户附和处理能力    | 用户说“嗯嗯”“对”等附和语时，AI 是否能继续原回答 |
| User Interruption v1   | 用户打断处理能力    | 用户打断后，系统是否能接管新话轮            |
| User Interruption v1.5 | 更细粒度的打断处理能力 | 系统是否及时停止当前说话，并回应用户新输入       |
Bilingual Full-Duplex-Bench-Zh 是作者构造的中文对应版本，包含四类代表性交互场景：Turn-Taking、Pause Handling、User Backchannel 和 User Interruption。

评估指标：

| 指标              | 全称 / 含义                        | 用于哪些任务                                          | 评价方向  |
| --------------- | ------------------------------ | ----------------------------------------------- | ----- |
| TOR             | Takeover Rate / Turn-over Rate | Pause Handling、Turn Taking、User Interruption v1 | 视任务而定 |
| RL              | Response Latency               | Turn Taking、User Interruption                   | 越低越好  |
| RsR             | Resume Rate                    | User Backchannel                                | 越高越好  |
| RpR             | Respond Rate                   | User Interruption v1.5                          | 越高越好  |
| SL              | Stop Latency                   | User Interruption v1.5                          | 越低越好  |
| Overall ACC     | 综合轮次管理得分                       | 系统整体评估                                          | 越高越好  |
| Overall Latency | 综合延迟                           | 系统整体评估                                          | 越低越好  |
论文说明，系统级评估采用 Full-Duplex-Bench 官方指标，包括 TOR、RL、RsR、RpR、SL，并进一步聚合出整体轮次管理分数和整体延迟。

## 3.2 涉及的模型

### 3.2.1 SoulX-Duplug 内部使用的基础模型/组件
| 模型/组件                        | 用途                            | 说明                                                                                                                         |
| ---------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **GLM-4-Voice tokenizer**    | 语音 tokenizer / speech encoder | 用于把用户输入语音转换成离散音频 token。论文中说 SoulX-Duplug 采用 GLM-4-Voice tokenizer，以 12.5 Hz 的频率提取音频 token，并且该 speech tokenizer 在训练过程中保持冻结。 |
| **Qwen3-0.6B**               | SoulX-Duplug 的 LLM backbone   | SoulX-Duplug 的文本/状态 token 预测主干模型。音频 token 经过 projector 对齐到 LLM embedding 维度后，由 Qwen3-0.6B 进行流式 ASR token 和状态 token 预测。     |
| **Linear encoder projector** | 音频特征到 LLM 表示空间的映射层            | 它不是独立大模型，而是连接 speech tokenizer 和 LLM backbone 的适配层，用于把音频 token 的 embedding 映射到 LLM 可以处理的维度。                                |
| **LoRA**                     | 参数高效微调方法                      | 在状态预测训练阶段，作者对 LLM 使用 LoRA 进行双语训练集上的微调，以降低训练成本。                                                                             |
### 3.2.2 推理阶段提供 ASR teacher forcing 的模型
|模型|用途|说明|
|---|---|---|
|**SenseVoice Small**|英文推理时的外部 ASR teacher|推理阶段，SoulX-Duplug 不完全依赖自己生成 ASR 文本，而是使用外部轻量 ASR 模型提供 teacher-forced streaming ASR 输出。论文在方法部分提到使用 SenseVoice Small；在评估设置中说明英文使用 SenseVoice Small。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Paraformer**|中文推理时的外部 ASR teacher；也用于中文时间戳生成|论文中说明，中文语料的时间戳由 Paraformer 生成；评估时中文子集的 ASR 使用 Paraformer；推理阶段中文 teacher-forcing ASR 也使用 Paraformer。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**WhisperX**|英文语料时间戳生成|用于给英文 ASR 训练数据生成 word-level/character-level alignment 或时间戳，帮助构造流式 ASR 训练格式。它主要用于数据处理，不是最终系统推理核心模型。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
### 3.2.3 训练数据标注/构造中使用的模型
| 模型                       | 用途                 | 说明                                                                                                                                        |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Qwen2.5-72B-Instruct** | 状态标签标注             | 在状态预测训练阶段，作者使用 Qwen2.5-72B-Instruct 来标注 state labels，也就是为训练数据生成用户状态标签。                                                                    |
| **ChatGPT / Chat-GPT**   | 生成评估集文本内容          | 在 Easy Turn 英文扩展集和中文 Full-Duplex-Bench 构造中，作者使用 ChatGPT 生成文本内容。                                                                           |
| **ChatTTS**              | 评估集语音合成            | 用于把生成的文本合成为语音。例如 Easy Turn testset-En 的 Complete/Incomplete 样本，以及中文 Full-Duplex-Bench 中 Turn-Taking、Pause Handling、User Interruption 等子集。 |
| **SoulX-Podcast**        | Backchannel 子集语音合成 | 中文 User Backchannel 子集使用 SoulX-Podcast 进行语音合成。                                                                                            |
### 3.2.4 作者搭建完整全双工系统时使用的模型
论文不是只评估 SoulX-Duplug 单独模块，还把它接入一个完整的模块化全双工语音对话系统。这个系统由以下部分组成：

| 模型/模块                   | 用途         | 说明                                                                               |
| ----------------------- | ---------- | -------------------------------------------------------------------------------- |
| **SoulX-Duplug**        | 语音理解与状态管理  | 判断用户状态，控制系统什么时候听、说、停、等。                                                          |
| **Qwen2.5-7B-Instruct** | 回答生成 LLM   | 负责根据用户输入生成文本回答。论文明确说明，作者构建的级联全双工系统使用 Qwen2.5-7B-Instruct 进行 response generation。 |
| **IndexTTS-1.5**        | TTS 语音合成模型 | 负责把 Qwen2.5-7B-Instruct 生成的文本回答转成语音输出。论文中系统级评估使用 IndexTTS-1.5 作为 TTS 模型。         |
### 3.2.5 系统级对比实验中的模型
这些模型主要出现在 **Bilingual Full-Duplex-Bench** 的系统级对比实验中，用来和 SoulX-Duplug-based system 比较全双工交互能力。

|模型/系统|用途|类型/说明|
|---|---|---|
|**dGSLM**|系统级对比基线|端到端连续输出类全双工模型，用于比较 Pause Handling、Turn Taking、User Interruption 等任务表现。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**PersonaPlex**|系统级对比基线|端到端 full-duplex conversational speech model，对比系统级全双工交互表现。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Moshi**|系统级对比基线|实时语音对话模型，属于端到端连续输出类模型之一。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Freeze-Omni**|系统级对比基线|端到端状态驱动语音对话模型。论文同时在英文和中文测试集上与 Freeze-Omni 对比。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Gemini Live**|系统级对比基线|商业语音对话系统，用于比较系统级全双工交互能力。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Sonic**|系统级对比基线|用于 Full-Duplex-Bench v1.5 相关任务的对比。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**GPT-4o**|系统级对比基线|商业多模态/语音对话系统，用于对比 backchannel 和 interruption 等系统级指标。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
### 3.2.6 状态预测模块对比实验中的模型
这些模型主要用于和 SoulX-Duplug 比较“状态预测模块”本身的能力，尤其是 Easy Turn testset 上的 Complete / Incomplete 判断。

|模型/模块|用途|说明|
|---|---|---|
|**Easy Turn**|非流式状态预测基线|中文状态预测模块，能够进行 ASR 和 turn detection，但不支持 streaming。论文表 1 中指出 Easy Turn 支持 ASR 和端到端优化，但仅支持中文且非流式。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**FireRedChat**|插件式全双工系统/状态控制基线|采用 VAD、ASR、text-based turn detection 的级联或半级联实现。论文表 1 中其特点是支持 ASR，但不是端到端优化，也不是 streaming。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Phoenix-VAD**|streaming semantic endpoint detection 基线|支持流式和端到端优化，但不包含 ASR，也不显式利用文本作为输入。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**FlexDuo**|streaming full-duplex dialogue control 基线|一个解耦式全双工对话控制与生成框架。论文指出其 backbone 约 7B 参数，实时部署计算压力较大。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**TEN Turn Detection**|文本 turn detection 模型|在 Easy Turn 对比中与 SenseVoice En 或 Paraformer 组成非流式 pipeline，用于判断 Complete / Incomplete。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Smart Turn V2**|非流式 turn detection 基线|在 Bilingual Easy Turn testset 上作为状态预测对比模型。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**SenseVoice En + TEN Turn Detection**|英文非流式 pipeline 基线|SenseVoice En 负责 ASR，TEN Turn Detection 负责文本级 turn detection。用于英文 Easy Turn 对比。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|
|**Paraformer + TEN Turn Detection**|中文非流式 pipeline 基线|Paraformer 负责中文 ASR，TEN Turn Detection 负责 turn detection。用于中文 Easy Turn 对比。([arXiv](https://arxiv.org/html/2603.14877v1 "SoulX-Duplug: Plug-and-Play Streaming State Prediction Module for Realtime Full-Duplex Speech Conversation"))|

# 4 SoulX-Duplug 的三个训练阶段
Hybrid 3-stage Training with Teacher-Forced Inference，三个训练阶段分别是：
- **Stage 1：Non-Streaming ASR Pretraining**
- **Stage 2：Streaming ASR Adaptation**
- **Stage 3：Duplex State Prediction Fine-tuning / State Prediction SFT**
## 4.1 Stage 1：Non-Streaming ASR Pretraining
阶段目标：先让模型具备基本的语音识别能力，学会从完整语音中识别文本。

这一阶段暂时不强调低延迟，也不要求严格按 160 ms chunk 流式输出，而是让模型先建立基础的映射能力：
```
语音 token → 文本 token
```
因为后续状态预测依赖文本语义，如果模型连用户说了什么都识别不好，那么它也很难判断用户是“说完了”“没说完”“附和”还是“打断”。

论文在消融实验中也说明，去掉前两个 ASR 预训练阶段后，状态预测准确率会明显下降，说明模型在状态预测时确实依赖 ASR 能力；ASR 预训练提供了更好的语义表示，有利于第三阶段 SFT 和后续推理。

### 4.1.1 输入数据
输入数据：大规模中英文 ASR 语音数据
论文中列出的数据包括：

| 语言  | 数据集                                                                          | 规模          |
| --- | ---------------------------------------------------------------------------- | ----------- |
| 中文  | AISHELL-1、AISHELL-3、WenetSpeech、VoxBox 中的 CommonVoice-CN、Emilia-CN、MAGICDATA | 约 47,000 小时 |
| 英文  | LibriSpeech、GigaSpeech、VoxBox 中的 CommonVoice-EN、Emilia-EN                    | 约 31,000 小时 |
### 4.1.2 模型训练内容
SoulX-Duplug 内部采用：

| 组件                    | 作用                                       |
| --------------------- | ---------------------------------------- |
| GLM-4-Voice tokenizer | 把音频转成离散 speech tokens                    |
| Linear projector      | 把音频 token embedding 映射到 LLM embedding 维度 |
| Qwen3-0.6B            | 作为 LLM backbone，预测文本 token / 状态 token    |
论文说明，GLM-4-Voice tokenizer 作为 speech encoder，在训练过程中**保持冻结**；在 ASR pretraining 阶段，LLM（Qwen3-0.6B） 和 adapter layers（Linear projector） 会进行 fully fine-tuned。

因此 Stage 1 的训练重点是：
```
冻结 speech tokenizer
训练 linear projector
训练 Qwen3-0.6B backbone
目标：根据音频 token 预测完整 ASR 文本 token
```

### 4.1.3 输出产物
Stage 1 结束后，得到的产物：具备基础中英文 ASR 能力的 SoulX-Duplug 初始模型。
它还不一定能流式工作，也还不能做全双工状态预测，但它已经学到了**语音和文本之间的基础对应关系**。

### 4.1.4 Stage 1 Todo 列表

#### A. 数据准备
![[Pasted image 20260530110950.png]]
- [ ] 收集中文 ASR 数据：AISHELL-1、AISHELL-3、WenetSpeech、CommonVoice-CN、Emilia-CN、MAGICDATA 等
	- [x] AISHELL-1：OpenSLR SLR33  
	- [x] AISHELL-3：OpenSLR SLR93  
	- [ ] WenetSpeech：OpenSLR SLR121 / WenetSpeech GitHub  
	- [ ] MAGICDATA Mandarin Read Speech：OpenSLR SLR68  
	- [ ] VoxBox：Hugging Face SparkAudio/voxbox  
	- [ ] Emilia：Hugging Face amphion/Emilia-Dataset / OpenDataLab
- [ ] 收集英文 ASR 数据：LibriSpeech、GigaSpeech、CommonVoice-EN、Emilia-EN 等
	- [ ] LibriSpeech：OpenSLR SLR12  
	- [ ] GigaSpeech：SpeechColab/GigaSpeech GitHub / Hugging Face speechcolab/gigaspeech  
	- [ ] CommonVoice-EN：VoxBox 子集或 Mozilla Common Voice 原始数据  
	- [ ] Emilia-EN：VoxBox 子集或 Emilia 原始数据
- [x] 统一音频格式：采样率（具体采样率要以官方代码或 GLM-4-Voice tokenizer 的要求为准）、声道数、音频编码格式
- [x] 清洗转写文本：去除异常字符、空文本、明显错误标注
- [x] 构建音频路径与文本转写的 manifest 文件
- [x] 优先读取每个公开数据集的官方 train/dev/test split  
- [x] 对没有官方划分的数据集，按 speaker-disjoint 或 session-disjoint 原则划分
- [x] 混合多个数据集时，单独保留统一 validation set 方便选 checkpoint
#### B. 模型准备
- [ ] 加载 GLM-4-Voice tokenizer
- [ ] 冻结 speech tokenizer 参数
- [ ] 加载 Qwen3-0.6B 作为 LLM backbone
- [x] 实现 audio token embedding 到 LLM embedding 的 linear projector
- [x] 检查 audio token 与 text token 的拼接格式
#### C. 训练任务
- [ ] 将完整语音输入转换为 speech tokens
- [ ] 使用 speech tokens 条件化预测完整 ASR 文本
- [ ] 使用 token-level cross entropy 训练文本 token
- [ ] 训练 projector 和 LLM backbone
- [ ] 定期在验证集上计算 ASR WER / CER
#### D. 阶段验收
- [ ] 模型能够根据完整音频生成基本正确的中英文转写
- [ ] 中文 CER 达到可接受范围
- [ ] 英文 WER 达到可接受范围
- [ ] 保存 Stage 1 checkpoint

## 4.2 Stage 2：Streaming ASR Adaptation
阶段目标：把第一阶段学到的非流式 ASR 能力，转换成适合实时全双工对话的 chunk-based streaming ASR 能力。
也就是说，模型不能再等整句音频结束后才转写，而是要边听边输出。

SoulX-Duplug 的基本流式单位是 160 ms audio chunk。论文说明，每个 160 ms 音频 chunk 对应两个音频 token；模型会先预测当前 chunk 对应的 ASR token，然后再预测该 chunk 的状态 token。

### 4.2.1 为什么需要单独做 Stage 2
原因：非流式 ASR 和流式 ASR 的难度不一样。
非流式 ASR 可以看到完整句子：
```
用户完整说完一句话
  ↓
模型根据完整上下文转写
```
流式 ASR 只能看到当前和有限历史：
```
160 ms chunk 1 → 输出局部文本
160 ms chunk 2 → 输出局部文本
160 ms chunk 3 → 输出局部文本
...
```
这种情况下会遇到几个问题：

| 问题       | 原因                          |
| -------- | --------------------------- |
| 词 / 字被切断 | 160 ms chunk 可能切在音节、音素、单词中间 |
| 上下文不足    | 当前 chunk 只能看到有限历史和少量未来      |
| 输出不稳定    | 前一刻识别结果可能随着后续音频变化           |
| 对齐困难     | 需要知道每个文本 token 应该属于哪个 chunk |
论文也在讨论中指出，非常小 chunk size 下的 streaming ASR 本身很难，因为声学片段经常会切在音素、音节或单词边界中间，尤其英文单词容易被相邻 chunk 分割，导致识别不稳定。

### 4.2.2 输入数据
Stage 2 仍然使用 ASR 数据，但需要额外准备：
```
音频 chunk 与文本 token 的时间对齐信息
```
论文中说明，streaming ASR training 会先获得 character-level 或 word-level alignments，然后把数据重新组织成 interleaved chunk-based format；中文时间戳由 Paraformer 生成，英文时间戳由 WhisperX 生成。
也就是说，你需要把原始 ASR 数据从：
```
完整音频 → 完整文本
```
变成：

```
chunk_1 → 当前 chunk 对应文本 token
chunk_2 → 当前 chunk 对应文本 token
chunk_3 → 当前 chunk 对应文本 token
...
```

### 4.2.3 模型训练内容
Stage 2 的训练目标：给定历史音频 chunk 和当前音频 chunk，预测当前 chunk 对应的 ASR 文本 token。

格式上开始接近论文 3.4 节描述的 interleaved prediction paradigm：
```
audio chunk i
  ↓
ASR token sequence for chunk i
```
此时还可以主要关注 ASR，不一定加入完整状态 token 训练。

论文中明确说，前三阶段中的前两个阶段 focus on speech recognition capability，即主要训练语音识别能力。

### 4.2.4 输出产物
Stage 2 结束后，得到：具备 chunk-based streaming ASR 能力的模型。
它应该能在模拟在线输入中，随着音频 chunk 到达，逐步输出对应文本。

### 4.2.5 Stage 2 Todo 列表

#### A. 时间戳与对齐
- [ ] 为中文 ASR 数据生成字符级或词级时间戳
- [ ] 使用 Paraformer 生成中文 timestamp / alignment
- [ ] 为英文 ASR 数据生成词级时间戳
- [ ] 使用 WhisperX 生成英文 timestamp / alignment
- [ ] 检查时间戳质量，过滤明显错位样本
- [ ] 将完整转写文本切分到对应 audio chunk
#### B. Chunk 数据构造
- [ ] 按 160 ms 切分音频 chunk
- [ ] 为每个 chunk 提取对应 audio tokens
- [ ] 为每个 chunk 构造对应 ASR token sequence
- [ ] 设计 chunk 内没有文本输出时的占位策略，例如 `<asr_eos>` 或空输出
- [ ] 构造 interleaved chunk-based training format
- [ ] 验证一个样本的 audio chunk、ASR token、时间戳是否严格对齐
#### C. 流式建模
- [ ] 实现流式输入缓存机制
- [ ] 限制模型只能使用历史上下文和允许的有限 look-ahead
- [ ] 按 chunk 顺序预测 ASR token
- [ ] 训练模型适应 incremental decoding
- [ ] 在验证集中测试流式 ASR 的稳定性
#### D. 阶段验收
- [ ] 模型可以在 chunk-by-chunk 输入下输出流式 ASR 文本
- [ ] 流式 ASR 的 CER / WER 可接受
- [ ] 输出延迟接近设计目标
- [ ] 保存 Stage 2 checkpoint

## 4.3 Stage 3：Duplex State Prediction Fine-tuning / State Prediction SFT
阶段目标：让模型在流式 ASR 的基础上，学习全双工对话状态控制。

换句话说，前两个阶段解决：
```
用户说了什么？
```
第三阶段解决：
```
用户当前在对话中处于什么状态？
AI 应该继续说、停下、等待，还是接话？
```
论文说，第三阶段专门让模型适配 real-time dialogue management；并且在第三阶段，模型会对 VAD、ASR 和 state prediction 任务进行端到端优化。

### 4.3.1 输入数据
Stage 3 需要的是**带状态标签的对话语音数据**。
论文中使用：

| 语言  | 数据来源                                      |
| --- | ----------------------------------------- |
| 英文  | Fisher dataset，千小时级                       |
| 中文  | 作者内部构造的万小时级 in-house corpus，格式与 Fisher 类似 |
作者还说明，中文没有合适的开源数据，因此使用了内部语料；标注流程包括 alignment、双 ASR 一致性过滤、噪声增强，以及使用 Qwen2.5-72B-Instruct 标注 state labels。

**注意**：![[Pasted image 20260527145028.png]]

### 4.3.2 状态标签构造
第三阶段必须构造五类状态标签：

```
<|user_idle|>
<|user_nonidle|>
<|user_backchannel|>
<|user_complete|>
<|user_incomplete|>
```

这些状态要对齐到 chunk 级别。

例如：

```
chunk_1：静音 → user_idle
chunk_2：用户开始说话 → user_nonidle
chunk_3：用户继续说话 → user_nonidle
chunk_4：用户停顿，但语义未完成 → user_incomplete
chunk_5：用户继续说话 → user_nonidle
chunk_6：用户说完 → user_complete
```

如果是 backchannel：

```
用户：“嗯嗯”“对”“是的”“yeah”“uh-huh”
→ user_backchannel
```

如果是噪声或无语义片段：

```
静音、背景噪声
→ user_idle
```

### 4.3.3 训练格式
Stage 3 的训练格式就是论文图 4 / 3.4 节描述的核心形式：

```
audio tokens for chunk i
  ↓
ASR text tokens for chunk i
  ↓
state token for chunk i
```

即：

```
audio_i → asr_i → state_i
audio_i+1 → asr_i+1 → state_i+1
audio_i+2 → asr_i+2 → state_i+2
...
```

论文明确说，模型在每个 chunk 上先预测当前 chunk 的 ASR token sequence，然后再预测 dialogue state token；这种交错设计让状态预测时可以获得文本语义指导，同时保持流式推理。

### 4.3.4 损失函数
Stage 3 中不同 token 类型数量差异很大：

```
普通文本 token 很多
<asr_eos> 数量较多
状态 token 数量较少
```

如果直接用普通 cross entropy，模型可能主要优化高频文本 token，而忽略低频但关键的状态 token。

所以论文采用 **weighted token-level training objective**，对不同 token type 设置不同权重，平衡文本 token、`<asr_eos>` 和各种 state token 的优化。

复现时需要重点做：

```
为 text tokens 设置权重
为 <asr_eos> 设置权重
为 state tokens 设置权重
```
补充：
1. <asr_eos>是一个**特殊文本 token**，可以理解为：**当前音频 chunk 对应的 ASR 文本输出结束了。**

尤其要防止状态 token 被大量 ASR token 淹没。

### 4.3.5 训练方式
论文中说，状态预测训练阶段对 LLM 使用 **LoRA fine-tuning**，并在双语训练集上训练；speech tokenizer 仍然冻结。

因此 Stage 3 可以设计为：

```
冻结 GLM-4-Voice tokenizer
加载 Stage 2 checkpoint
对 Qwen3-0.6B 使用 LoRA
训练 linear projector / LoRA 参数
目标：联合预测 ASR token + state token
```

是否训练 projector 可以根据开源代码确认；从复现任务设计角度，至少需要保留 projector 可训练或验证其是否冻结。

### 4.3.6 数据增强
论文中为了提高鲁棒性，加入了噪声增强：

|噪声数据|加入方式|
|---|---|
|MUSAN|全局加入噪声|
|ESC-50|加到 silence segments|

这一步的目的，是让模型能在真实语音对话中更稳定地区分：

```
静音 / 噪声 / 背景声 / 用户真实语音
```

论文明确提到使用 Musan noise globally 和 ESC-50 noise to silence segments。

### 4.3.7 输出产物

Stage 3 结束后，你应该得到最终的 SoulX-Duplug 模型：

> 能够在流式音频输入下，结合 ASR 文本语义，输出用户状态 token。

它可以作为插件接入半双工系统：

```
SoulX-Duplug 判断状态
  ↓
控制 ASR / LLM / TTS 系统
  ↓
决定 AI 是否继续说、停止、等待或接话
```

### 4.3.8 Stage 3 Todo 列表

#### A. 数据准备
- [ ] 准备英文对话语音数据，例如 Fisher
- [ ] 准备中文对话语音数据，例如公开中文会议/对话数据或自建语料
- [ ] 统一双语数据格式
- [ ] 生成或整理说话人通道信息
- [ ] 生成音频与文本 alignment
- [ ] 对中文数据执行双 ASR 一致性过滤
- [ ] 过滤低质量样本、异常音频、错位转写

#### B. 状态标签构造
- [ ] 定义五类 state tokens：idle、nonidle、backchannel、complete、incomplete
- [ ] 设计 chunk-level 状态标注规则
- [ ] 使用 LLM，例如 Qwen2.5-72B-Instruct，辅助标注 state labels
- [ ] 人工抽样检查状态标签质量
- [ ] 构造 chunk-level state label 序列
- [ ] 检查状态标签与音频时间轴是否对齐
- [ ] 统计各类 state token 的分布，检查类别不平衡

#### C. 噪声增强
- [ ] 准备 MUSAN 噪声数据
- [ ] 准备 ESC-50 噪声数据
- [ ] 实现全局噪声增强
- [ ] 实现 silence segment 噪声注入
- [ ] 验证增强后音频不会破坏状态标签

#### D. 训练格式构造
- [ ] 按 160 ms chunk 切分音频
- [ ] 提取每个 chunk 的 audio tokens
- [ ] 对齐每个 chunk 的 ASR text tokens
- [ ] 对齐每个 chunk 的 state token
- [ ] 构造 interleaved sequence：audio → ASR text → state
- [ ] 加入 `<asr_eos>` 等特殊 token
- [ ] 检查每条样本的序列长度和 token 类型分布

#### E. 损失函数
- [ ] 实现 weighted token-level cross entropy
- [ ] 为普通 text tokens 设置权重
- [ ] 为 `<asr_eos>` 设置权重
- [ ] 为各类 state tokens 设置权重
- [ ] 调试权重，避免 state token 被文本 token 淹没
- [ ] 记录不同 token type 的 loss

#### F. 模型微调
- [ ] 加载 Stage 2 checkpoint
- [ ] 冻结 GLM-4-Voice tokenizer
- [ ] 为 Qwen3-0.6B 配置 LoRA
- [ ] 在中英文状态预测数据上训练
- [ ] 监控 ASR loss、state prediction loss
- [ ] 监控 complete / incomplete / backchannel 等状态准确率
- [ ] 保存最终 SoulX-Duplug checkpoint

#### G. 阶段验收
- [ ] 模型能流式输出 ASR 文本
- [ ] 模型能输出五类状态 token
- [ ] 在 Easy Turn testset 上计算 ACCComplete、ACCIncomplete、Avg. ACC
- [ ] 在模拟流式环境中测试实际 latency
- [ ] 对 backchannel、interruption、pause 样本进行人工案例检查

## 4.4 推理阶段：Teacher-Forced Inference
论文说，推理时使用轻量外部 ASR 模型为每个 chunk 提供 teacher-forced streaming ASR outputs。英文使用 SenseVoice Small，中文评估时使用 Paraformer。这样可以在保留端到端训练收益的同时，提升实时部署中的准确性和效率。

### 4.4.1 推理阶段 Todo

#### A. 外部 ASR 准备
- [ ] 准备英文 ASR teacher：SenseVoice Small
- [ ] 准备中文 ASR teacher：Paraformer
- [ ] 实现 chunk-level streaming ASR 输出
- [ ] 将外部 ASR 输出转换为 SoulX-Duplug 所需 text token 格式

#### B. 推理流程
- [ ] 输入实时音频流
- [ ] 按 160 ms chunk 处理音频
- [ ] 外部 ASR 为当前 chunk 提供文本 token
- [ ] 将 teacher-forced ASR token 喂给 SoulX-Duplug
- [ ] SoulX-Duplug 预测当前 chunk 的 state token
- [ ] 根据 state token 控制下游系统

#### C. 验收
- [ ] 测试无 teacher forcing 的状态预测准确率
- [ ] 测试有 teacher forcing 的状态预测准确率
- [ ] 对比二者差异
- [ ] 测量实际推理 latency

# 5 课题目标与论文实验匹配
| 目标                    | 论文中可对应的 benchmark / 指标                                        | 匹配程度      | 备注                             |
| --------------------- | ------------------------------------------------------------- | --------- | ------------------------------ |
| 目标一：VAD / 用户尾点检测      | Bilingual Easy Turn Testset：ACCComplete、ACCIncomplete、Latency | **较强匹配**  | 指标语义基本对应，但论文准确率未完全达到 >90%      |
| 目标一：流式检测              | Streaming state prediction、Latency                            | **强匹配**   | SoulX-Duplug 是流式模块，理论延迟 240 ms |
| 目标二：有效意图误拒            | 无直接指标                                                         | **不匹配**   | 需要额外设计 FAR / FRR 类指标           |
| 目标二：无效意图拒识            | `<                                                            | user_idle | >` 有弱相关，但无专门指标                 |
| 目标三：打断场景              | Full-Duplex-Bench User Interruption：TOR、RpR、SL、RL             | **部分匹配**  | 能评估打断响应和停止延迟                   |
| 目标三：前 4 字 / 1 秒有效语音判断 | 无直接指标                                                         | **不匹配**   | 论文没有早期打断意图判定指标                 |
| 目标三：打断中的有效/无效意图拒识     | 无直接指标                                                         | **不匹配**   | 需要额外构造有效打断、无效打断测试集             |
## 5.1 VAD / 尾点检测指标

| 指标                       | 定义                                  | 对应目标             |
| ------------------------ | ----------------------------------- | ---------------- |
| Pause Endpoint Accuracy  | 用户停顿但未说完时，正确预测 Incomplete 的比例       | 用户停顿预测准确率 >90%   |
| Normal Endpoint Accuracy | 用户真正说完时，正确预测 Complete 的比例           | 用户正常尾点预测准确率 >90% |
| Endpoint Latency         | 用户尾点发生到模型输出 complete/incomplete 的时间 | 尾点预测时延 <300ms    |

这部分可以直接沿用论文的 **ACCIncomplete、ACCComplete、Latency**。

---

## 5.2 拒识任务指标

|指标|定义|目标方向|
|---|---|---|
|Effective Intent False Rejection Rate, FRR|有效用户请求被拒识的比例|<2%|
|Invalid Intent Rejection Rate, IRR|无效输入被正确拒识的比例|>90%|
|Noise Rejection Rate|背景噪声被正确拒识的比例|>90%|
|Interfering Speaker Rejection Rate|干扰人语音被正确拒识的比例|>90%|
|Non-target Speaker / Non-target Language Rejection Rate|非机主或非目标语言被正确拒识的比例|>90%|

这些论文没有现成指标，需要自己构造测试集。

---

## 5.3 打断任务指标

| 指标                                          | 定义                             | 对应目标    |
| ------------------------------------------- | ------------------------------ | ------- |
| Early Interruption Detection Accuracy       | 只用句首前 4 个字或前 1 秒音频判断是否有效打断的准确率 | 打断早期判断  |
| Effective Interruption False Rejection Rate | 有效打断被拒绝或忽略的比例                  | <2%     |
| Invalid Interruption Rejection Rate         | 无效打断，如噪声、干扰人、非目标语音，被正确拒识的比例    | >85%    |
| Stop Latency, SL                            | 用户开始打断到 AI 停止说话的时间             | 可沿用论文指标 |
| Respond Rate, RpR                           | 有效打断后系统是否回应                    | 可沿用论文指标 |
| Response Latency, RL                        | 用户打断结束到系统回应的延迟                 | 可沿用论文指标 |

其中 **SL、RpR、RL** 可以直接参考论文；但 **前 4 字 / 1 秒有效语音判断** 和 **无效意图拒识率** 需要新增。

# 6 代码实现
实现过程中一些不确定的地方：
	论文明确给出三阶段训练、160 ms chunk、GLM-4-Voice tokenizer 冻结、Qwen3-0.6B、ASR pretraining 全参数微调等信息，但 batch size、学习率、采样比例、scheduler、截断长度、部分 alignment 细节属于当前复现中的工程假设。参考：arXiv 3.6/5.1 训练描述和数据集说明

存在的一些需要完善的内容：
- [ ] 断点续训：现在会保存 checkpoint，但还没有完整的 --resume 自动恢复训练步数/optimizer 的流程。长时间训练时建议后续补。

## Stage 3 中文 in-house corpus 平替数据集方案

论文中 Stage 3 使用的中文数据集是作者内部构建的万小时级 in-house corpus，未公开开源。因此无法做到完全复现或完全平替。公开条件下，可以采用中文对话/会议语音数据集进行近似替代。

整体推荐顺序为：

**MagicData-RAMC > AISHELL-4 / AliMeeting > CS-Dialogue > TALCS > HKUST Mandarin Telephone Speech**

| 数据集名字 | 数据集简介 | 可替换的理由 |
|---|---|---|
| **MagicData-RAMC** | 开源中文普通话多轮对话语音数据集，约 **180 小时**，手机录制，包含多名说话人，提供人工转写、说话人语音活动时间戳以及官方训练/验证/测试划分。 | **最推荐作为 Stage 3 中文主替代数据集。** Stage 3 需要的是中文对话语音、转写、时间边界和说话人活动信息，用于构造 `user_idle`、`user_nonidle`、`user_backchannel`、`user_complete`、`user_incomplete` 等状态标签。MagicData-RAMC 是中文多轮对话数据，场景上最接近论文中 Fisher-like 中文对话语料的需求。 |
| **AISHELL-4** | 中文真实会议语音数据集，约 **120 小时**，包含多场真实会议，每场会议通常有多名说话人，提供转写和说话人活动信息，包含短暂停顿、重叠说话、快速话轮切换和噪声等现象。 | 适合补充全双工语音系统中的**短暂停顿、多人重叠、快速换话、噪声干扰**等现象。这些现象与 SoulX-Duplug 关注的误停顿、误响应、误打断问题高度相关。但它是会议场景，不是双人对话场景，因此更适合作为 MagicData-RAMC 的补充数据。 |
| **AliMeeting** | 中文真实会议语音数据集，约 **118 小时**，包含真实多人会议场景，提供远场麦克风阵列和近场耳麦数据，适用于会议转写、说话人相关任务和多方语音理解任务。 | 适合增强模型对**远场语音、多人话轮切换、会议噪声、多人干扰**的鲁棒性。它可以补充 Stage 3 中对复杂真实场景的覆盖，但同样不是 Fisher 式双人电话对话，因此不建议单独作为主替代数据。 |
| **CS-Dialogue** | 自发式普通话-英语 code-switching 双人对话数据集，约 **104 小时**，包含双人自然对话录音和完整转写。 | 优势是**双人自然对话**，比会议数据更接近用户与系统轮流说话的交互结构，适合用于构造 `complete`、`incomplete`、`backchannel` 等状态标签。缺点是中英混合，不是纯中文普通话数据，因此更适合作为补充数据。 |
| **TALCS** | 普通话-英语 code-switching 语音数据集，约 **587 小时**，来自真实在线一对一英语教学场景，包含较多师生互动、问答、停顿和接话现象。 | 规模较大，且是一对一交互场景，可以补充模型对长对话、问答式交流和教学场景的适应能力。但由于场景偏在线英语教学，语言混合明显，与论文中的中文 in-house conversational corpus 仍有较大差距。 |
| **HKUST Mandarin Telephone Speech** | 普通话电话会话语音数据，约 **200 小时**量级，包含自然电话对话和转写，是中文电话对话领域常用数据集。 | 从数据形态上看，它是**最接近 Fisher 的中文数据**，因为 Fisher 本身也是电话对话语料。适合构造双人会话中的 `complete`、`incomplete`、`backchannel` 等状态。但它不是免费开源数据，需要 LDC 授权，因此只能作为有条件情况下的高质量替代。 |

## 开会汇报内容：
第一次：仅读了论文
第二次：
	1. 关于项目：
		1. 目前我已经完成了 SoulX-Duplug 论文中 Stage 1/2 的核心代码，包括 non-streaming ASR pretraining 和 streaming ASR adaptation。
		2. 现在正在下载数据集，等待数据集下载完成后就可以正式开始训练。
		3. 关于代码实现需要说明的是，论文没有公开 batch size、learning rate、训练步数、精确数据采样权重（总数据集为14万多小时，实际只使用了 7.8 h 数据进行训练。中文目标约 47,000 小时，英文目标约 31,000 小时。）等细节，因此这些部分目前采用工程上的合理默认值，并写入配置文件，后续会根据训练效果继续调整。
	2. 关于之前提出的一个问题（如何高效的判断训练是否真实有效？）：
		为了高效验证训练是否真实有效，我计划采用小样本过拟合、训练前后指标对比和对照实验三种方式。
		A. 先用几百条数据验证模型是否能快速过拟合，如果不能过拟合，说明训练链路存在问题。
		B. 固定一小批 dev 数据，比较训练前后 CER/WER 和 loss 的变化，确认模型确实学到了 ASR 能力。
		C. 最后加入随机标签或 Stage2 从零训练的对照实验，排除 loss 下降但模型没有真正利用语音输入的情况。这样可以在不进行全量训练的情况下，低成本判断 Stage1/2 训练是否真实有效。
		D. 总结：因为模型是 0.6B，几百条数据不可能训练出真正泛化能力。小样本训练的目的不是验证最终效果，而是验证**训练链路**是否正确。它相当于训练流程的 sanity check：如果模型连几百条样本都无法过拟合，说明数据、标签、loss、tokenizer 或模型输入构造存在问题；如果能过拟合，只能说明训练流程基本可用。真正判断模型是否有效，还需要在几千到几万条数据上观察 dev loss 和 CER/WER是否下降，最终再通过全量数据训练来接近论文效果。
	3. 可替代 SoulX-Duplug 项目的论文：如下表格所示：
	

| 项目/论文                      | 对应技术目标         | 论文实验结果                                                                               | 与项目目标的关系                                       | 开源状态                           |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------ |
| **Easy Turn**              | 目标一：停顿、正常尾点、时延 | Complete 96.33%；Incomplete 97.67%；平均推理时延 263 ms                                      | 按论文指标，三项均达到要求                                  | 训练代码、模型权重、训练集、测试集均开放           |
| **JAL-Turn**               | 目标一            | Complete 96.67%；Incomplete 93.67%；时延 12 ms                                           | 按论文指标，三项均达到要求                                  | 目前论文未提供官方代码地址                  |
| **SoulX-Duplug**           | 目标一、目标三        | 中文 Complete 89.33%；Incomplete 79.33%；实际部署时延 295 ms；中文打断 Respond Rate 83%，停止时延 380 ms | 仅目标一的时延达标；准确率和打断误拒绝率不达标                        | 模型权重和流式推理代码开放，但训练代码、评测脚本尚未完整开放 |
| **Phoenix-VAD**            | 目标一            | Continue Recall 99.4%；Stop Recall 88.8%；整体准确率 98.6%；320 ms 步长，单次计算约 50 ms            | 停顿判断达标，但正常尾点召回率不足 90%，320 ms 步长也无法严格证明 <300 ms | 论文为主，未找到完整官方模型和代码              |
| **SID-model / SID-Bench**  | 目标二、目标三        | 平均 FIR 12.4%，对应无效输入拒识率约 87.6%；噪声/静音 FIR 2.6%，对应拒识率 97.4%；打断响应延迟 389 ms               | 噪声拒识达到目标二；整体无效意图达到目标三；未报告有效意图误拒绝率              | Benchmark、数据和评测代码开放，论文模型未完整开放  |
| **FireRedChat pVAD**       | 目标二、目标三        | 噪声/静音 FIR 9.8%，对应拒识率约 90.2%；综合 FIR 47.6%，对应拒识率约 52.4%；IRL 1.045 s                    | 对纯噪声刚好达到目标二，但对真实对话、旁人语音等明显不足                   | 开源全双工系统，可作为目标说话人 VAD 基线        |
| **Full-Duplex-Bench v1.5** | 目标二、目标三的评测     | 包含有效打断、Backchannel、Talking to Others、Background Speech 四类场景                          | 与“干扰人、非目标语音、背景语音”高度对应，但它是评测集，不是解决模型            | Benchmark 和评测流程开放              |
| **BayLing-Duplex**         | 目标三、整体全双工      | ISR@2s 100%，平均打断后重叠时长 1.10 s；Turn-taking SR@3s 92%                                   | 其“成功打断”定义是 2 秒内停止，不满足项目的前 1 秒/4 字要求；没有噪声和旁人实验  | 模型权重和推理代码开放，完整训练流程未开放          |

第三次：
## 1. 为什么选择 Easy-Turn 作为 Stage3 平替数据集
  Easy-Turn 比较适合作为平替，主要有几个原因：
  第一，它的任务形态接近 Stage3。Easy-Turn 本身就是面向 turn-taking detection 的语音数据集，包含 complete、incomplete、backchannel、wait 等状态标签。

  第二，它包含真实音频和转写文本。Stage3 不是纯文本训练，而是语音 token + 文本 + 状态标签联合训练。Easy-Turn 每条样本有真实 wav 音频、文本转写和状态标签，可以转换成 SoulX
  Stage3 所需的 manifest 格式。

  第三，它中英文覆盖更接近 SoulX 的双语设定。原论文里的部分中文数据不完全开源，Easy-Turn 至少提供了中文/英文相关的 turn-taking 数据，可以作为中文数据不可得时的公开替代。

  但使用 Easy-Turn 也有风险，模型效果可能下降，原因包括：
  - **数据分布不完全一致**：Easy-Turn 的采集场景、说话人、音频质量、标注规范，和 SoulX 原 Stage3 训练数据不完全相同。
  - **标签语义不完全等价**：Easy-Turn 的 complete/incomplete/backchannel 能映射到 SoulX 状态，但它不一定完全符合 SoulX 原论文的状态边界定义。
  - 缺少原始英文 Fisher 部分：当前快速版主要用了 Easy-Turn real subset，没有把 Fisher 英文对话数据完整纳入，因此双语覆盖仍不完整。
  - 抽样比例小：3000 条虽然是真实数据，但相对 Easy-Turn 全量和原论文 Stage3 数据仍然很小，只能验证续训练链路，不代表最终效果。
  - 训练步数很少：这次只跑了 20 step，模型只看了很小一部分训练样本，指标趋势有参考价值，但不能作为充分收敛结果。
  - 可能出现灾难性遗忘：如果后续只在 Easy-Turn 上长时间续训，模型可能向 Easy-Turn 的标签分布和语音风格偏移，导致原 SoulX 能力下降。
  - 验证集很小：本次为了快速演示，验证只用了少量 batch，所以 val 指标波动会比较大。

  ## 2. 3000 样本续训练结果怎么理解
  本次数据划分：
  总样本: 3000
  训练集: 2910
  验证集: 90
  训练 step: 20
  batch size: 1

  epoch 和 step 的区别：
  - epoch：完整遍历一遍训练集叫 1 个 epoch。这里训练集有 2910 条，如果 batch size = 1，那么完整 1 个 epoch 大约需要 2910 个 step。
  - step：一次参数更新叫 1 个 step。本次设置 TOTAL_STEPS=20，所以只更新了 20 次参数。
  - 所以这次不是完整训练了 1 个 epoch，而是只跑了 20 / 2910 ≈ 0.69% 个 epoch。它是快速续训练验证，不是完整收敛实验。

  本次关键结果：
![[Pasted image 20260711211118.png]]
  各指标含义：
  - train/loss_step：当前训练 step 的 loss。它会抖动，因为每个 batch 的样本不同。
  - train/loss_epoch：当前训练阶段累计平均 loss。越低通常表示模型在训练样本上拟合得更好。
  - val/loss：验证集 loss。这个比训练 loss 更重要，因为它反映模型对未参与训练样本的泛化情况。本次从 7.97 降到 4.06，说明续训练确实产生了有效优化信号。
  - train/state_acc：训练集上状态 token 的预测准确率，也就是 complete/incomplete/backchannel/nonidle 等状态判断是否正确。
  - val/state_acc：验证集状态准确率。本次只有 0.229，说明模型在真实 Easy-Turn 子集上的状态判断还没有充分适配。
  - train/token_acc：训练集文本 token 预测准确率。
  - val/token_acc：验证集文本 token 预测准确率。

  曲线图可以这样解释：
  - 如果 train/loss 下降，说明模型正在学习当前数据。
  - 如果 val/loss 也下降，说明不是单纯记忆训练样本，而是对验证样本也有改善。
  - 如果 train/state_acc 上升但 val/state_acc 不升，可能说明训练步数太少、验证集太小，或者存在数据分布差异。
  - 如果 train/loss 降得很快但 val/loss 不降，可能是过拟合。
  - 本次结果最重要的点是：val/loss 从 7.97 降到 4.06，说明使用官方 Stage3 权重继续训练真实 Easy-Turn 子集是能跑通并产生有效优化趋势的。

  ## 3. 汇报稿子
  原论文中 Stage3 使用的数据包含中英文数据，但其中部分中文数据并没有完整开源。因此我在复现时采用了一个公开可获取的替代数据集 Easy-Turn。选择 Easy-Turn 的原因是，它本身就是面向
  turn-taking detection 的数据集，包含真实音频、文本转写以及 complete、incomplete、backchannel 等标签，和 SoulX Stage3 的状态预测任务比较接近。

  下载并加载了作者公开的 Stage3 权重 SoulX-Duplug-0.6B-Bilingual.pth，在这个基础上进行继续训练。也就是说，这次实验验证的是：作者开源
  的 Stage3 模型能否在真实 Easy-Turn 子集上继续训练，并输出 loss、验证指标、训练曲线和新的 checkpoint。

  后续如果继续推进，我建议从两个方向做增强：一是扩大真实数据规模，比如严格按照 Easy-Turn 全量的 1/100 小时数进行抽样；二是增加训练 step，并引入更稳定的验证集评估，观察 state
  accuracy 和 token accuracy 是否持续提升。同时，也需要注意 Easy-Turn 和原论文数据分布不完全一致，长时间只在 Easy-Turn 上训练可能导致模型向该数据集偏移，因此后续最好混入英文
  Fisher 或其他公开双语对话数据，降低模型能力退化风险。