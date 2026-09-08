# Agentic Product Requirements: A 10-Part Framework for Defining AI Agent Behavior

In [my last post](/blog/agentic-ai-expands-sdlc-roles), I argued that agentic AI will change the skills required across traditional SDLC roles.

For Product Managers, I think one of the biggest changes will be how we define requirements.

Traditional software requirements are usually built around deterministic behavior:

> Given X input, the system should produce Y output.

But agentic systems don't always follow one predefined path.

They may decide which tool to call, what information to retrieve, whether to retry, when to ask for clarification, and when to escalate.

So the PM requirement can no longer stop at:

> "What should the feature do?"

It also needs to define:

> "What is the agent allowed to decide while trying to accomplish it?"

I've started thinking about agentic requirements through a simple framework.

---

## 1. User Goal

What outcome is the user actually trying to achieve?

Not:

> "Build an AI billing assistant."

But:

> "Help customers resolve common billing issues without requiring a human agent."

---

## 2. Agent Responsibility

What part of the problem is the agent responsible for?

* Can it only answer questions?
* Can it retrieve information?
* Can it make decisions?
* Can it execute actions?

The scope of responsibility needs to be explicit.

---

## 3. Autonomy

This may become one of the most important fields in an AI product requirement.

For example:

* The agent **can recommend** a refund.
* The agent **can prepare** a refund for approval.
* Or the agent **can autonomously issue** refunds under $50.

Same feature.

Very different product behavior and risk.

---

## 4. Allowed Tools and Actions

If an agent can interact with other systems, tool access becomes part of the product definition.

A PM may need to specify that the agent **can**:

* Read customer history
* Search the knowledge base
* Issue refunds below a threshold

But **cannot**:

* Delete customer records
* Change account ownership
* Execute high-value transactions

Tool permissions aren't just an implementation detail when the software can act autonomously.

---

## 5. Success Criteria

This is where agentic requirements start looking different from traditional acceptance criteria.

Instead of only asking:

> "Did the system return the expected output?"

We may need to measure:

* Task completion rate
* Correctness
* Tool-use accuracy
* Escalation accuracy
* Cost per completed task
* Latency
* Safety violations

The requirement becomes statistical rather than purely binary.

---

## 6. Failure Behavior

One of the most overlooked questions is:

> How should the agent fail?

* What happens when information is missing?
* What happens when two systems disagree?
* What happens when a tool fails?
* What happens when the agent doesn't know what to do?

A good requirement should specify the expected failure mode:

* Ask for clarification.
* Retry once.
* Escalate to a human.
* Or stop.

An agent that knows when not to act can be more valuable than one that tries to answer everything.

---

## 7. Guardrails

Some behavior should never depend on whether the model "understood the instructions."

Hard boundaries should be explicit.

For example:

* Maximum number of tool calls
* Maximum retries
* Maximum transaction value
* Maximum execution cost
* Actions requiring human approval

Where possible, these should be enforced deterministically rather than left entirely to prompts.

---

## 8. Evaluation Scenarios

PMs may also need to think in terms of representative scenarios rather than a handful of happy-path acceptance tests.

For each scenario:

* What is the expected outcome?
* What variations are acceptable?
* What behavior is unacceptable?

The agent may take several valid trajectories to reach the same result.

The product requirement should define the destination and the boundaries—not necessarily every step along the way.

---

## 9. Human Escalation

For agentic products, "when does the human take over?" should probably be a first-class requirement.

For example:

* Escalate when financial impact exceeds $50.
* Escalate when required information cannot be verified.
* Escalate when the request falls outside supported scenarios.

And when escalation happens, the agent should hand over enough context that the human doesn't need to restart the investigation.

---

## 10. Release Criteria

Finally, shipping an agentic feature may require a different definition of "done."

Instead of:

> "All acceptance tests passed."

It may look more like:

* Task success ≥ 90%
* Critical safety violations = 0
* Tool-call error rate < 2%
* Cost per successful task < target
* Latency within target
* No meaningful regression against the previous version

That starts to look much closer to an eval gate than a traditional feature checklist.

---

## The Way I Think About It

**Traditional product requirements define functionality.**

**Agentic product requirements define outcomes, autonomy, boundaries, and acceptable behavior.**

PMs don't need to become ML engineers.

But I do think they will increasingly need to understand how probabilistic systems behave well enough to define what "good" actually means.

That may become one of the most important product skills in the agentic AI era.

What would you add to an agentic AI requirements template?
