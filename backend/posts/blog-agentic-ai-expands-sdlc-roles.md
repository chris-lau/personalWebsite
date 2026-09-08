# The SDLC Skill Stack Is Getting Larger: How Agentic AI Expands Every Engineering Role

In [my last post](/blog/agentic-ai-sdlc-engineering-practices), I wrote about how agentic AI changes the traditional software development lifecycle.

The next question is more important:

**What happens to the people already working inside that lifecycle?**

I don't think most traditional SDLC roles disappear.

I think they expand.

As software becomes more agentic, engineers will still need the fundamentals they already have—but they'll also need a new set of skills for systems that are probabilistic, stateful, tool-using, and increasingly autonomous.

---

## 1. The New Competency Layer at a Glance

| Role | What Gets Added on Top of the Fundamentals |
| :--- | :--- |
| **Software Engineers** | Agent orchestration, context management, constraining non-determinism |
| **QA Engineers** | Eval datasets, trajectory analysis, rubric-based scoring, LLM-as-a-Judge |
| **DevOps & SRE** | Behavioral observability: reasoning steps, tool calls, token spend |
| **Software Architects** | Model routing, memory boundaries, tool permissions, autonomy levels |
| **Security Engineers** | Prompt injection, poisoned context, governing what software may *do* |
| **Product Managers** | Defining behavior—reliability thresholds, failure modes, escalation rules |

---

## 2. Software Engineers

Writing reliable application logic is no longer enough.

Engineers increasingly need to understand agent orchestration, context management, tool interfaces, structured outputs, model selection, failure recovery, and how to constrain non-deterministic behavior.

The question changes from:

> "Does this code execute correctly?"

to:

> "Can this system reliably reach the right outcome across many possible execution paths?"

---

## 3. QA Engineers

Traditional testing assumes that the same input should usually produce the same expected output.

That assumption gets weaker with LLM-based systems.

QA teams will need to become comfortable with eval datasets, trajectory analysis, rubric-based evaluation, LLM-as-a-Judge, regression testing across model or prompt changes, and measuring success rates rather than only checking exact outputs.

---

## 4. DevOps and SRE

CPU, memory, latency, and error rates still matter.

But agentic systems introduce another operational layer:

* How many reasoning steps did the agent take?
* Which tools did it call?
* Where did the trajectory fail?
* How many tokens did it consume?
* Why did one request cost 20x more than another?

Observability increasingly has to cover the behavior of the agent itself, not just the infrastructure running underneath it.

---

## 5. Software Architects

Architecture is no longer only about services, APIs, databases, and message queues.

Architects may also need to think about model routing, memory boundaries, context windows, tool permissions, human approval points, and how much autonomy a system should actually have.

A new architectural question emerges:

> "What decisions should the model be allowed to make?"

---

## 6. Security Engineers

Agentic systems introduce an entirely new attack surface.

Prompt injection, tool misuse, excessive permissions, data leakage, poisoned context, and unintended actions become first-class security concerns.

Security moves beyond protecting what software can access.

It also has to govern what software is allowed to decide and do.

---

## 7. Product Managers

Requirements become harder to express as simple acceptance criteria.

For an agent, "works" may depend on reliability thresholds, acceptable failure modes, autonomy levels, escalation rules, latency, and cost.

PMs may increasingly need to define **behavior** rather than just functionality.

---

## 8. A New Competency Layer, Not a New Industry

That is the broader shift I find interesting.

AI may not create an entirely separate software industry with completely new roles.

Instead, it may add a new competency layer across almost every existing one.

Cloud computing didn't eliminate software engineering.

DevOps didn't eliminate developers or infrastructure teams.

Distributed systems didn't make traditional computer science irrelevant.

They changed what competent practitioners were expected to understand.

Agentic AI may be doing the same thing to the SDLC.

---

## 9. Who Benefits Most

The people who benefit most may not be those who abandon their existing expertise to become "AI experts."

They may be the developers, testers, architects, SREs, security engineers, and product leaders who combine strong fundamentals with an understanding of how probabilistic systems behave.

The SDLC isn't disappearing.

**Its skill stack is getting larger.**
