export function adminMiddleware(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== "govchain-admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
}
