// server/middlewares/roleMiddleware.js

/**
 * @desc    Authorize specific roles for a route
 *          - Works only after `protect` middleware has set `req.user`
 *          - Will automatically block instructors who haven't changed temp password
 * @param   {...string} roles - list of allowed roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Safety: instructors on first login are blocked by `protect` already
    // So no need to handle `isFirstLogin` here

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied for role: ${req.user.role}` });
    }

    next();
  };
};
