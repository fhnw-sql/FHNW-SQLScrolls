const express = require("express");
const path = require("path");
require("dotenv").config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Log the API_URL to verify it's loaded correctly
console.log(`API_URL: ${process.env.API_URL}`);

app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
});