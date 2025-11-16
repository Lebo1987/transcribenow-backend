'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const util = require('util');

const PORT = process.env.PORT || 3001;

// store uploaded file temporarily on disk
const upload = multer({ dest: "uploads/" });

const app = express();
app.use(cors());
app.use(express.json());

app.post(
    "/api/transcribe",
    // Pre-multer debug logging (does not change logic)
    (req, res, next) => {
        console.log("=== PRE-MULTER DEBUG ===");
        console.log("METHOD/URL:", req.method, req.originalUrl);
        console.log("HEADERS:", req.headers);
        try {
            console.log("REQ (inspect):", util.inspect(req, { depth: 2 }));
        } catch (e) {
            console.log("REQ inspect failed:", e?.message);
        }
        next();
    },
    upload.single("file"),
    async (req, res) => {
    try {
        console.log("====== DEBUG START ======");
        console.log("REQ.FILE INFO:", {
            exists: !!req.file,
            fieldname: req.file?.fieldname,
            originalname: req.file?.originalname,
            mimetype: req.file?.mimetype,
            size: req.file?.size,
        });
        console.log("REQ.BODY:", req.body);
        try {
            console.log("POST-MULTER REQ (inspect):", util.inspect(req, { depth: 2 }));
        } catch (e) {
            console.log("POST-MULTER inspect failed:", e?.message);
        }

        if (!req.file) {
            console.log("req.file is undefined — FULL HEADERS:", req.headers);
            return res.status(400).json({ error: "No file uploaded" });
        }

        // full path to temp file
        const filePath = path.resolve(req.file.path);

        console.log("====== SENDING TO OPENAI (Whisper via axios) ======");
        const formData = new FormData();
        formData.append("file", fs.createReadStream(filePath));
        formData.append("model", "whisper-1");

        const response = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        console.log("Transcription done (axios).");

        // cleanup temp file
        fs.unlink(filePath, () => {});

        return res.json({ text: response.data.text });

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
