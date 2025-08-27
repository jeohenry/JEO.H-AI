# JEO.H AI

![JEO.H AI Banner](./public/logo.png) <!-- Replace with actual logo/banner -->

<div align="center">

[![React](https://img.shields.io/badge/React-18.0.0-61DAFB?logo=react)](https://reactjs.org/)  
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite)](https://vitejs.dev/)  
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
[![i18n](https://img.shields.io/badge/Internationalization-50%2B%20languages-blue)](https://www.i18next.com/)  

</div>

---

## 📖 Overview
**JEO.H AI ** is a modular **React + Vite** powered user interface for the **JEO.H AI System**.  
It integrates multiple **AI-driven modules** — Chat, Voice Assistant, Music AI, Health AI, Matchmaking/Relationship AI, Content Creation, Image Classification, Face Detection, Translation, Predictive Analytics, and Advertising — all within a **single, scalable platform**.

This project connects seamlessly with the **FastAPI/Flask backend** and supports **both offline (LLaMA)** and **online (OpenRouter)** AI switching.

---

## ✨ Features
- 🔹 **Progressive Learning AI** – adapts over time  
- 🔹 **Voice Assistant** – speech recognition & mimicry  
- 🔹 **Music AI** – visualization, mixing, playlist generation  
- 🔹 **Health AI** – symptom analysis & prescription suggestions  
- 🔹 **Relationship/Matchmaking AI** – chat, feed, video, matchmaking  
- 🔹 **Content Creator** – AI-driven creative content generator  
- 🔹 **Face Detection & Image Classifier**  
- 🔹 **Live Translation** in 50+ languages  
- 🔹 **Advertising AI** – generate, analyze & export campaigns  
- 🔹 **Admin Dashboard** – analytics, reports, moderation  

---

## 🛠️ Technologies
- **Frontend:** React.js, Vite  
- **Styling:** Tailwind CSS  
- **State Management:** React Context API  
- **i18n:** i18next with 50+ languages (`/public/locales`)  
- **Audio/Video:** WebRTC, Web Audio API  
- **Custom Hooks:** Streaming AI, WebRTC Chat  
- **TypeScript & JavaScript** for reliability and modularity  

---

## 📂 Project Structure

├── public/                  # Static assets & i18n JSONs ├── src/ │   ├── components/          # Reusable UI (buttons, cards, inputs, etc.) │   ├── layouts/             # App layouts (Dashboard, Main, Relationship) │   ├── modules/             # AI modules (Chat, Music, Voice, Content, etc.) │   ├── pages/               # Page views (auth, dashboard, relationship, admin) │   ├── routes/              # Route definitions │   ├── services/            # Voice & AI streaming services │   ├── utils/               # Helpers (export, lang detection) │   ├── context/             # Theme & global states │   └── main.jsx             # App entry point ├── tailwind.config.js ├── vite.config.js ├── package.json └── README.md

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd JEO.H-AI_FRONTEND

2. Install dependencies

npm install


3. Start development server

npm run dev

Visit: http://localhost:5173


4. Build for production

npm run build


5. Preview production build

npm run preview




---

📜 Scripts

npm run dev → Start development server

npm run build → Build for production

npm run preview → Preview production build

npm run lint → Run linter (if configured)

npm run test → Run tests (if implemented)



---

🌍 Internationalization

JEO.H AI supports 50+ languages out of the box.
Translations are stored in /public/locales/<lang>.json.
Example: en.json, fr.json, yo.json, hi.json.


---

🤝 Contributing

Contributions are welcome!

1. Fork the repository


2. Create a feature branch → git checkout -b feature/your-feature


3. Commit changes → git commit -m "Add new feature"


4. Push branch → git push origin feature/your-feature


5. Open a Pull Request




---

📄 License

Distributed under the MIT License. See LICENSE for details.


---

<div align="center">🔹 JEO.H AI Frontend – A next-gen modular interface for intelligent AI systems.
Built with ❤️ using React, Vite, and TailwindCSS.

</div>
```
