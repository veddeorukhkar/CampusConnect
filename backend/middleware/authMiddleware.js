// This middleware checks that a request has a valid login token (JWT)
// before allowing it to reach a protected route.
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token was signed by our server and hasn't expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request so later routes can use it
    req.user = decoded; // { id, role }
    next(); // move on to the actual route
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

module.exports = protect;
