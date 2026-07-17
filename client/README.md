# AI Interview Client

Frontend application for the AI Interview platform, built with React and Vite. It provides a complete AI-assisted interview experience from sign-in and setup to analytics and downloadable reports.

## 🚀 Project Overview

This client delivers a modern interview practice interface with voice-driven interactions, score tracking, history management, and payment-enabled credits.

It integrates tightly with the backend API for authentication, question generation, answer evaluation, report retrieval, and payment verification.

## ✨ Features

- Google sign-in via Firebase Authentication
- Resume upload and AI-assisted profile extraction
- Voice-based interview flow with timed answers
- AI feedback and skill scoring dashboard
- Interview history and detailed report view
- PDF report export
- Razorpay checkout for credits purchase

## 🧰 Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-State%20Management-764ABC?logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- Running backend API
- Firebase project with Google Sign-In enabled
- Razorpay key for frontend checkout

## ⚙️ Installation & Setup

```bash
cd client
npm install
```

Create `.env` in `client`:

```env
VITE_FIREBASE_APIKEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key_id
VITE_SERVER_URL=https://aiinterview-api.onrender.com
```

Start development server:

```bash
npm run dev
```

App URL:

- `http://localhost:5173`

## 🔐 Environment Variables

## ▶️ Usage

1. Start the backend API.
The client uses API base URL config from `src/config/api.js`:
```js
export const ServerUrl = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:8000`;
```
3. Sign in using Google.
6. Download PDF report and review progress history.

## 🔗 Backend Integration

The client uses this API base URL constant in `src/config/api.js`:

```js
export const ServerUrl = import.meta.env.VITE_SERVER_URL || "https://aiinterview-api.onrender.com";
```

Ensure backend CORS allows:

- origin: `http://localhost:5173`
- credentials: `true`

Client requests rely on cookie auth and `withCredentials: true`.

## 🌐 API Endpoints Used

- `POST /api/auth/google`
- `GET /api/auth/logout`
- `GET /api/user/current-user`
- `POST /api/interview/resume`
- `POST /api/interview/generate-questions`
- `POST /api/interview/submit-answer`
- `POST /api/interview/finish`
- `GET /api/interview/get-interview`
- `GET /api/interview/report/:id`
- `POST /api/payment/order`
- `POST /api/payment/verify`

## 🗂️ Project Structure

```text
client/
├─ public/
├─ src/
│  ├─ assets/
│  │  ├─ videos/
│  ├─ components/
│  │  ├─ AuthModel.jsx
│  │  ├─ Footer.jsx
│  │  ├─ Navbar.jsx
│  │  ├─ Step1SetUp.jsx
│  │  ├─ Step2Interview.jsx
│  │  ├─ Step3Report.jsx
│  │  └─ Timer.jsx
│  ├─ pages/
│  │  ├─ Auth.jsx
│  │  ├─ Home.jsx
│  │  ├─ InterviewHistory.jsx
│  │  ├─ InterviewPage.jsx
│  │  ├─ InterviewReport.jsx
│  │  └─ Pricing.jsx
│  ├─ redux/
│  │  ├─ store.js
│  │  └─ userSlice.js
│  ├─ utils/
│  │  └─ firebase.js
│  ├─ App.jsx
│  └─ main.jsx
├─ index.html
└─ package.json
```

## 🖼️ Suggested Screenshots / GIFs

- Home screen hero + CTA
- Interview in-progress screen (voice/timer)
- Analytics dashboard and score cards
- Interview history page
- Razorpay checkout flow preview

## 🔭 Future Improvements

- Move API base URL to `VITE_API_BASE_URL`
- Add centralized Axios instance with interceptors
- Add route guards and session fallback handling
- Improve chunk splitting and lazy loading for faster first paint
- Add end-to-end tests for critical interview and payment paths

## 🤝 Contributing

1. Fork the repository
2. Create a branch for your feature/fix
3. Commit changes with clear, meaningful messages
4. Open a pull request with summary and testing notes

Please run `npm run lint` and `npm run build` before creating PRs.

## 📄 License

ISC

## 👤 Author

- Name: Your Name
- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-profile
- Email: your-email@example.com
