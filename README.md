# EventHorizon AI

EventHorizon AI is a hyper-personalized, agentic web application that acts as an intelligent event researcher for its users. It leverages the advanced reasoning and real-time search capabilities of the Gemini API to move beyond simple, hardcoded category filters and provide truly personalized event recommendations.

## Features

### Backend
- **Agentic Core:** At its heart, the application uses the Gemini 1.5 Pro model to research and find events based on a user's unique profile.
- **Structured JSON Output:** All communication with the Gemini API is strictly typed using Pydantic, ensuring data integrity.
- **User Preference Learning:** The application learns from user interactions. Disliking an event adds its category to a user's `negative_preferences`, refining future recommendations.
- **RESTful API:** A complete backend API built with FastAPI provides endpoints for user management, profile updates, event recommendations, and interactions.
- **Database:** Uses SQLAlchemy to manage a SQLite database for all application data.

### Frontend
- **Modern UI:** A clean and responsive user interface built with React and styled with Tailwind CSS.
- **Component-Based:** The UI is broken down into logical components for maintainability.
- **User Authentication:** A full login flow and protected routes to ensure users can securely access their profile and recommendations.
- **Dynamic Dashboard:** A main dashboard to display event recommendations, including specially marked "wildcard" events to encourage discovery.
- **Interactive Cards:** Users can save or dismiss events, which feeds back into the learning mechanism.
- **Profile Management:** A dedicated page for users to view and update their location and preferences.

## Technology Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Frontend:** React, Vite, Tailwind CSS
- **AI/LLM:** Google Gemini 1.5 Pro API
- **Database:** SQLite

## Project Structure

```
.
├── backend/         # Contains the Python FastAPI application
│   ├── app/         # Core application logic, models, schemas, etc.
│   └── ...
└── frontend/        # Contains the React application
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── services/
    └── ...
```

## Setup and Installation

### Prerequisites
- Python 3.10+
- Node.js and npm
- A Google Gemini API Key

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create a `.env` file:**
    Copy the `backend/.env.example` to `backend/.env` (if example exists) or create a new one with the following content:
    ```
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
    SECRET_KEY="a_super_secret_key_for_jwt_that_is_long_and_secure"
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    ```
    Replace `"YOUR_GOOGLE_API_KEY"` with your actual Gemini API key.

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

## Running the Application

1.  **Run the Backend Server:**
    From the root directory, run:
    ```bash
    uvicorn backend.app.main:app --reload
    ```
    The backend will be available at `http://localhost:8000`.

2.  **Run the Frontend Development Server:**
    In a separate terminal, from the `frontend` directory, run:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or another port if 5173 is busy).
