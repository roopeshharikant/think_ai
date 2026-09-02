// Defines role seniority for permission inheritance.
// A senior role automatically satisfies any check written for a junior role
// (e.g. a route guarded for "Instructor" is also reachable by "Admin").
// Order matters: index 0 = highest authority, last = lowest.
const ROLE_HIERARCHY = ["Admin", "Instructor", "TA", "Learner"];

function getRoleLevel(role) {
  const level = ROLE_HIERARCHY.indexOf(role);
  return level === -1 ? Infinity : level; // unknown/unrecognized roles never pass
}

// True if userRole satisfies any of allowedRoles, accounting for inheritance.
function roleSatisfies(userRole, allowedRoles) {
  const userLevel = getRoleLevel(userRole);
  if (userLevel === Infinity) return false;
  return allowedRoles.some((allowedRole) => userLevel <= getRoleLevel(allowedRole));
}

// Given the roles a route was written for, returns every role that
// actually has access once inheritance is applied — for audit logging / debugging.
function resolveInheritedRoles(allowedRoles) {
  const minRequiredLevel = Math.min(...allowedRoles.map(getRoleLevel));
  return ROLE_HIERARCHY.filter((role) => getRoleLevel(role) <= minRequiredLevel);
}

module.exports = { ROLE_HIERARCHY, getRoleLevel, roleSatisfies, resolveInheritedRoles };