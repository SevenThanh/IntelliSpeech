# 🎙️ IntelliSpeech
IntelliSpeech is a real‑time video calling app with AI speech‑to‑speech translation and natural voice synthesis. It lets participants speak in their own language while hearing each other in lifelike, translated voices—without leaving the browser.

## 🚀 Features

- 📹 Low‑latency video and audio via WebRTC
- 🌐 Real‑time multilingual conversations (STT → translate → TTS)
- 🗣️ High‑quality voice cloning/synthesis with ElevenLabs
- 🔐 Secure authentication and room access
- ⚡ Socket.IO signaling for fast call setup
- 📝 Live captions/subtitles 
- 💾 Scalable backend with Supabase (auth, data)

## 🛠️ Tech Stack

- Frontend: React, Tailwind CSS, Three.js (UI polish)
- Realtime Media: WebRTC (P2P), Socket.IO (signaling)
- Voice/AI: ElevenLabs APIs (TTS, conversational/voice cloning)
- Backend: TypeScript, Supabase (Auth + DB)
- Testing: Vitest 
- CI/CD: GitHub Actions 
- Version Control: Git + GitHub

## 📦 Getting Started

1. **Clone the repository**

```
git clone https://github.com/SevenThanh/IntelliSpeech.git

cd IntelliSpeech
```

2. **Install dependencies**

``` npm install```

3. **Environment variables**

Create a .env file with:

```
ELEVENLABS_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SIGNALING_URL=http://localhost:xxxx or your deployed Socket.IO server
````

4. **Run the development server**
```
npm run dev
```
5. Run tests 

```
npm run test
```


⚙️ Project Structure
``` 
IntelliSpeech/
├── public/
├── src/
│ ├── components/ UI, call controls, captions
│ ├── hooks/ WebRTC device/connection hooks
│ ├── pages/ routes (rooms, auth)
│ ├── lib/ ElevenLabs + signaling clients
│ └── utils/ helpers, types
├── server/ signaling bridge (Socket.IO) [if in repo]
├── .github/
│ └── workflows/ CI (tests/lint) [optional]
├── package.json
├── README.md
└── …
``` 

## 👥 Contributors

- Johan Nguyen (lead)
- Amin Mohamed
- Almansur Antor 
- William Jijon

## 🗺️ Roadmap

- SFU support for larger rooms and recording
- Always‑on subtitles with speaker diarization
- Mobile optimizations and PWA
- One‑click room links with role‑based permissions

## 📄 License
MIT
