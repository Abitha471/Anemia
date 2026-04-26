const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (assuming local default MongoDB instance)
mongoose.connect('mongodb://127.0.0.1:27017/anemiaDetectionDB')
.then(() => {
    console.log("Connected to MongoDB successfully!");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

// Define Mongoose Schema & Model
const ResultSchema = new mongoose.Schema({
    username: String,
    age: Number,
    gender: String,
    hemoglobin: Number,
    rbc: Number,
    hematocrit: Number,
    mcv: Number,
    mch: Number,
    mchc: Number,
    hasAnemia: Boolean,
    riskLevel: String,
    anemiaType: String,
    date: { type: Date, default: Date.now }
});

const Result = mongoose.model('Result', ResultSchema);

// API Endpoint to save results
app.post('/api/save-result', async (req, res) => {
    try {
        const newResult = new Result(req.body);
        await newResult.save();
        console.log("📥 Saved new result:", req.body);
        res.status(201).json({ message: "Result saved to MongoDB successfully!", data: newResult });
    } catch (error) {
        console.error("Error saving result:", error);
        res.status(500).json({ error: "Failed to save result" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
