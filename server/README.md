# AI Interview Server API

Backend service for the AI Interview platform, built with Node.js, Express, and MongoDB. This API powers authentication, resume analysis, AI-driven interview generation, scoring, reporting, and credit payments.

## 🚀 Project Overview

The server provides a production-style REST API for a mock interview system:

- Handles Google profile-based sign-in and cookie authentication
- Parses resume PDFs and extracts structured data using AI
- Generates role-based interview questions and evaluates answers
- Computes scorecards and returns detailed interview reports
- Supports credit purchase and verification through Razorpay

## ✨ Features

- Google profile auth flow with JWT cookie sessions
- Protected routes via centralized auth middleware
- Resume upload + PDF text extraction
- OpenRouter integration for question generation and answer review
- Per-question scoring: confidence, communication, correctness
- Interview history and detailed report endpoints
- Razorpay order creation and signature verification

## 🧰 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?logo=razorpay&logoColor=white)

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB instance
- OpenRouter API key
- Razorpay account credentials

## ⚙️ Installation & Setup

```bash
cd server
npm install
```

Create a `.env` file in `server`:

```env
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>/<db-name>?retryWrites=true&w=majority
MONGODB_DB_NAME=Agent
JWT_SECRET=replace_with_strong_random_secret
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

Run the server:

```bash
npm run dev
```

Server base URL:

- `http://localhost:8000`

## 🔐 Environment Variables

- `PORT`: server port
- `MONGODB_URL`: MongoDB connection URI
- `MONGODB_DB_NAME`: database name override (optional, defaults to `Agent`)
- `JWT_SECRET`: token signing secret
- `OPENROUTER_API_KEY`: OpenRouter API credential
- `RAZORPAY_KEY_ID`: Razorpay public key id
- `RAZORPAY_KEY_SECRET`: Razorpay secret for verification
- `CLIENT_URLS`: optional comma-separated allowed origins for CORS

## ▶️ Usage

1. Start the backend service.
2. Start the frontend client from the `client` folder.
3. Sign in from the UI.
4. Use interview and payment flows through frontend or directly via API.

## 🌐 API Endpoints

Base path: `/api`

### Auth

- `POST /api/auth/google`
  - Login/register user
  - Body:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
    ```

- `GET /api/auth/logout`
  - Clears auth cookie

### User

- `GET /api/user/current-user` (protected)
  - Returns current authenticated user data and credits

### Interview

- `POST /api/interview/resume` (protected, multipart)
  - Form field: `resume` (PDF, up to 5MB)
  - Returns extracted role/experience/projects/skills/resumeText

- `POST /api/interview/generate-questions` (protected)
  - Minimum required credits: controlled by `CREDITS_PER_INTERVIEW` env variable
  - Generates 5 interview questions with difficulty and time limits

- `POST /api/interview/submit-answer` (protected)
  - Evaluates answer for a question and stores feedback

- `POST /api/interview/finish` (protected)
  - Finalizes interview and computes aggregate score report

- `GET /api/interview/get-interview` (protected)
  - Returns current user interview history

- `GET /api/interview/report/:id` (protected)
  - Returns detailed report for selected interview

### Payment

- `POST /api/payment/order` (protected)
  - Creates Razorpay order and payment record

- `POST /api/payment/verify` (protected)
  - Verifies Razorpay signature and credits user account

## 🗂️ Project Structure

```text
server/
├─ config/
│  ├─ connectDb.js
│  └─ token.js
├─ controllers/
│  ├─ auth.controller.js
│  ├─ interview.controller.js
│  ├─ payment.controller.js
│  └─ user.controller.js
├─ middlewares/
│  ├─ isAuth.js
│  └─ multer.js
├─ models/
│  ├─ interview.model.js
│  ├─ payment.model.js
│  └─ user.model.js
├─ routes/
│  ├─ auth.route.js
│  ├─ interview.route.js
│  ├─ payment.route.js
│  └─ user.route.js
├─ services/
│  ├─ openRouter.service.js
│  └─ razorpay.service.js
├─ public/
├─ index.js
└─ package.json
```

## 🖼️ Suggested Screenshots / GIFs

- API flow diagram (Auth -> Interview -> Report)
- Postman collection run screenshot
- Razorpay payment verification success response
- Sample report payload screenshot

## 🔭 Future Improvements

- Add request validation (zod/joi/express-validator)
- Add robust AI response parsing with retry/fallback
- Add health checks and readiness probes
- Add rate limiting and security headers
- Add unit/integration tests and CI pipeline
- Move CORS origin and client URL fully to env config

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Push your branch and open a pull request

Please ensure linting/tests pass before submitting PRs.

## 📄 License

ISC

## 👤 Author

- Name: Your Name
- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-profile
- Email: your-email@example.com
