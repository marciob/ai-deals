# ai-deals — Project Plan (Hackathon / Token Track)

This plan assumes every user-facing action triggers real effects: real API calls, real provider acceptance, real proof submission, and real on-chain transactions (Monad mainnet) with real token gating (AIH on nad.fun). No “demo simulator”, no fake tx hashes, no mock state transitions.

0) Definition of “real” for this project

A task is “real” only if all of these happen:

Agent integration is real: an external agent tool can fetch https://<domain>/skill.md and execute actions against your API.

Provider participation is real: a human or business account accepts the task and submits proof through the UI.

Settlement is real: escrow and payout happen via transactions on Monad mainnet, with tx hashes shown in the UI.

Token gating is real: provider eligibility is checked from AIH stake (AIH token launched on nad.fun), enforced by on-chain or verifiable on-chain state.

1) Scope (minimal, but real)
Capability catalog (exact)

2 capabilities

restaurant_booking_call (the one you demo end-to-end)

document_translation (breadth hint; can be present but not demoed end-to-end)

Providers (exact)

3 providers for restaurant_booking_call, each with different:

price

ETA

rating (can be stored off-chain)

stake level (must be verifiable on-chain via AIH staking)

Demo flow (real)

Run 1: “normal” booking → agent selects provider based on price/rating/ETA.

Run 2: “urgent” booking → higher minStake filters out at least one provider → agent selects fast/high-stake provider.

2) System architecture (real components)
On-chain (Monad mainnet)

AIH token: created via nad.fun (record address in repo).

TaskEscrow contract:

Holds payment (native MON, simplest for hackathon).

Stores taskHash and later proofHash (or emits events).

Releases to provider or refunds on timeout.

StakeRegistry contract (uses AIH):

Providers stake AIH.

isEligible(provider, minStake) returns eligibility.

(Optional) lockStake(taskId, amount) / unlockStake(taskId) for stronger guarantees.

Rule: eligibility must be checked against on-chain state (no “trust me” stake values).

Off-chain (API + DB + storage)

API service (single backend is fine):

Capability discovery and provider search

Task creation and task state transitions

Proof upload metadata and verification result

Webhooks/events for agent tools

Database:

capabilities, providers, tasks, proofs, receipts

Object storage (for proof artifacts):

minimal: store files + hash them; keep URIs private

Auth

Agents: API key / signed token obtained via claim flow

Providers: wallet-based sign-in (recommended) or email + wallet link

3) UX requirements (real UX, agent-native)
Top-level toggle (hero segmented control)

Agent / Human / Business

All three are real entry points:

Agent: integration install + status/keys

Human: inbox + accept + proof

Business: offers + incoming requests (can be minimal)

Agent mode (must be “Moltbook-style”, not a text box)

Agent mode shows only:

Copyable command to fetch your canonical skill:

curl -fsSL https://<domain>/skill.md

A claim/register step that returns an API token for the agent tool (real).

A small “health/status” area:

connected agent identity

last webhook delivery

last successful task execution

No primary natural-language input UI in Agent mode.
If you need a human demo entry for creating a task, that can live in a separate “Dashboard” page accessible from navigation, but Agent mode stays integration-first.

Human mode

Real task inbox (backed by DB)

Task detail (accept → in progress → submit proof)

Proof submission (file upload + structured fields)

Wallet connection + stake status shown (read from chain)

Business mode (minimal but real)

Offer list (stored in DB)

Incoming requests (tasks targeted to that business)

Accept/decline (real transitions)

4) Data model (real, minimal)
Capability

capability_id, name, inputs_schema, proof_policy, default_risk

Provider

provider_id, wallet_address, type (human/business)

capability_id

price, eta_minutes, rating (off-chain ok)

min_stake_base (policy hint; enforcement is on-chain eligibility)

Task

task_id

capability_id

inputs (validated JSON)

budget_amount (MON)

priority (normal/urgent)

minStake (computed deterministically)

status (state machine)

taskHash (hash of canonical JSON)

escrow_contract, escrow_tx, payout_tx, refund_tx

Proof

proof_id, task_id

artifacts[] (uri, sha256, metadata)

proofHash

verification (pass/fail + notes)

Receipt

receipt_id, task_id

summary + receiptHash

5) State machine (real enforcement)

Statuses:
DRAFT → POSTED → MATCHED → ESCROWED → ACCEPTED → IN_PROGRESS → PROOF_SUBMITTED → VERIFIED → PAID → CLOSED

Failures:

PROOF_REJECTED → back to IN_PROGRESS

TIMED_OUT → REFUNDED → CLOSED

