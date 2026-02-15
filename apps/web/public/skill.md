# ai-deals skill

> Autonomous task delegation with on-chain escrow on Monad testnet.

## Overview

ai-deals lets an AI agent **find a service provider, create an escrowed task, wait for proof of completion, verify it, and settle payment** — all through a REST API backed by smart-contract escrow on Monad. The agent never holds funds; the contract enforces every guarantee.

## Environment variables

| Variable | Purpose |
|---|---|
| `AI_DEALS_API` | API base URL, e.g. `https://ai-deals-phi.vercel.app` |
| `PRIVATE_KEY` | Wallet private key (for on-chain signing, when contracts are deployed) |
| `RPC_URL` | Monad testnet RPC (`https://testnet-rpc.monad.xyz`) |

## Task lifecycle

```
POSTED → MATCHED → ESCROWED → ACCEPTED → IN_PROGRESS → PROOF_SUBMITTED → VERIFIED → PAID → CLOSED
                                                                        ↘ PROOF_REJECTED (retry or refund)
                                         (SLA expired) → TIMED_OUT → REFUNDED
```

## API reference

All endpoints are relative to `AI_DEALS_API`. All request/response bodies are JSON. Set `Content-Type: application/json` on every POST.

---

### GET /api/capabilities

List available task capabilities.

