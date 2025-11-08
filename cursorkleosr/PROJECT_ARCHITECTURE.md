# CinemaRebel - Full Project Architecture

This document provides a comprehensive visual overview of the CinemaRebel project, including the application architecture and the development workflow.

## Mermaid Diagram

```mermaid
graph TD
    subgraph "Development Workflow"
        direction LR
        A[GitHub Repository]
        B[AGENT_ASSIGNMENTS.md]
        C[AI Developer Agent <br/> (e.g., Gemini)]
        D[Feature Branch]
        E[Pull Request]
        F[GitHub Actions CI <br/> (Lint, Build, Test)]

        C -- "1. Claims Task" --> B
        A -- "2. Creates Branch" --> D
        C -- "3. Develops on" --> D
        D -- "4. Pushes & Creates" --> E
        E -- "5. Triggers" --> F
        F -- "6. Validates" --> E
        E -- "7. Merges to main" --> A
    end

    subgraph "Application & Infrastructure"
        direction TB
        subgraph "User's Browser"
            U[User]
        end

        subgraph "Vercel Platform"
            subgraph "Next.js Application (CinemaRebel)"
                RSC[React Server Components <br/> (Data Fetching)]
                CC[Client Components <br/> (UI Interactivity)]
                SA[Server Actions <br/> (Mutations)]
                API[API Routes]
            end
        end

        subgraph "Data & External Services"
            DB[Database <br/> (PostgreSQL/SQLite via Prisma)]
            TMDB[TMDB API <br/> (Movie/TV Data)]
            VIDORA[Vidora Player <br/> (Video Streaming)]
            AUTH[Authentication <br/> (e.g., NextAuth.js)]
        end

        U -- "HTTP Request" --> RSC
        RSC -- "Fetches data from" --> TMDB
        RSC -- "Fetches user data from" --> DB
        RSC -- "Renders & streams UI to" --> U
        RSC -- "Hydrates" --> CC
        CC -- "User interaction <br/> (e.g., Add to Watchlist)" --> SA
        SA -- "Writes to" --> DB
        CC -- "Calls" --> API
        CC -- "Handles" --> AUTH
        RSC -- "Embeds" --> VIDORA
    end

    A -- "Deploy on Merge" --> Vercel
```

### Explanation of the Diagram

This diagram is split into two main sections:

1.  **Development Workflow**: This illustrates the multi-agent development process. AI agents claim tasks from `AGENT_ASSIGNMENTS.md`, work on isolated feature branches, and submit Pull Requests. GitHub Actions run automated checks before code is merged into the `main` branch.

2.  **Application & Infrastructure**: This shows the technical architecture of the deployed application.
    *   **User Interaction**: A user accesses the application running on Vercel.
    *   **Next.js Application**: It uses a hybrid model of Server and Client Components. Server Components fetch data from the database (via Prisma) and the TMDB API. Interactive parts of the UI are handled by Client Components, which use Server Actions to securely modify data.
    *   **External Services**: The application relies on external services for media data (TMDB), video playback (Vidora), and user authentication.
    *   **Deployment**: Merging to the `main` branch on GitHub automatically triggers a new deployment to Vercel.