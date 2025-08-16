# PulseDiscover

PulseDiscover is an intelligent, agentic AI-powered web application that empowers users to effortlessly discover and track high-quality, hyper-personalized events in any specified city.

## High-Level Architecture

The application follows a standard monolithic repository pattern with a clear separation of concerns between the frontend and backend.

- **Backend:** A Python-based backend built with the FastAPI framework. It handles business logic, API endpoints, and communication with the database and the Gemini Pro 1.5 API.
- **Frontend:** A modern JavaScript single-page application (SPA) built with React (Next.js) and styled with Tailwind CSS.
- **Database:** A PostgreSQL database for storing user data, events, and user interactions. SQLAlchemy is used as the ORM.
- **Asynchronous Tasks:** Celery with Redis as a message broker is used for background tasks like fetching event data from the Gemini API.

## Setup Instructions

### Prerequisites

- Python 3.10+
- pipenv
- PostgreSQL

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd pulse_discover
    ```

2.  **Install backend dependencies:**
    ```bash
    pipenv install
    ```
    Alternatively, you can use the `requirements.txt` file:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the `pulse_discover` directory and add the following variables:
    ```
    GEMINI_API_KEY=<your-gemini-api-key>
    DATABASE_URL=postgresql://user:password@localhost/pulsediscover
    SECRET_KEY=<your-secret-key>
    ```

### Running the Application

1.  **Start the backend development server:**
    ```bash
    pipenv run uvicorn pulse_discover.backend.main:app --reload

    pipenv run uvicorn backend.main:app --reload
    
    ```
    The application will be available at `http://localhost:8000`.

## API Endpoints

### Users

- **POST `/users/register`**: Register a new user.
  - **Request Body**: `{"username": "string", "email": "user@example.com", "password": "password"}`
- **POST `/users/token`**: Get a JWT token for a registered user.
  - **Request Body**: `application/x-www-form-urlencoded` with `username` and `password`.
- **GET `/users/me/interests`**: Get the interests of the current user (requires authentication).
- **POST `/users/me/interests`**: Add a new interest for the current user (requires authentication).
  - **Request Body**: `{"category": "string", "value": "string"}`
- **DELETE `/users/me/interests/{interest_id}`**: Delete an interest for the current user (requires authentication).

### Events

- **GET `/events`**: Get all events.
- **GET `/events/recommendations`**: Get personalized event recommendations for the current user (requires authentication).
- **GET `/events/wildcard`**: Get a random selection of events for the discovery feature.
- **GET `/events/search`**: Search for events with query parameters.
  - **Query Parameters**: `keyword`, `start_date`, `end_date`, `location`, `event_type`.
- **POST `/events/ingest`**: Trigger the ingestion of events from the LLM.
  - **Request Body**: `{"city": "string", "user_preferences": ["string"], "max_events": int}`

### Interactions

- **POST `/interactions`**: Create a new user-event interaction (requires authentication).
  - **Request Body**: `{"event_id": "uuid", "interaction_type": "saved" | "dismissed" | "attended"}`
