# ForgeOS Query Timings

Timings were collected on 2026-11-11 against PostgreSQL 16 on the existing
ForgeOS database at port 55432. Read queries ran normally. Write queries ran
inside `BEGIN`/`ROLLBACK`, so the database was not changed. Values are the
PostgreSQL `Execution Time` reported by `EXPLAIN (ANALYZE, BUFFERS)`; planning
and execution details are preserved in the raw plan files.

| Query | Description | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) | Plans |
|---|---|---:|---:|---:|---:|---|
| Q01 | Authentication user lookup | 0.098 | 0.055 | 0.065 | 0.073 | [`Run 1`](plans/query_01_run1.txt), [`Run 2`](plans/query_01_run2.txt), [`Run 3`](plans/query_01_run3.txt) |
| Q02 | Successful login timestamp update | 0.473 | 0.412 | 0.363 | 0.416 | [`Run 1`](plans/query_02_run1.txt), [`Run 2`](plans/query_02_run2.txt), [`Run 3`](plans/query_02_run3.txt) |
| Q03 | Paginated user list | 0.103 | 0.077 | 0.081 | 0.087 | [`Run 1`](plans/query_03_run1.txt), [`Run 2`](plans/query_03_run2.txt), [`Run 3`](plans/query_03_run3.txt) |
| Q04 | PM-visible land list | 0.330 | 0.348 | 0.302 | 0.327 | [`Run 1`](plans/query_04_run1.txt), [`Run 2`](plans/query_04_run2.txt), [`Run 3`](plans/query_04_run3.txt) |
| Q05 | PM-scoped project list with joins | 0.204 | 0.244 | 0.205 | 0.218 | [`Run 1`](plans/query_05_run1.txt), [`Run 2`](plans/query_05_run2.txt), [`Run 3`](plans/query_05_run3.txt) |
| Q06 | Project creation | 2.874 | 2.341 | 1.737 | 2.317 | [`Run 1`](plans/query_06_run1.txt), [`Run 2`](plans/query_06_run2.txt), [`Run 3`](plans/query_06_run3.txt) |
| Q07 | Daily log list with labour/machinery totals | 0.276 | 0.238 | 0.205 | 0.240 | [`Run 1`](plans/query_07_run1.txt), [`Run 2`](plans/query_07_run2.txt), [`Run 3`](plans/query_07_run3.txt) |
| Q08 | Nested daily log creation | 4.738 | 2.149 | 2.041 | 2.976 | [`Run 1`](plans/query_08_run1.txt), [`Run 2`](plans/query_08_run2.txt), [`Run 3`](plans/query_08_run3.txt) |
| Q09 | Daily log detail with child joins | 0.107 | 0.095 | 0.115 | 0.106 | [`Run 1`](plans/query_09_run1.txt), [`Run 2`](plans/query_09_run2.txt), [`Run 3`](plans/query_09_run3.txt) |
| Q10 | Nested daily log replacement update | 0.224 | 0.182 | 0.241 | 0.216 | [`Run 1`](plans/query_10_run1.txt), [`Run 2`](plans/query_10_run2.txt), [`Run 3`](plans/query_10_run3.txt) |
| Q11 | ADMIN daily log deletion | 0.091 | 0.133 | 0.147 | 0.124 | [`Run 1`](plans/query_11_run1.txt), [`Run 2`](plans/query_11_run2.txt), [`Run 3`](plans/query_11_run3.txt) |
| Q12 | Project milestone creation with audit insert | 2.822 | 3.663 | 3.683 | 3.389 | [`Run 1`](plans/query_12_run1.txt), [`Run 2`](plans/query_12_run2.txt), [`Run 3`](plans/query_12_run3.txt) |
| Q13 | Project milestone list | 0.192 | 0.115 | 0.116 | 0.141 | [`Run 1`](plans/query_13_run1.txt), [`Run 2`](plans/query_13_run2.txt), [`Run 3`](plans/query_13_run3.txt) |
| Q18 | Project inventory balance aggregation | 0.206 | 0.358 | 0.190 | 0.251 | [`Run 1`](plans/query_18_run1.txt), [`Run 2`](plans/query_18_run2.txt), [`Run 3`](plans/query_18_run3.txt) |
| Q19 | Stock transaction with audit insert | 0.821 | 1.157 | 0.698 | 0.892 | [`Run 1`](plans/query_19_run1.txt), [`Run 2`](plans/query_19_run2.txt), [`Run 3`](plans/query_19_run3.txt) |
| Q20 | Project material wastage aggregation | 0.205 | 0.220 | 0.208 | 0.211 | [`Run 1`](plans/query_20_run1.txt), [`Run 2`](plans/query_20_run2.txt), [`Run 3`](plans/query_20_run3.txt) |
| Q21 | Project milestone update | 0.155 | 0.146 | 0.168 | 0.156 | [`Run 1`](plans/query_21_run1.txt), [`Run 2`](plans/query_21_run2.txt), [`Run 3`](plans/query_21_run3.txt) |
| Q22 | Project milestone deletion | 0.087 | 0.070 | 0.099 | 0.085 | [`Run 1`](plans/query_22_run1.txt), [`Run 2`](plans/query_22_run2.txt), [`Run 3`](plans/query_22_run3.txt) |
| Q23 | Actor-visible vendor list | 0.195 | 0.333 | 0.195 | 0.241 | [`Run 1`](plans/query_23_run1.txt), [`Run 2`](plans/query_23_run2.txt), [`Run 3`](plans/query_23_run3.txt) |
| Q24 | Bill creation with audit insert | 3.133 | 2.901 | 2.704 | 2.913 | [`Run 1`](plans/query_24_run1.txt), [`Run 2`](plans/query_24_run2.txt), [`Run 3`](plans/query_24_run3.txt) |
| Q25 | Bill paid and outstanding aggregation | 0.094 | 0.085 | 0.082 | 0.087 | [`Run 1`](plans/query_25_run1.txt), [`Run 2`](plans/query_25_run2.txt), [`Run 3`](plans/query_25_run3.txt) |
| Q26 | Payment insertion | 0.450 | 0.394 | 0.453 | 0.432 | [`Run 1`](plans/query_26_run1.txt), [`Run 2`](plans/query_26_run2.txt), [`Run 3`](plans/query_26_run3.txt) |
| Q27 | Payment history with date filters | 0.100 | 0.107 | 0.133 | 0.113 | [`Run 1`](plans/query_27_run1.txt), [`Run 2`](plans/query_27_run2.txt), [`Run 3`](plans/query_27_run3.txt) |

