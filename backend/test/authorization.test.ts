import test from "node:test";
import assert from "node:assert/strict";
import { authorize, type Principal, type ResourceScope } from "../dist/authorization.js";

const activeStudent: Principal = {
  accountId: "user-1",
  status: "active",
  roles: [],
  studentId: "student-1"
};
const ownRecord: ResourceScope = {
  kind: "student",
  studentId: "student-1",
  operation: "read"
};

test("fails closed for missing principal or resource", () => {
  assert.deepEqual(authorize(null, ownRecord), { allowed: false, reason: "invalid_context" });
  assert.deepEqual(authorize(activeStudent, null), { allowed: false, reason: "invalid_context" });
});

test("blocks disabled accounts even with a matching role and resource", () => {
  assert.deepEqual(
    authorize({ ...activeStudent, status: "disabled" }, ownRecord),
    { allowed: false, reason: "account_not_active" }
  );
});

test("student can read own record but not another student's record", () => {
  assert.equal(authorize(activeStudent, ownRecord).allowed, true);
  assert.deepEqual(
    authorize(activeStudent, { ...ownRecord, studentId: "student-2" }),
    { allowed: false, reason: "scope_mismatch" }
  );
});

test("tutor is restricted to assigned cycle", () => {
  const tutor: Principal = { accountId: "tutor-1", status: "active", roles: [{ role: "tutor", cycleId: "cycle-a" }] };
  assert.equal(authorize(tutor, { kind: "student", studentId: "student-1", cycleId: "cycle-a", operation: "update" }).allowed, true);
  assert.deepEqual(
    authorize(tutor, { kind: "student", studentId: "student-1", cycleId: "cycle-b", operation: "update" }),
    { allowed: false, reason: "scope_mismatch" }
  );
});

test("company user cannot cross company boundary", () => {
  const companyUser: Principal = { accountId: "company-user-1", status: "active", roles: [{ role: "company_user", companyId: "company-a" }] };
  assert.equal(authorize(companyUser, { kind: "company", companyId: "company-a", operation: "read" }).allowed, true);
  assert.deepEqual(
    authorize(companyUser, { kind: "company", companyId: "company-b", operation: "read" }),
    { allowed: false, reason: "scope_mismatch" }
  );
});

test("archived records require tutor scope and a reason; modifications are blocked", () => {
  const tutor: Principal = { accountId: "tutor-1", status: "active", roles: [{ role: "tutor", cycleId: "cycle-a" }] };
  const archived = { kind: "student", studentId: "student-1", cycleId: "cycle-a", archived: true, operation: "read" } as const;
  assert.deepEqual(authorize(tutor, archived), { allowed: false, reason: "justification_required" });
  assert.equal(authorize(tutor, { ...archived, justifiedReason: "Revisión académica" }).allowed, true);
  assert.deepEqual(authorize(tutor, { ...archived, operation: "update", justifiedReason: "Corrección" }), { allowed: false, reason: "archived_record_restricted" });
});

test("audit logs are read-only for admins and unimplemented resource kinds are denied by default", () => {
  const admin: Principal = { accountId: "admin-1", status: "active", roles: [{ role: "admin_fp" }] };
  assert.equal(authorize(admin, { kind: "audit", operation: "read" }).allowed, true);
  assert.deepEqual(authorize(admin, { kind: "audit", operation: "delete" }), { allowed: false, reason: "operation_restricted" });
  assert.deepEqual(authorize({ ...admin, roles: [{ role: "tutor", cycleId: "cycle-a" }] }, { kind: "audit", operation: "read" }), { allowed: false, reason: "operation_restricted" });
  assert.deepEqual(authorize(activeStudent, { kind: "document", operation: "export" }), { allowed: false, reason: "no_matching_role" });
  assert.deepEqual(authorize(admin, { kind: "student", studentId: "student-1", operation: "delete" }), { allowed: false, reason: "operation_restricted" });
});
