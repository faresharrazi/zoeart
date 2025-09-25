// Simple Node.js test file
// If this runs, you have Node.js support

const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Node.js is working!",
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
    })
  );
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Node.js test server running on port ${port}`);
});

// Export for module systems
module.exports = server;
