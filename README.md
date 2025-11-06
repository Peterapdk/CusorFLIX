# CinemaRebel

A modern movie and TV show library management application built with Next.js, TMDB API, and CinemaOS.

## Features

- 🎬 Browse trending movies and TV shows
- 🔍 Search movies and TV shows
- 📚 Personal library with watchlists and custom lists
- 🎥 Watch integration with CinemaOS
- ⚙️ User settings

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **API**: The Movie Database (TMDB)
- **Video Player**: CinemaOS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use the configured Prisma Postgres)
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CinemaRebel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `example.env.local` to `.env.local`:
   ```bash
   cp example.env.local .env.local
   ```
   
   Fill in your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_TMDB_API_KEY`: Your TMDB API key
   - `TMDB_READ_ACCESS_TOKEN`: Your TMDB v4 access token (optional, but recommended)

4. **Set up the database**
   
   Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```
   
   Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
CinemaRebel/
├── app/                    # Next.js app router pages
│   ├── library/           # User library page
│   ├── movie/[id]/        # Movie details page
│   ├── search/            # Search page
│   ├── settings/          # Settings page
│   ├── tv/[id]/           # TV show details page
│   └── watch/[type]/[id]/ # Watch page
├── components/            # React components
│   ├── Card.tsx          # Reusable card component
│   ├── ErrorBoundary.tsx # Error boundary
│   └── Navbar.tsx        # Navigation bar
├── lib/                   # Utility libraries
│   ├── db.ts             # Prisma client
│   └── tmdb.ts           # TMDB API client
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma     # Database schema
└── server/                # Server actions
    └── actions/          # Server-side actions
```

## Database Schema

The application uses Prisma with the following models:

- **User**: User accounts
- **List**: User-created lists (watchlist or custom)
- **ListItem**: Items in lists (movies or TV shows)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDB API v3 key | Yes |
| `TMDB_READ_ACCESS_TOKEN` | TMDB API v4 access token | Recommended |
| `NEXTAUTH_SECRET` | Secret for NextAuth (if using auth) | No |
| `NEXTAUTH_URL` | Base URL for NextAuth | No |

## Features in Development

- [ ] User authentication (NextAuth.js)
- [ ] Real user accounts (currently using demo user)
- [ ] Export library functionality
- [ ] Advanced filtering and sorting
- [ ] Ratings and reviews
- [ ] Social features (sharing lists)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
