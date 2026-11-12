# ReliaBench 90-Second Walkthrough Script

## Scene 1: The Illusion of Single-Run Success (0:00 - 0:20)
1. **Navigate**: Open `http://localhost:5173/app/benchmarks` (Benchmark Library).
2. **Select Task**: Click `flaky_test_triage` (Flaky Test Triage and Quarantine).
3. **Inspect**: Highlight the **Reference Plan & Precondition Chain** showing how Step 3 (`update_quarantine_config`) depends on Step 2.
4. **Speak**: "Most agent benchmarks test the happy path once and declare victory. In production, tools fail. Here's what happens when they do."

## Scene 2: Fragile Agent Under Fault Injection (0:20 - 0:40)
1. **Configure Run**:
   - Agent Profile: `fragile (0-retry, no fallback)`
   - Repetitions ($k$): `3`
   - Seed: `42`
   - Fault Kind: `TOOL_ERROR`
   - Fault at Step: `3`
   - Target Tool: `update_quarantine_config`
2. **Execute**: Click **Execute Challenge Run**.
3. **Observe Scorecard**:
   - Pass Rate drops to **0%** (Wilson CI: `[0.00 - 0.56]`).
   - Recovery Rate: **0%**.
   - Taxonomy Breakdown highlights **TOOL_CONTRACT** failure for all 3 trials.
4. **Speak**: "The unhardened agent crashes on the first error. Pass rate is zero, and our taxonomy immediately flags a Tool Contract violation."

## Scene 3: Resilient Agent with Seeded Determinism (0:40 - 0:60)
1. **Switch Profile**: Keep the exact same seed (`42`), pack (`flaky_test_triage`), and fault (`TOOL_ERROR` at step 3). Change Profile to:
   - Agent Profile: `resilient (3 retries, fallback)`
2. **Execute**: Click **Execute Challenge Run**.
3. **Observe Scorecard**:
   - Pass Rate rises to **100%**.
   - Pass@k / Pass^k: **1.00 / 1.00** ($Pass^k \le Pass@k$ invariant maintained).
   - Recovery Rate: **100%** (3/3 faults successfully recovered).
   - Gateway Cost Attribution: Accurately reflects extra tokens consumed during retries.
4. **Speak**: "Under identical seed and identical failure injection, the resilient agent self-heals, retries, and delivers a true 100% Pass^k."

## Scene 4: ATIF v1.8 Trace Scrubber & Regression Gate Replay (0:60 - 0:90)
1. **Navigate**: Click **Trace Explorer** (`/app/traces`).
2. **Scrub**: Scrub through the trajectory timeline to Step 3.
   - Show the exact injected error observation and the subsequent retry success step.
3. **Navigate**: Open **Regression Gates** (`/app/regressions`).
4. **Bulk Replay**: Click **Replay All Cases** with the `resilient` agent profile.
5. **Observe**: Status updates from `STILL_FAILING` to `FIXED`.
6. **Closing Line**: "One successful run is not reliability. ReliaBench gives engineering teams the harness to test, break, measure, and fix AI agents."
