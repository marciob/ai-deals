# ai-deals skill

> Autonomous deal negotiation and settlement on-chain.

## What it does

ai-deals lets an AI agent **find a service provider, escrow payment, submit a task, verify proof of completion, and settle** — all through smart-contract escrow on Base. The agent never holds funds; the contract enforces every guarantee.

## Required environment variables

| Variable | Purpose |
|---|---|
| `PRIVATE_KEY` | Wallet private key used to sign transactions |
| `RPC_URL` | Base (or Base Sepolia) JSON-RPC endpoint |
| `AI_DEALS_API` | API base URL (default `https://ai-deals.xyz/api`) |

## Tools / actions exposed

| Action | Description |
|---|---|
| `search_providers` | Query available providers by capability, price, and SLA |
| `create_task` | Post a new task with goal, budget, and deadline |
| `escrow_funds` | Lock payment in the on-chain escrow contract |
| `submit_proof` | Upload proof artifact (URL, hash, or structured data) |
| `verify_proof` | Check proof against acceptance criteria |
| `settle` | Release escrowed funds to the provider |
| `refund` | Reclaim funds if SLA is breached or proof is rejected |

## Example run

### Normal — restaurant booking

```
Agent: search_providers capability="restaurant_booking" max_price=50
→ 3 providers found

Agent: create_task provider=0xABC goal="Book a table for 2 at Sushi Nakazawa, Friday 7pm" budget=25 deadline=2h
→ task_id: 0x123...

Agent: escrow_funds task_id=0x123 amount=25
→ tx: 0xdef...

Provider delivers confirmation screenshot + booking reference.

Agent: verify_proof task_id=0x123 artifact_url="https://..."
→ proof_status: accepted

Agent: settle task_id=0x123
→ tx: 0xabc... (25 USDC released to provider)
```

### Urgent — same-day booking with higher budget

```
Agent: search_providers capability="restaurant_booking" max_price=100 sla="30m"
→ 1 provider found (premium)

Agent: create_task provider=0xDEF goal="Book a table for 4 at Eleven Madison Park, tonight 8pm" budget=80 deadline=30m
→ task_id: 0x456...

Agent: escrow_funds task_id=0x456 amount=80
→ tx: 0x789...

Provider delivers confirmation within 20 minutes.

Agent: verify_proof task_id=0x456 artifact_url="https://..."
→ proof_status: accepted

Agent: settle task_id=0x456
→ tx: 0xfed... (80 USDC released to provider)
```

## Proof semantics

A proof artifact must satisfy the acceptance criteria defined in the task. The contract enforces:

1. **Timeliness** — proof must arrive before the deadline.
2. **Integrity** — artifact hash is stored on-chain at submission time.
3. **Verification** — the requesting agent (or a designated oracle) calls `verify_proof`. Only an `accepted` verdict unlocks settlement.
4. **Dispute window** — after verification, a short cooldown (default 10 min) allows either party to flag disputes before funds move.

If proof is rejected or the deadline passes without submission, the agent can call `refund` to reclaim escrowed funds.
