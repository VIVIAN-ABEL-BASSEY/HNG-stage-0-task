const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// IMPORTANT: CORS
app.use(cors({
  origin: "*"
}));

const PORT = process.env.PORT || 3000;

app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    // 1. Validate input
    if (!name || name.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Name query parameter is required"
    });
  }

    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    // 2. Call Genderize API
    const response = await axios.get(`https://api.genderize.io`, {
      params: { name }
    });

    const { gender, probability, count } = response.data;

    // 3. Handle edge case
    if (!gender || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    // 4. Compute confidence
    const is_confident =
      probability >= 0.7 && count >= 100;

    // 5. Build response
    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size: count,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from external API"
    });
  }
});

module.exports = app