# Backend Architecture Audit & Optimization Plan

> **Date:** 2026-02-13 (Updated)  
> **Auditor:** Antigravity (Principal Backend Architect)  
> **System:** Exam Battle Backend

---

## 🏗️ Context of My Backend

- **Language:** TypeScript (Node.js)
- **Framework:** Express.js `v5.2.1`
- **Database:** MongoDB (via Mongoose `v9.1.5`)
- **Real-time Engine:** Socket.IO `v4.8.3`
- **Deployment:** Vercel (Serverless Environment)
- **Caching:** None (In-Memory Maps used)
- **Queue System:** None
- **Observability:** Basic `console.log` / Custom Logger
- **Validation:** Zod schemas (NEW)
- **Critical Endpoints:** Battle WebSocket (`connection`, `submit_answer`), Auth (`login`, `getMe`), War APIs (`/wars/*`)
- **Recent Additions:** Exam War feature with production-grade concurrency handling

---

## 1. 🚨 Architectural Weaknesses (Critical)

### 🔴 Statelessness Violation in WebSocket

- **Bottleneck Description:** The entire Battle state (`onlineUsers`, `roomReadyStatus`, `userStatusMap`) is stored in **local variable maps** inside `battle.websocket.ts`.
- **Why it Fails at Scale:** In a production environment (especially Vercel/Serverless or auto-scaling groups), multiple server instances are spawned. A user connected to **Instance A** cannot battle a user on **Instance B** because the memory is not shared.
- **Real-world Scenario:**
  1. User A logs in (Connects to Instance 1).
  2. User B logs in (Connects to Instance 2).
  3. User A invites User B.
  4. Instance 1 checks its local memory, sees User B is "offline", and fails the invite.
- **Optimization Strategy:** Migrate all transient state (online users, active battles, lobby status) to **Redis**. Use `@socket.io/redis-adapter` to sync events across instances.

### 🔴 Server-Side Trust Issues (Cheating Risk)

- **Bottleneck Description:** The `battle_concluded` event relies on the **client** sending the final score and accuracy.
- **Security Risk:** A malicious user can emit a custom socket event with `{ score: 10000, accuracy: 100 }` regardless of their actual answers.
- **Fix:** The server must calculate the score.
  - **Option A:** Server tracks `submit_answer` events and calculates final score in-memory (or Redis).
  - **Option B:** Client sends answers array at the end, server validates against DB answer keys.

---

## 2. 🗄️ Database Layer Deep Audit

### ⚠️ Heavy Read Logic (N+1 Consideration)

- **Problem:** `getAllQuestionPapers` calls `QuestionPaper.find().populate("questionIds")`.
- **Impact:**
  - This fetches **every** question paper AND **every** question inside it.
  - If you have 50 papers with 50 questions each, that's 2,500 question documents loaded into memory for a simple list view.
- **Optimization:**
  - **Pagination:** Implement `skip` and `limit`.
  - **Projection:** Do not populate `questionIds` for the list view. Only fetch full questions when a detailed "Start Exam" endpoint is hit.

### ⚠️ Redundant Queries in Auth

- **Problem:** `userLoginService` performs two queries:
  1. `findOne({ email }).select("+password")`
  2. `findById(user._id)` (to get user without password)
- **Impact:** Doubles the database load on the login endpoint unnecessarily.
- **Optimization:** Use `.select("-password")` on the user object or clone and delete the field in memory before returning.

### ✅ Good Practices Found

- **Indexing:** `Question` correctly indexes `questionPaperId`. `QuestionPaper` indexes `examName`. Use of Transactions in `createQuestionPaper` ensures data integrity between collections.

### ✅ **NEW: War Feature - Production-Grade Improvements**

The recently implemented War feature demonstrates **significant architectural improvements**:

#### **Atomic Operations for Race Condition Prevention**

- **Implementation:** `war.service.ts` uses `findOneAndUpdate` with compound conditions:
  ```javascript
  {
    warId,
    status: WAITING,
    "participants.userId": { $ne: userId },
    $expr: { $lt: [{ $size: "$participants" }, "$maxPlayers"] }
  }
  ```
