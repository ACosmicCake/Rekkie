# City Event Finder

This is a full-stack web application that helps users find high-quality events in their city, tailored to their personal interests. It uses a sophisticated backend powered by Gemini 2.5 and a recommendation engine to provide a personalized experience.

## Core Features

- **Personalized Recommendations**: Events are ranked based on your unique interests, favorite artists, venues, and more.
- **AI-Powered Enrichment**: Raw event data is enriched using Gemini 2.5 with Search Grounding to provide clean, detailed, and verified listings with source citations.
- **Wildcard Suggestions**: Discover new and exciting events outside your usual tastes with our "Wildcard" feature.
- **Comprehensive Event Coverage**: Aggregates events from multiple sources, including movies, concerts, meetups, and local blogs.
- **User-Friendly Interface**: A modern, responsive UI built with Next.js 14 and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with pgvector (via Prisma)
- **Background Jobs**: BullMQ with Redis
- **LLM**: Gemini 2.5 with Search Grounding
- **Authentication**: NextAuth.js
- **Testing**: Vitest and Playwright

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm
- Docker and Docker Compose (for running PostgreSQL and Redis locally)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd city-event-finder
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up the environment:**
    Copy the `.env.example` file to a new file named `.env.local` and fill in the required environment variables.
    ```bash
    cp .env.example .env.local
    ```
    You will need to get API keys for Gemini, TMDb, and any other services you want to use.

4.  **Start the database and Redis:**
    A `docker-compose.yml` file is recommended for local development. Create one with services for PostgreSQL and Redis.
    ```yaml
    # docker-compose.yml
    version: '3.8'
    services:
      postgres:
        image: pgvector/pgvector:pg16
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: city_event_finder
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data
      redis:
        image: redis/redis-stack-server:latest
        ports:
          - "6379:6379"
    volumes:
      postgres_data:
    ```
    Then, run:
    ```bash
    docker-compose up -d
    ```

5.  **Run database migrations:**
    ```bash
    pnpm prisma migrate dev
    ```

### Running the Application

1.  **Start the web server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

2.  **Start the background worker:**
    In a separate terminal, run the BullMQ worker:
    ```bash
    pnpm exec ts-node --esm scripts/run-worker.ts
    ```

3.  **Schedule jobs (optional):**
    To manually trigger a data refresh for a city, run the scheduling script:
    ```bash
    pnpm exec ts-node scripts/schedule-refresh.ts "San Francisco"
    ```

### Running Tests

-   **Unit/Integration Tests:**
    ```bash
    pnpm test
    ```

-   **End-to-End Tests:**
    ```bash
    pnpm test:e2e
    ```

## Deployment

Deploying this application involves three main components: the Next.js web app, the database, and the background worker.

1.  **Next.js App (Vercel):**
    - Connect your Git repository to a new Vercel project.
    - Vercel will automatically detect that it's a Next.js project.
    - Add all the required environment variables from your `.env.local` file to the Vercel project settings.
    - The application will be deployed automatically on every push to the main branch.

2.  **Database (PostgreSQL with pgvector):**
    - We recommend using a managed database provider that supports pgvector, such as **Supabase** or **Neon**.
    - Create a new database instance and get the connection URL.
    - Update the `DATABASE_URL` environment variable in your Vercel project.
    - Run the migrations against the production database.

3.  **Background Worker (Google Cloud Run):**
    - The background worker needs to be run as a long-running process. A containerized service like Google Cloud Run is a good choice.
    - Use the provided `Dockerfile` (which I will create next) to build a container image for the worker.
    - Push the image to a container registry (e.g., Google Container Registry).
    - Create a new service on Google Cloud Run using the container image.
    - Make sure to set the environment variables for the worker in the Cloud Run service configuration.

4.  **Cron Job (Vercel Cron):**
    - To automate the data refresh, you can use a cron job service. Vercel Cron is a good option.
    - Create a `vercel.json` file in your project to define the cron job.
    - The cron job should be configured to send a `GET` request to the `/api/cron` endpoint of your deployed application.
    - Remember to include the `CRON_SECRET` in the request headers.
    ```json
    {
      "crons": [
        {
          "path": "/api/cron",
          "schedule": "0 */4 * * *"
        }
      ]
    }
    ```

This provides a high-level overview of the deployment process. Each step may require more detailed configuration depending on your specific needs.
