# transcribenow-backend

Production-ready Node.js + Express backend for TranscribeNow. Handles audio uploads, integrates with OpenAI (Whisper + GPT placeholder), and exposes simple health and API routes.

## Features

- Express server with CORS and JSON parsing
- Multer file uploads to `./uploads`
- OpenAI client initialized (placeholder for future transcription/summary)
- Environment variables via `dotenv`
- Health-check route: `GET /health`
- Demo transcription route: `POST /api/transcribe` (returns demo response)

## Requirements

- Node.js 18+ recommended
- An OpenAI API key

## Setup

1. Clone this repository (or copy the files into your project directory).
2. Install dependencies:

```bash
npm install
```

3. Create your environment file:
   - Copy `.env.example` to `.env`
   - Set `OPENAI_API_KEY` and optionally `PORT`

Example `.env`:
```bash
OPENAI_API_KEY=sk-...
PORT=3001
```

## Run (development)

Uses nodemon for hot reload.

```bash
npm run dev
```

Server will listen on `http://localhost:3001` (or `PORT` from `.env`).

## Run (production)

```bash
npm start
```

## Routes

- `GET /`  
  Returns a simple text message: "TranscribeNow Backend is running"

- `GET /health`  
  Returns `{ status: "ok", uptime: <number>, timestamp: <ISO> }`

- `POST /api/transcribe`  
  - Accepts a single file with field name `file`
  - Returns a demo JSON response with file info, transcript, and summary placeholders

Example cURL:
```bash
curl -X POST http://localhost:3001/api/transcribe \
  -F "file=@/path/to/audio-file.mp3"
```

## File uploads

- Files are stored in `./uploads`. The folder is auto-created at runtime.
- In containerized or ephemeral environments, ensure persistent storage if you need to keep uploaded files.

## Deployment: Render

1. Push this project to a Git repository (e.g., GitHub).
2. In Render:
   - Create a new Web Service
   - Connect your repository
   - Environment: Node
   - Build command: `npm install`
   - Start command: `node index.js`
3. Set Environment Variables:
   - `OPENAI_API_KEY` = your key
   - `PORT` = 3001 (or omit; Render will provide `PORT` which the app respects)
4. Deploy. The service will start and listen on the provided port.

### Notes for Render

- The `uploads` directory is created at runtime. For persistent storage, configure a Render Disk and point `uploads` to that mount path.
- Ensure inbound requests are allowed to `POST /api/transcribe` with form-data.

## Tech stack

- Node.js, Express
- Multer (file uploads)
- CORS
- dotenv
- openai (API client)
- nodemon (dev)




