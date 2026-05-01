const express = require("express");
const path = require("path");

const { fetchForUI } = require("../src/core/httpClient");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/fetch", async (req, res) => {
  try {
    let url = req.body.url;

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    const result = await fetchForUI(url);

    res.json(result);

  } catch (err) {
    console.log("Server Error:", err.message);

    res.json({
      html: "Error loading page",
      status: 500,
    });
  }
});

app.listen(5000, () => {
  console.log("UI running on http://localhost:5000");
});