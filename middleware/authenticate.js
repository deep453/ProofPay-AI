const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      error: "Authentication is not configured"
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    if (
      typeof payload.sub !== "string" ||
      !["client", "developer"].includes(payload.role)
    ) {
      return res.status(401).json({
        error: "Invalid authentication token"
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authentication token"
    });
  }
}

module.exports = authenticate;