'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const PORT = process.env.PORT || 3001;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// store uploaded file temporarily on disk
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/transcribe", upload.single("file"), async (req, res) => {
    try {
        console.log("====== DEBUG START ======");
        console.log("REQ.FILE INFO:", {
            exists: !!req.file,
            fieldname: req.file?.fieldname,
            originalname: req.file?.originalname,
            mimetype: req.file?.mimetype,
            size: req.file?.size,
        });

        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // full path to temp file
        const filePath = path.resolve(req.file.path);

        console.log("====== SENDING TO OPENAI (4o AUDIO) ======");

        // NEW 4O AUDIO MODEL — FIX
        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "gpt-4o-audio-preview",
        });

        console.log("Transcription done.");

        // cleanup temp file
        fs.unlink(filePath, () => {});

        // GPT summary
        const summary = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Summarize the transcription concisely." },
                { role: "user", content: transcription.text }
            ]
        });

        return res.json({
            text: transcription.text,
            summary: summary.choices[0].message.content
        });

    } catch (err) {
        console.log("====== OPENAI ERROR ======");
        console.log("ERROR RAW:", err);
        console.log("ERROR RESPONSE DATA:", err?.response?.data);
        console.log("ERROR STATUS:", err?.status || err?.response?.status);
        console.log("====== OPENAI ERROR END ======");

        return res.status(500).json({
            error: "Transcription failed",
            details: err.message
        });
    }
});

app.listen(PORT, () =>
    console.log(`Backend running on port ${PORT}`)
);
