# Event Discovery Platform

An intelligent, agentic web application for discovering and tracking high-quality events in any city. This platform learns user preferences to deliver personalized, real-time event recommendations with verifiable sources.

## Core Features

*   **Personalized Event Discovery:** Learns user interests across genres, artists, venues, and more to provide a tailored event feed.
*   **Dynamic Curation:** Goes beyond hardcoded categories, using an LLM to discover and categorize a wide range of events and activities.
*   **Rich Event Details:** Displays comprehensive information for each event, including showtimes, ratings, venue details, ticket prices, and availability.
*   **Wildcard Suggestions:** Intelligently recommends novel event types based on user taste, complete with explanations.
*   **Data Quality:** Ensures a high-quality user experience with robust duplicate prevention and by providing sources for all event information.

## Technology Stack

*   **Backend:** Python, FastAPI, SQLAlchemy
*   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
*   **Database:** PostgreSQL
*   **LLM:** Gemini 2.5 with Google Search grounding
*   **Containerization:** Docker, Docker Compose

## Local Development

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   A Google Gemini API Key. You can get one from the [AI Studio](https://aistudio.google.com/app/apikey).

### Setup & Running the Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    ```

3.  **Launch the Application:**
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for the backend and frontend services and start the application.

### Accessing the Application

*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:8000](http://localhost:8000)
*   **API Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
.
├── backend/         # FastAPI backend application
├── docs/            # Project documentation
├── frontend/        # Next.js frontend application
└── infra/           # Infrastructure configuration (e.g., .env.example)
```

## Contributing

We welcome contributions! Please see our `CONTRIBUTING.md` file for more information on how to get started. (Note: `CONTRIBUTING.md` not yet created).
