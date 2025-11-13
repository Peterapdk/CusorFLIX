emoryp# CinemaRebel API Reference

This document provides comprehensive documentation for external APIs integrated with CinemaRebel.

## Table of Contents

- [CinemaOS API](#cinemaos-api)
- [Vidora API](#vidora-api)
- [TMDB API Integration](#tmdb-api-integration)

## CinemaOS API

CinemaOS provides video streaming capabilities for movies and TV shows.

### Movie Embed URL

**Endpoint:** `https://cinemaos.tech/player/{tmdb_id}`

**Parameters:**
- `tmdb_id`: TMDB movie ID (can also use IMDb ID)

**Example:**
```
https://cinemaos.tech/player/299534
```

### TV Show Embed URL

**Endpoint:** `https://cinemaos.tech/player/{tmdb_id}/{season_number}/{episode_number}`

**Parameters:**
- `tmdb_id`: TMDB TV show ID (can also use IMDb ID)
- `season_number`: Season number
- `episode_number`: Episode number

**Example:**
```
https://cinemaos.tech/player/1396/1/1
```

## Vidora API

Vidora provides advanced video streaming with customizable player options.

### Base URLs

- **Movies:** `https://vidora.su/movie/[tmdbId]?parameters`
- **TV Shows:** `https://vidora.su/tv/[tmdbId]?parameters`

### Supported Parameters

| Parameter | Description | Type | Default | Example |
|-----------|-------------|------|---------|---------|
| `autoplay` | Automatically start playback | boolean | `false` | `?autoplay=true` |
| `colour` | Custom theme color (hex without #) | string | `00ff9d` | `?colour=00ff9d` |
| `autonextepisode` | Auto-play next episode (TV only) | boolean | `true` | `?autonextepisode=true` |
| `backbutton` | Back button URL | string | `https://vidora.su/` | `?backbutton=https://google.com` |
| `logo` | Custom logo URL | string | - | `?logo=https://example.com/logo.png` |
| `pausescreen` | Show info overlay on pause | boolean | `true` | `?pausescreen=true` |
| `idlecheck` | User activity check (minutes, 0 to disable) | number | `0` | `?idlecheck=10` |

### Usage Examples

#### Movie with Autoplay and Custom Color
```
https://vidora.su/movie/299534?autoplay=true&colour=ff4757
```

#### TV Show with Custom Logo
```
https://vidora.su/tv/1396?logo=https://example.com/logo.png&colour=3742fa
```

#### Combining Multiple Parameters
```
https://vidora.su/movie/299534?autoplay=true&colour=00ff9d&backbutton=https://vidora.su/&logo=https://vidora.su/logo.png
```

### Iframe Integration

```html
<iframe
  src="https://vidora.su/movie/299534?autoplay=true&colour=00ff9d"
  width="100%"
  height="100%"
  allowfullscreen
></iframe>
```

### Watch Progress Syncing

Vidora supports syncing watch progress with your application via postMessage API.

```javascript
const STORAGE_KEY = 'watch_progress';
let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

window.addEventListener('message', (event) => {
  if (event.data?.type === 'MEDIA_DATA') {
    const mediaData = event.data.data;
    if (mediaData.id && (mediaData.type === 'movie' || mediaData.type === 'tv')) {
      watchProgress[mediaData.id] = {
        ...watchProgress[mediaData.id],
        ...mediaData,
        last_updated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));

      console.log('Progress updated:', mediaData);
    }
  }
});
```

#### Progress Data Format

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | TMDB or IMDb ID |
| `type` | `'movie'` \| `'tv'` | Content type |
| `title` | string | Content title |
| `progress` | object | Watch progress data |
| `last_updated` | number | Timestamp |

### Finding TMDB IDs

#### For Movies
1. Visit [themoviedb.org](https://www.themoviedb.org) or [imdb.com](https://www.imdb.com)
2. Search for your movie
3. Click on the movie title
4. Look at the URL: `299534` or `tt4154796`
5. The number/ID in the URL is your identifier

#### For TV Shows
1. Visit [themoviedb.org](https://www.themoviedb.org) or [imdb.com](https://www.imdb.com)
2. Search for your TV show
3. Click on the show title
4. For seasons: Click on a season, then episode
5. Use format: `showId/seasonNumber/episodeNumber`

#### Example URLs
- **Avengers: Endgame:** `299534` or `tt4154796`
- **Breaking Bad S01E01:** `1396/1/1` or `tt0903747`

## TMDB API Integration

CinemaRebel integrates with The Movie Database (TMDB) API for content discovery and metadata.

### Endpoints Used

- **Trending:** `/trending/{media_type}/{time_window}`
- **Search:** `/search/multi`
- **Discover:** `/discover/movie`, `/discover/tv`
- **Details:** `/movie/{id}`, `/tv/{id}`
- **Genres:** `/genre/movie/list`, `/genre/tv/list`

### Authentication

Requires TMDB API key. See environment variables in main README.

### Rate Limits

- 50 requests per second
- CinemaRebel implements caching and rate limiting to stay within limits

---

## Integration Notes

- All APIs support both TMDB and IMDb IDs where applicable
- CinemaRebel handles API fallbacks and error states gracefully
- Progress syncing is optional and works via iframe postMessage
- Custom branding options available through logo and color parameters

For additional support or custom integrations, refer to the respective API documentation:
- [CinemaOS Documentation](https://cinemaos.tech)
- [Vidora Documentation](https://vidora.su)
- [TMDB API Documentation](https://developers.themoviedb.org)