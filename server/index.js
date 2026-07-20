const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
    const { complaint } = req.body;

    const prompt = `You are a support ticket classifier. Given this customer complaint, return ONLY valid JSON (no markdown, no extra text) with exactly these fields:
{
  "priority": "Low" | "Medium" | "High",
  "category": "Billing" | "Technical" | "General" | "Other",
  "suggested_reply": "a short 2-sentence reply"
}

Complaint: "${complaint}"`;

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'google/gemma-4-26b-a4b-it:free',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const raw = response.data.choices[0].message.content;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleaned);

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to analyze ticket' });
    }
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});