- **Benefit:** Prevents 100 users from joining the last slot simultaneously. Only 1 succeeds atomically.
- **Impact:** **Eliminates race conditions** that plagued the Battle feature.

#### **Optimistic Locking**

- **Implementation:** Version field with conditional updates:
  ```javascript
  findOneAndUpdate(
    { warId, version: currentVersion },
    { $inc: { version: 1 } },
  );
  ```
- **Benefit:** Prevents concurrent admin operations (e.g., two admins starting the same war).
- **Impact:** **Solves the concurrent start problem** without distributed locks.

#### **Input Validation with Zod**

- **Implementation:** `war.validation.ts` + `validateRequest` middleware
- **Benefit:** Type-safe validation before business logic, catching errors early.
- **Impact:** **Reduces database load** from invalid requests.

#### **Proper Indexing Strategy**

- **Compound Indexes:** `{ status: 1, scheduledStartTime: 1 }` for active wars query
- **Array Indexes:** `{ "participants.userId": 1 }` for user's joined wars
- **Impact:** **O(log n) lookups** instead of full collection scans.

#### **State Machine Enforcement**

- **Database Level:** Enum validation in schema
- **Service Level:** Explicit state transition checks
- **Impact:** **Prevents invalid state transitions** (e.g., starting a finished war).

#### **Collision-Resistant ID Generation**

- **Implementation:** nanoid with custom alphabet (8 chars, 1.1 trillion combinations)
- **Benefit:** User-friendly IDs without collision risk
- **Impact:** **Better UX** than MongoDB ObjectIds while maintaining uniqueness.

**Recommendation:** Apply these patterns to the Battle feature to fix its concurrency issues.

---

## 3. 🔄 Concurrency & Race Conditions

### ⚠️ GET Request Side-Effects

- **Problem:** `getMeService` (a read operation) generates and saves a `uniqueNameCode` if missing (`await user.save()`).
- **Risk:** If a user's dashboard triggers `getMe` 5 times in parallel (common in frontend init), this could trigger 5 parallel write operations, potentially causing `VersionError` in Mongoose or unnecessary DB locking.
- **Fix:** Move this logic to the `signup` flow or a dedicated migration script.

### ⚠️ Data Integrity in Battles

- **Problem:** `roomReadyStatus` checks rely on checking `size >= 2`.
- **Race Condition:** If 3 requests come in simultaneously (unlikely in 1v1 but possible with network lag/retries), the set adds a 3rd user.
- **Fix:** Strict locking or atomic operations (e.g., Redis `SADD` and check `SCARD`).

---

## 4. ⚡ Caching Strategy (Missing)

- **Current State:** No caching. Every request properly hits the database.
- **Strategy Gaps:**
  - **Static Data:** `QuestionPaper` and `Question` data rarely changes. It should be cached in Redis with a long TTL (e.g., 24 hours) or CDN.
  - **User Profile:** `getMe` is called frequently. Cache the user profile for 5-10 minutes.
- **Redis Misuse Warning:** Do NOT use Vercel KV for high-throughput Socket.IO state unless you monitor costs closely. Use a dedicated Redis instance (Upstash/aws ElastiCache).

---

## 5. 🚀 Scalability Risks

### ⚠️ Vercel + Socket.IO compatibility

- **Issue:** Vercel functions have a timeout (usually 10s-60s). Standard Socket.IO requires a persistent connection.
- **Risk:** Vercel treats functions as stateless. You cannot easily host a long-running Websocket server on standard Vercel serverless functions without specific configuration or using a separate provider (like Heroku, DigitalOcean, or specialized WS providers like Pusher/Liveblocks).
- **Recommendation:** Separation of concerns.
  - **REST API:** Keep on Vercel.
  - **WebSocket Server:** Move to a stateful container (Docker/EC2/Railway/Render) where it can maintain persistent TCP connections.

---

