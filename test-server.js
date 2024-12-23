const http = require("http");

// Initial state
let keylightState = {
  numberOfLights: 1,
  lights: [
    {
      on: 1,
      brightness: 50,
      temperature: 7000,
    },
  ],
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  console.log(`\n${method} ${url}`);
  console.log("Headers:", req.headers);

  // Handle GET request for current state
  if (method === "GET" && url === "/elgato/lights") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(keylightState));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    if (method === "PUT" && url === "/elgato/lights" && body) {
      try {
        const update = JSON.parse(body);
        // Update state based on the request
        if (update.lights) {
          const light = update.lights[0];
          if (light.on !== undefined) keylightState.lights[0].on = light.on;
          if (light.brightness !== undefined) keylightState.lights[0].brightness = light.brightness;
          if (light.temperature !== undefined)
            keylightState.lights[0].temperature = light.temperature;
        }
        console.log("Updated state:", JSON.stringify(keylightState, null, 2));
      } catch (e) {
        console.error("Failed to parse body:", body);
      }
    }

    // Return current state
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(keylightState));
  });
});

const PORT = 9123;
server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log("Initial state:", JSON.stringify(keylightState, null, 2));
});