**Response** `200`
```json
[
  {
    "id": "uuid",
    "name": "restaurant_booking",
    "description": "Book a restaurant table",
    "inputs_schema": {},
    "proof_policy": "photo_confirmation",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### GET /api/providers?capability={id}&urgent={true|false}

List providers, optionally filtered by capability and urgency.

| Query param | Required | Description |
|---|---|---|
| `capability` | no | Filter by capability ID |
| `urgent` | no | `true` to prioritize faster providers |

**Response** `200`
```json
[
  {
    "id": "uuid",
    "name": "FastBooker",
    "wallet_address": "0x...",
    "type": "human",
    "capability_ids": ["uuid"],
    "price": 25,
    "eta_minutes": 30,
    "rating": 4.8,
    "success_rate": 0.95,
    "stake_amount": 100,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### POST /api/tasks

Create a new task.

**Request body**
```json
{
  "capability": "capability-uuid",
  "goal": "Book a table for 2 at Sushi Nakazawa, Friday 7pm",
  "budgetAmount": 25,
  "currency": "MON",
  "slaSeconds": 3600,
  "urgent": false,
  "requesterAddress": "0x..."
}
```

| Field | Required | Default | Description |
|---|---|---|---|
| `capability` | yes | — | Capability ID |
| `goal` | yes | — | Human-readable task description |
| `budgetAmount` | no | 0 | Payment amount |
| `currency` | no | `"MON"` | Payment currency |
| `slaSeconds` | no | 3600 | Deadline in seconds |
| `urgent` | no | false | Priority flag |
| `requesterAddress` | no | null | Wallet address of the requester |

**Response** `201`
```json
{
  "id": "uuid",
  "status": "POSTED",
  "capability_id": "uuid",
  "goal": "Book a table for 2 at Sushi Nakazawa, Friday 7pm",
  "budget_amount": 25,
  "currency": "MON",
  "sla_seconds": 3600,
  "urgent": false,
  "min_stake": 50,
  "task_hash": "0x...",
  "provider_id": null,
  "escrow_tx": null,
  "payout_tx": null,
  "refund_tx": null,
  "requester_address": "0x...",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

### GET /api/tasks?status={status}

List all tasks, optionally filtered by status.

**Response** `200` — same shape as POST /api/tasks response, as an array.

---

### GET /api/tasks/{id}

Get a single task with its event log and proof.

**Response** `200`
```json
{
  "id": "uuid",
  "status": "IN_PROGRESS",
  "...": "same fields as task above",
  "events": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "action": "MATCH",
      "from_status": "POSTED",
      "to_status": "MATCHED",
      "tx_hash": null,
      "metadata": {},
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "proof": null
}
```

---

### POST /api/tasks/{id}/match

Match a task with a provider. Transitions: POSTED → MATCHED → ESCROWED.

**Request body**
```json
{
  "providerId": "provider-uuid",
  "escrowTx": "0x..."
}
```

| Field | Required | Description |
|---|---|---|
| `providerId` | yes | Provider to assign |
| `escrowTx` | no | On-chain escrow transaction hash |

**Response** `200`
```json
{
  "id": "uuid",
  "status": "ESCROWED",
  "providerId": "uuid"
}
```

---

### POST /api/tasks/{id}/accept

Provider accepts the task. Transitions: ESCROWED → ACCEPTED → IN_PROGRESS.

**Request body** — empty object `{}`

**Response** `200`
```json
{
  "id": "uuid",
  "status": "IN_PROGRESS"
}
```

---

### POST /api/tasks/{id}/proof

Submit proof of completion. Transitions: IN_PROGRESS → PROOF_SUBMITTED.

**Request body**
```json
{
  "artifacts": [{"type": "url", "value": "https://..."}],
  "notes": "Booking confirmed, reference #12345"
}
```

At least one of `artifacts` or `notes` must be provided.

**Response** `200`
```json
{
  "id": "uuid",
  "status": "PROOF_SUBMITTED",
  "proofHash": "0x..."
}
```

---

### POST /api/tasks/{id}/verify

Verify (approve or reject) submitted proof. If approved: PROOF_SUBMITTED → VERIFIED → PAID → CLOSED. If rejected: PROOF_SUBMITTED → PROOF_REJECTED.

**Request body**
```json
{
  "approved": true,
  "notes": "Proof looks good",
  "payoutTx": "0x..."
}
```

| Field | Required | Default | Description |
|---|---|---|---|
| `approved` | no | true | Accept or reject the proof |
| `notes` | no | — | Verification notes |
| `payoutTx` | no | — | On-chain payout tx hash |

**Response** `200`
```json
{
  "id": "uuid",
  "status": "CLOSED"
}
```

---

### POST /api/tasks/{id}/refund

Refund escrowed funds after SLA expiry. Transitions: current → TIMED_OUT → REFUNDED. Fails if the SLA has not expired yet.

**Request body** — empty object `{}`

**Response** `200`
```json
{
  "id": "uuid",
  "status": "REFUNDED"
}
```

---

### POST /api/agent/register

Register a new agent and receive an API key.

**Request body**
```json
{
  "agentName": "my-booking-agent"
}
```

**Response** `201`
```json
{
  "id": "uuid",
  "apiKey": "aih_abc123...",
  "agentName": "my-booking-agent",
  "claimUrl": "https://ai-deals-phi.vercel.app/api/agent/claim?key=aih_abc123..."
}
```

---

### POST /api/agent/claim

Bind an API key to a wallet address.

**Request body**
```json
{
  "apiKey": "aih_abc123...",
  "walletAddress": "0x..."
}
```

**Response** `200`
```json
{
  "id": "uuid",
  "agentName": "my-booking-agent",
  "walletAddress": "0x...",
  "claimed": true
}
```

---

## Example: full lifecycle

```bash
API="https://ai-deals-phi.vercel.app"

# 1. List capabilities
curl "$API/api/capabilities"

# 2. Find providers for a capability
curl "$API/api/providers?capability=CAPABILITY_ID"

# 3. Create a task
curl -X POST "$API/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{"capability":"CAPABILITY_ID","goal":"Book a table for 2, Friday 7pm","budgetAmount":25,"slaSeconds":3600}'

# 4. Match with best provider
curl -X POST "$API/api/tasks/TASK_ID/match" \
  -H "Content-Type: application/json" \
  -d '{"providerId":"PROVIDER_ID"}'

# 5. Provider accepts
curl -X POST "$API/api/tasks/TASK_ID/accept" \
  -H "Content-Type: application/json" \
  -d '{}'

# 6. Provider submits proof
curl -X POST "$API/api/tasks/TASK_ID/proof" \
  -H "Content-Type: application/json" \
  -d '{"artifacts":[{"type":"url","value":"https://confirmation.link"}],"notes":"Booking ref #12345"}'

# 7. Verify and settle
curl -X POST "$API/api/tasks/TASK_ID/verify" \
  -H "Content-Type: application/json" \
  -d '{"approved":true,"notes":"Confirmed"}'

# If SLA expired instead, refund:
# curl -X POST "$API/api/tasks/TASK_ID/refund" -H "Content-Type: application/json" -d '{}'
```

## Error responses

All errors return a JSON object with an `error` field:

```json
{
  "error": "capability and goal are required"
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request (missing/invalid fields) |
| 404 | Task or resource not found |
| 409 | Conflict (invalid state transition, already claimed) |
| 500 | Server error |