## 6. 🛡️ Security Audit

### ⚠️ No Rate Limiting

- **Risk:** APIs are exposed to brute-force attacks (login) or DDoS.
- **Fix:** Add `express-rate-limit`.
  - `auth`: strict limit (e.g., 5 retry/min).
  - `battle`: loose limit (e.g., 100 req/min).

### ⚠️ CORS Configuration

- **Issue:** Hardcoded IP `http://192.168.31.67:3000` in `server.ts`.
- **Risk:** Internal IP exposed; won't work in production.
- **Fix:** Use strict environment variable arrays for allowed origins.

---

## 7. 📊 Observability

- **Gap:** Dependency on `console.log`.
- **Risk:** In production, logs are unstructured text. Hard to filter "Errors" vs "Info".
- **Fix:** Standardize on the `logger` utility you have. Ensure it outputs **JSON** format in production environments (e.g., `{"level": "info", "message": "...", "timestamp": "..."}`).

---

## 8. 📉 Cost Optimization

- **Leak:** `get_online_users` sends the entire user list to every client.
- **Bandwidth Waste:** If 1,000 users are online, that's a large JSON payload sent to every client frequently.
- **Fix:** Only send "friends' online status" or paginated lists.

---

## 9. Final Production Readiness Score

### **Score: 6/10** (↑ from 4/10)

**Justification:**
The **War feature implementation** demonstrates production-grade patterns that significantly improve the codebase:

- ✅ **Atomic operations** prevent race conditions
- ✅ **Optimistic locking** handles concurrent updates
- ✅ **Zod validation** catches errors early
- ✅ **Proper indexing** ensures scalability
- ✅ **State machine** prevents invalid transitions

**However, critical issues remain:**

- ❌ **Socket.IO in-memory state** still unfit for serverless/horizontal scaling
- ❌ **Client-trusted scores** in Battle feature (security flaw)
- ⚠️ **No rate limiting** on any endpoints
- ⚠️ **No caching layer** for frequently accessed data

**Score Breakdown:**

- **Architecture:** 7/10 (War feature shows best practices, Battle needs refactor)
- **Security:** 5/10 (Good auth, but client-side trust issues)
- **Performance:** 6/10 (Good indexes, but no caching)
- **Scalability:** 5/10 (REST APIs scale, WebSocket doesn't)
- **Reliability:** 6/10 (War feature handles concurrency, Battle doesn't)

**Next Priority:** Apply War feature patterns to Battle, then tackle WebSocket scaling.

---

## 🎯 90-Day Hardening Roadmap (Updated)

### ✅ **Completed (War Feature)**

- Atomic operations for race condition prevention
- Optimistic locking for concurrent updates
- Zod validation middleware
- Production-grade indexing strategy
- State machine enforcement

### **Remaining Priorities**

1.  **Week 1-2 (Critical):** Refactor Battle feature to use War patterns
    - Replace in-memory state with atomic DB operations
    - Add optimistic locking for concurrent battles
    - Server-side score calculation (eliminate client trust)

2.  **Week 3 (Infrastructure):** Implement Redis for WebSocket scaling
    - Redis Adapter for Socket.IO (`@socket.io/redis-adapter`)
    - Move `onlineUsers` state to Redis
    - Enable horizontal scaling

3.  **Week 4 (Performance):** Add caching layer
    - Redis cache for `QuestionPaper` (24h TTL)
    - User profile caching (5-10min TTL)
    - Implement cache invalidation on mutations

4.  **Week 5 (Security):** Rate limiting and hardening
    - `express-rate-limit` on all endpoints
    - `helmet` for security headers
    - CORS configuration cleanup

5.  **Week 6 (Optimization):** Query optimization
    - Pagination for `getAllQuestionPapers`
    - Projection optimization (list vs detail views)
    - N+1 query elimination

6.  **Week 7-8 (Infrastructure):** WebSocket separation
    - Move WebSocket server to stateful host (Railway/Render)
    - Keep REST API on Vercel
    - Implement health checks and monitoring
