// session auth

// const http = require("http");

// let sessions = {}; // session store (memory)

// function generateSessionId() {
//   return Math.random().toString(36).substring(2);
// }

// const server = http.createServer((req, res) => {
//   // ===== LOGIN ROUTE =====
//   if (req.url === "/login" && req.method === "GET") {
//     const sessionId = generateSessionId();

//     sessions[sessionId] = {
//       user: "aman",
//     };

//     res.writeHead(200, {
//       "Set-Cookie": `sessionId=${sessionId}; HttpOnly`,
//       "Content-Type": "application/json",
//     });

//     res.end(JSON.stringify({ message: "Logged in" }));
//   }

//   // ===== PROTECTED ROUTE =====
//   else if (req.url === "/profile" && req.method === "GET") {
//     const cookieHeader = req.headers.cookie;

//     if (!cookieHeader) {
//       res.writeHead(401);
//       return res.end("Not authenticated");
//     }

//     const cookies = Object.fromEntries(
//       cookieHeader.split("; ").map((c) => c.split("="))
//     );

//     const session = sessions[cookies.sessionId];

//     if (!session) {
//       res.writeHead(401);
//       return res.end("Invalid session");
//     }

//     res.writeHead(200, { "Content-Type": "application/json" });
//     res.end(JSON.stringify({ user: session.user }));
//   }

//   // ===== DEFAULT =====
//   else {
//     res.writeHead(404);
//     res.end("Not found");
//   }
// });

// server.listen(3000, () => {
//   console.log("Auth server running on http://localhost:3000");
// });

// modern auth - JWT

const http = require("http");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

const server = http.createServer((req, res) => {
  // ===== LOGIN =====
  if (req.url === "/login" && req.method === "GET") {
    const token = jwt.sign(
      { user: "aman" },   // payload
      SECRET,
      { expiresIn: "1h" }
    );

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify({ token }));
  }

  // ===== PROTECTED ROUTE =====
  else if (req.url === "/profile" && req.method === "GET") {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.writeHead(401);
      return res.end("No token provided");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, SECRET);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify({ user: decoded.user }));
    } catch (err) {
      res.writeHead(401);
      res.end("Invalid token");
    }
  }

  else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => {
  console.log("JWT Auth server running on http://localhost:3000");
});