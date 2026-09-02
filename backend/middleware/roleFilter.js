const { roleSatisfies } = require("../config/roleHierarchy");
function roleFilter(allowedRoles) {
  return (req, res, next) => {
    // TEMP: allow role override via header for local demo testing until real auth lands
    const userRole = req.user?.role || req.headers['x-demo-role'];
    if (!userRole || !roleSatisfies(userRole,allowedRoles)) {
      return res.status(403).json({ error: 'Access denied for this role' });
    }
    next();
  };
}

module.exports = roleFilter;