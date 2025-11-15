'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');

const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');

// Ensure uploads directory exists at runtime
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize OpenAI client (placeholder for future use)
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, UPLOADS_DIR);
	},
	filename: function (req, file, cb) {
		const timestamp = Date.now();
		const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		cb(null, `${timestamp}-${safeOriginalName}`);
	}
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
	res.status(200).send('TranscribeNow Backend is running');
});

app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		uptime: process.uptime(),
		timestamp: new Date().toISOString()
	});
});

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				ok: false,
				error: 'No file uploaded. Expect field "file".'
			});
		}

		const { originalname, mimetype, size } = req.file;

		// Placeholder: Whisper transcription and GPT summary logic will be added later
		return res.status(200).json({
			ok: true,
			message: 'Demo mode – file received',
			file: {
				name: originalname,
				type: mimetype,
				size
			},
			transcript: 'demo transcript',
			summary: 'demo summary'
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Error in /api/transcribe:', err);
		return res.status(500).json({ ok: false, error: 'Internal server error' });
	}
});

// Start server
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`TranscribeNow Backend listening on port ${PORT}`);
});




