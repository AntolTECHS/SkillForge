// server/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @desc    Protect routes (requires valid JWT)
 *          - Instructors on first login (isFirstLogin / forcePasswordChange) are blocked
 *            from normal protected routes but are allowed to access the change-password endpoint.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Determine whether the current request is the change-password endpoint.
      const isChangePasswordRoute =
        req.method === "PUT" &&
        (req.baseUrl?.endsWith("/auth") || req.originalUrl?.includes("/api/auth")) &&
        req.path?.toLowerCase()?.includes("change-password");

      // Instructors on first login / forced reset can only access change-password
      if (
        req.user.role === "instructor" &&
        (req.user.isFirstLogin || req.user.forcePasswordChange)
      ) {
        if (isChangePasswordRoute) {
          return next();
        } else {
          return res.status(403).json({
            message: "Password change required on first login",
            forcePasswordChange: true,
          });
        }
      }

      // Normal flow: user allowed
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * @desc    Allow access even if user is first-login instructor
 *          Useful for endpoints that should bypass first-login restrictions
 */
export const allowWeakAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Allow even if first login or forcePasswordChange
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * @desc    Restrict access to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
};
