# load.tube

A full-stack web application for downloading YouTube media, built from scratch with modern technologies.

## Architecture

```
ytdownloader/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Environment & app configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Auth, rate limiting, validation, error handling
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic (metadata, download, cache, validation)
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Helpers (logger, cleanup, validation, errors)
│   ├── prisma/               # Database schema & migrations
│   ├── __tests__/            # Unit tests
│   └── package.json
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/              # Pages (Home, FAQ, Privacy, Terms, Contact, Admin)
│   │   ├── components/       # UI, layout, and feature components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client & utilities
│   │   └── types/            # TypeScript types
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT (admin panel) |
| Media Extraction | ytdl-core |
| Styling | Tailwind CSS v4 |
| Containerization | Docker & docker-compose |

## Features

- **URL Analysis**: Paste a YouTube URL to fetch video metadata (title, duration, thumbnail, channel, upload date, available qualities)
- **Format Selection**: Choose video (MP4, 360p-1080p) or audio (MP3, 64-320 kbps)
- **Download Flow**: Progress tracking, auto-download, graceful error handling
- **Security**: Rate limiting, input validation, Helmet, CORS, file cleanup
- **Dark Mode**: System-aware with manual toggle
- **Responsive Design**: Mobile-friendly layout
- **Admin Panel**: Password-protected dashboard with stats and logs
- **Caching**: In-memory cache for metadata

## API Endpoints

### `POST /api/analyze`
Fetch video metadata.

**Request:**
```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "...",
    "title": "...",
    "duration": 360,
    "thumbnail": "...",
    "channel": "...",
    "uploadDate": "2024-01-01",
    "availableQualities": [...]
  }
}
```

### `POST /api/download`
Start a download job.

**Request:**
```json
{ "url": "https://...", "format": "mp4", "quality": "720p" }
```

**Response:**
```json
{ "success": true, "data": { "jobId": "...", "fileName": "...", "fileSize": 0, "status": "pending" } }
```

### `GET /api/download/status/:id`
Poll download progress.

### `GET /api/download/file/:id`
Download the completed file.

### `GET /api/admin/stats`
Get admin dashboard statistics (requires auth).

### `GET /api/admin/logs`
Get recent admin activity (requires auth).

### `POST /api/admin/login`
Authenticate as admin.

### `GET /api/health`
Health check.

## Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_URL` | The provided URL is not a valid YouTube URL |
| `PRIVATE_VIDEO` | The video is private |
| `AGE_RESTRICTED` | The video is age-restricted |
| `UNAVAILABLE` | The video is unavailable or removed |
| `LIVE_STREAM` | Live streams are not supported |
| `NETWORK_TIMEOUT` | Request timed out |
| `CONVERSION_FAILURE` | Media conversion failed |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Local Development

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd ytdownloader
   ```

2. Set up the backend:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   npx prisma db push
   npm run dev
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev
   ```

4. Open http://localhost:3000

### Docker Deployment

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 4000
- Frontend on port 3000

### Configuration

Key environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Backend server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `JWT_SECRET` | - | Secret for JWT signing |
| `ADMIN_USERNAME` | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | `admin123` | Admin panel password |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `RATE_LIMIT_MAX` | `50` | Max requests per window |

## Running Tests

```bash
cd backend
npm test
```

## Future Improvements

- User accounts with download history
- Playlist support
- Batch downloads
- WebSocket-based progress updates
- Audio waveform visualization
- Built-in media player
- Internationalization (i18n)
- Redis caching layer
- CDN support for file delivery
- Webhook notifications
- API rate limit tiers
