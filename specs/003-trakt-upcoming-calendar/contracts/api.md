# Calendar API Contract

## GET /api/calendar/upcoming

Fetches personalized upcoming releases for the authenticated user.

### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |
| trakt-api-version | 2 | Yes |
| trakt-api-key | `<client_id>` | Yes |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| start_date | string | Today | - | Start date in YYYY-MM-DD format |
| days | number | 7 | 30 | Number of days to fetch |

### Success Response

**Code**: 200 OK

```json
{
  "success": true,
  "data": {
    "startDate": "2026-02-05",
    "endDate": "2026-03-07",
    "fetchedAt": "2026-02-05T19:00:00.000Z",
    "days": [
      {
        "date": "2026-02-05",
        "episodes": [
          {
            "id": "12345-1-5",
            "traktEpisodeId": 5165667,
            "traktShowId": 180770,
            "showTitle": "Example Show",
            "seasonNumber": 1,
            "episodeNumber": 5,
            "episodeTitle": "Episode Five",
            "releaseDate": "2026-02-05T01:00:00.000Z",
            "tmdbShowId": 125988,
            "tmdbEpisodeId": 2964686,
            "displayDate": "Tomorrow (Feb 5)"
          }
        ],
        "movies": []
      }
    ]
  }
}
```

### Error Responses

**Code**: 401 Unauthorized

```json
{
  "success": false,
  "error": "Invalid or missing authentication"
}
```

**Code**: 429 Too Many Requests

```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again later."
}
```

**Code**: 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch calendar data"
}
```
