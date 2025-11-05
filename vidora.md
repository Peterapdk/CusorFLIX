# Quick Start Guide

Get started with Vidora in minutes. Choose your content type and copy the code below.

Implementation Guide

## Movie Implementation

Use the movie ID from TMDB or IMDb. For example, 299534 (TMDB) or tt4154796 (IMDb) is for "Avengers: Endgame".

```
https://vidora.su/movie/[tmdbId]?parameters
```

```
<iframe
  src="https://vidora.su/movie/299534?autoplay=true&colour=00ff9d&backbutton=https://vidora.su/&logo=https://vidora.su/logo.png"
  width="100%"
  height="100%"
  allowfullscreen
></iframe>
```

### Combining Parameters

Use & to combine multiple parameters. Works with both TMDB and IMDb IDs:

`https://vidora.su/movie/299534?autoplay=true&colour=00ff9d&backbutton=https://vidora.su/&logo=https://vidora.su/logo.png`

`https://vidora.su/movie/tt4154796?autoplay=true&colour=00ff9d&backbutton=https://vidora.su/&logo=https://vidora.su/logo.png`

## Available Parameters

Customization Options

| Parameter | Description | Type | Default | Example |
| --- | --- | --- | --- | --- |
| autoplay | Automatically start playback when the player loads | boolean | false | ?autoplay=true |
| colour | Custom theme color for the player (hex without #) | string | 00ff9d | ?colour=00ff9d |
| autonextepisode | Automatically play next episode (TV shows only) | boolean | true | ?autonextepisode=true |
| backbutton | URL to navigate to when back button is clicked (optional) | string | https://vidora.su/ | ?backbutton=https://google.com |
| logo | URL of the logo to display in the player (optional) | string |  | ?logo=https://example.com/logo.png |
| pausescreen | Show information overlay when video is paused | boolean | true | ?pausescreen=true |
| idlecheck | Check if user is still watching after specified minutes (0 to disable) | number | 0 | ?idlecheck=10 |

### Combining Parameters

Use & to combine multiple parameters:

`https://vidora.su/movie/299534?autoplay=true&colour=00ff9d&backbutton=https://vidora.su/&logo=https://vidora.su/logo.png`

## Watch Progress Syncing

Advanced Feature

Vidora supports syncing watch progress with your website. When embedded as an iframe, the player will send progress updates to the parent window.

```

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

### Progress Data Format

| Property | Type | Description |
| --- | --- | --- |
| id | string | TMDB ID or IMDb ID of the content |
| type | 'movie' | 'tv' | Content type |
| title | string | Title of the content |
| progress | object | Progress information (watched time, duration) |
| last\_updated | number | Timestamp of the last update |

## How to Find TMDB IDs

Quick Guide

### For Movies

1. 1Visit [themoviedb.org](https://www.themoviedb.org) or [imdb.com](https://www.imdb.com)
2. 2Search for your movie
3. 3Click on the movie title
4. 4Look at the URL: `299534` or `tt4154796`
5. 5The number in the URL is your ID (TMDB or IMDb)

### For TV Shows

1. 1Visit [themoviedb.org](https://www.themoviedb.org) or [imdb.com](https://www.imdb.com)
2. 2Search for your TV show
3. 3Click on the show title
4. 4URL format: `1396` or `tt0903747`
5. 5Click on a season, then episode
6. 6Use the format: `showId/seasonNumber/episodeNumber`

### Example URLs

Avengers: Endgame

Breaking Bad S01E01