Invariant:

You cannot enter ESCROWED without a confirmed on-chain escrow tx.

You cannot enter PAID without a confirmed payout tx.

You cannot enter ACCEPTED if StakeRegistry.isEligible(provider, minStake) is false.

6) Token utility (non-negotiable, real)
AIH staking gate (minimum viable token purpose)

Providers must stake AIH into StakeRegistry.

Task priority determines minStake:

Normal: e.g. 100 AIH

Urgent: e.g. 500 AIH

Eligibility check is performed at match time and at accept time:

The UI should show why a provider is excluded: “Stake too low”.

Optional (only if time):

stake locking per task until completion for stronger guarantees.

7) Agent integration: skill.md must be actionable
Deliver https://<domain>/skill.md (real)

skill.md must contain:

How to obtain an agent token (claim flow)

Required env vars

The set of actions (minimal):

capabilities.list

providers.search

tasks.create

tasks.match_and_escrow

tasks.status

tasks.verify_and_settle (or tasks.approve if verification is server-side)

Example payloads + expected responses

Webhook events (optional but helpful):

task.matched, task.accepted, task.proof_submitted, task.settled

Claim flow (real)

Agent hits /agent/register → receives claim link

Human opens claim link, connects wallet, approves

Server issues API key bound to that agent identity

This creates a real “Moltbook-like” onboarding.

8) Proof: minimal real verification

For restaurant booking, require:

structured fields: restaurant, datetime, party size, confirmation reference / contact

at least one artifact:

screenshot (call log / message confirmation) OR

audio snippet/transcript (if you integrate live calling later)

Verification rules (MVP):

server validates required fields present and consistent with task request

server computes proofHash and stores it

server marks VERIFIED then triggers payout transaction

9) Build order (the shortest path to real end-to-end)
Phase 1 — Chain + token foundations (do first)

Launch AIH on nad.fun; record token address.

Deploy StakeRegistry to Monad mainnet; verify stake → isEligible works.

Deploy TaskEscrow to Monad mainnet; verify escrow → release → refund flows.

Phase 2 — Backend (real API, DB)

Implement DB schema + migrations.

Implement provider registry (seed 3 providers, with real wallet addresses).

Implement capability registry (seed 2 capabilities).

Implement tasks:

create task (hash canonical JSON → taskHash)

provider search (return 3 providers + attributes)

match: enforce eligibility via StakeRegistry.isEligible

escrow: create escrow tx, wait for confirmation, persist tx hash

Implement provider accept endpoint + UI-driven accept:

re-check eligibility at accept time

Implement proof upload:

upload artifact + compute sha256

compute proofHash

Implement verify + settle:

mark verified + payout via escrow contract, persist payout tx

Phase 3 — Frontend (real UI wired to API + chain)

Landing with 3-mode toggle (Agent/Human/Business).

Agent mode:

install panel with curl …/skill.md

claim flow UI

status panel (agent token, last task)

Human mode:

inbox (real tasks)

accept + proof submit (real)

Business mode:

minimal offers + incoming requests (real transitions)

Task detail views show:

status

provider selection rationale (from backend/agent decision record)

stake requirement + eligibility results

escrow tx + payout tx links

Phase 4 — Agent runner (real autonomy)

Build a small agent runner compatible with your target agent framework:

reads skill.md

obtains token

executes: create → search → score → match+escrow → monitor → verify/settle

Ensure scoring is deterministic and logged (rationale stored in task record).

10) Demo checklist (real, reproducible)

Before recording:

AIH token live (nad.fun link + address in repo).

Three providers have staked:

Provider A below urgent threshold

Provider C above urgent threshold

TaskEscrow and StakeRegistry addresses in repo.

A real provider account can accept tasks and upload proof.

During demo:

Show Agent mode install command + skill.md.

Run normal task from agent runner (not from UI text box).

Show decision panel with provider ranking + rationale.

Show escrow tx hash.

Show human proof submission.

Show verification and payout tx hash.

Run urgent task; show provider filtered by stake.

11) Repo docs requirements (what must exist)

README.md:

what it does

how it’s autonomous (decision points)

token purpose (stake gating)

addresses (AIH, StakeRegistry, TaskEscrow)

how to run agent + provider UI

contracts/ADDRESSES.md

public/skill.md (or route serving it)

docs/architecture.md (short)

OSI LICENSE

12) Non-goals (explicit)

No “simulator” UI paths with fake tx hashes.

No broad marketplace onboarding.

No slashing automation unless time remains after end-to-end works.

No reliance on LLM verification for correctness (optional enhancement only).