## Execution notes

- The seed database contains users, one land, and one project, but no daily-log, labour-entry, or machinery-entry rows at measurement time. Daily-log reads therefore measured indexed empty-result paths as well as joins over empty child tables.
- Q06 and Q08 use temporary values and roll back. Q10 and Q13 target the existing project/log identifier used for the safe plan run; because no daily log exists, their write effects are empty and are rolled back where applicable.
- The SQL in [`04_queries.sql`](04_queries.sql) uses placeholders to document application behavior. The timing runs substitute only non-secret test values.
- Plans are raw PostgreSQL text output and are named to match the query and run in this table.
- Q18-Q27 were measured on 2026-11-11 against PostgreSQL 16 at port 55432.
  Each query was executed exactly three times with `EXPLAIN (ANALYZE, BUFFERS)`.
  The inventory, milestone, and billing measurements used minimal temporary
  fixtures inside each transaction; every run ended with `ROLLBACK`.
- The live database had no representative material, milestone, or bill rows
  before measurement. Fixture rows were therefore created only inside the
  measurement transaction and were not persisted. Q23 used the existing
  vendor/project data. Q21, Q22, and Q26 measure the documented DML statement
  itself; the surrounding application audit/status transaction is not included
  in those standalone SQL statements.
- Q12 used a temporary milestone and audit row inside each transaction; Q13
  read the existing project milestone relation. Both measurements were rolled
  back or read-only and did not persist application data.
- Q14-Q17 are not present in `04_queries.sql`; no timings or plans were
  fabricated for undocumented query IDs.
