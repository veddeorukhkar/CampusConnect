// This middleware runs AFTER authMiddleware.
// It makes sure only users with role "admin" can access certain routes.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // user is an admin, allow the request through
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

module.exports = adminOnly;
