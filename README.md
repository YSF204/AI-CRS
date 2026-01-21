# AI-CRS - AI-Powered Recruitment Support System

AI-CRS is a web-based intelligent recruitment support system designed to automate, enhance, and optimize the resume screening and job-matching process for both job seekers and employers.

## Project Structure

### Frontend Structure

```
frontend/src/
├── Features/              # Feature-based modules
│   ├── Auth/             # Authentication & authorization
│   ├── CVManagement/     # CV upload, parsing, analysis, ATS scoring
│   ├── JobManagement/    # Job posting creation & management
│   └── JobMatching/      # Job matching & recommendations
│
├── Pages/                # Route-level page components
│   ├── Admin/           # Admin dashboard & management pages
│   ├── Employee/        # Job Seeker dashboard & views
│   ├── Employer/        # Employer dashboard & views
│   └── Public/          # Public pages (Landing, About, etc.)
│
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   └── UI/             # UI primitives (Buttons, Cards, Inputs, Modals)
│
├── services/           # API service calls
├── context/            # React Context providers (Auth, App state)
├── hooks/              # Custom React hooks
├── utils/              # Helper functions & utilities
├── constants/          # Constants, enums, and configurations
├── routes/             # Route configuration
└── assets/             # Static assets (images, icons, fonts)
```

### Backend Structure

```
backend/src/
├── config/              # Configuration files
│                       # - database.js, env.js, ai.config.js
│
├── models/              # MongoDB models (Mongoose schemas)
│                       # - User, CV, Job, Match, Application, Score
│
├── controllers/         # Request handlers (HTTP layer)
│                       # - authController, cvController, jobController
│                       # - matchingController, analyticsController
│
├── routes/              # API route definitions
│                       # - auth.routes, cv.routes, job.routes
│                       # - matching.routes, analytics.routes
│
├── services/            # Business logic layer
│   ├── auth/           # Authentication & authorization services
│   ├── cv/             # CV processing & ATS scoring
│   ├── job/            # Job management services
│   ├── matching/       # Matching algorithm & ranking
│   └── analytics/      # Analytics & reporting services
│
├── middleware/          # Express middleware
│                       # - auth.middleware (JWT verification)
│                       # - role.middleware (RBAC)
│                       # - upload.middleware (file handling)
│                       # - error.middleware (error handling)
│
├── integrations/        # External service integrations
│   └── ai/             # AI/NLP API integrations
│                       # - cvParser, skillExtractor
│                       # - atsScorer, matchingEngine
│
├── utils/               # Utility functions
│                       # - logger, helpers, constants
│
└── uploads/             # Temporary file storage
    └── cv/             # CV file uploads
```

## Tech Stack

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Routing:** React Router

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **File Upload:** Multer
- **AI Integration:** External LLM/NLP APIs

## Core Features

1. **Authentication & User Management**
   - Role-based access control (Job Seeker, Employer, Admin)
   - Secure JWT-based authentication

2. **CV Upload & Parsing**
   - Support for PDF and DOCX formats
   - AI-powered extraction of structured data
   - Automatic skill and experience detection

3. **Resume Analysis & ATS Scoring**
   - ATS compatibility scoring
   - Keyword relevance analysis
   - Detailed feedback and optimization suggestions

4. **Job Posting Management**
   - Structured job posting creation
   - Skill and experience requirements
   - Job description management

5. **AI-Based Job Matching**
   - Intelligent candidate-job matching
   - Skill similarity analysis
   - Match percentage calculation

6. **Automated Shortlisting**
   - Ranked applicant lists
   - ATS score-based filtering
   - Manual adjustment capabilities

7. **Dashboard & Analytics**
   - Role-specific dashboards
   - Performance metrics
   - Usage analytics

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AI-CRS
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Set up environment variables
```bash
# Create .env file in backend directory
cp backend/.env.example backend/.env
# Configure your MongoDB URI, JWT secret, and AI API keys
```

5. Start development servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## License

MIT License

## Contributors

[Add your team members here]
