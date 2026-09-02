const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ROLE_HIERARCHY,
  getRoleLevel,
  roleSatisfies,
  resolveInheritedRoles,
} = require("./config/roleHierarchy");

test("ROLE_HIERARCHY has exactly 4 roles in seniority order", () => {
  assert.deepEqual(ROLE_HIERARCHY, ["Admin", "Instructor", "TA", "Learner"]);
});

test("getRoleLevel: Admin is most senior (level 0)", () => {
  assert.equal(getRoleLevel("Admin"), 0);
});

test("getRoleLevel: unknown role returns Infinity", () => {
  assert.equal(getRoleLevel("Nonexistent"), Infinity);
});

test("roleSatisfies: Admin satisfies a Learner-only check (inheritance)", () => {
  assert.equal(roleSatisfies("Admin", ["Learner"]), true);
});

test("roleSatisfies: Learner does NOT satisfy an Admin-only check", () => {
  assert.equal(roleSatisfies("Learner", ["Admin"]), false);
});

test("roleSatisfies: TA satisfies a TA-only check (self)", () => {
  assert.equal(roleSatisfies("TA", ["TA"]), true);
});

test("resolveInheritedRoles: Instructor-allowed route includes Admin and Instructor only", () => {
  const resolved = resolveInheritedRoles(["Instructor"]);
  assert.deepEqual(resolved.sort(), ["Admin", "Instructor"].sort());
});