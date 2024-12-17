const http = require("http");

const server = http.createServer((req, res) => {
  const { method, url } = req;

  console.log(`\n${method} ${url}`);
  console.log("Headers:", req.headers);

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    if (body) {
      try {
        const jsonBody = JSON.parse(body);
        console.log("Body:", JSON.stringify(jsonBody, null, 2));
      } catch (e) {
        console.log("Body:", body);
      }
    }

    // Always return 200 OK with empty lights array
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        numberOfLights: 1,
        lights: [
          {
            on: 1,
            brightness: 50,
            temperature: 7000,
          },
        ],
      })
    );
  });
});

const PORT = 9123; // Same port used by Elgato Key Light
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
