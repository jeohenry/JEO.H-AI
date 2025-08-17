import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const BACKEND_URL = process.env.BACKEND_URL;

// Catch-all proxy
app.use("/api", async (req, res) => {
  try {
    const url = `${BACKEND_URL}${req.originalUrl.replace(/^\/api/, "")}`; 
    const response = await axios({
      method: req.method,
      url,
      headers: { ...req.headers, host: undefined }, // avoid conflicts
      data: req.body,
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));