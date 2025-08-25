# Convene Server (Express + Mongo + Zoom + Email)

## Quick Start
```bash
cd server
cp .env.sample .env  # fill values
npm i
npm run dev
```

Health check: GET http://localhost:5000/health

Auth:
- POST /api/auth/register { fullName, email, password }
- POST /api/auth/login { email, password }
- GET  /api/auth/me (Authorization: Bearer <token>)

Meetings (Authorization required):
- GET  /api/meetings
- POST /api/meetings
  {
    "title": "Sprint planning",
    "type": "online",
    "platform": "zoom",
    "context": "international",
    "month": 8,
    "week": 3,
    "orgTimezone": "Asia/Kolkata",
    "clientTimezone": "Europe/Berlin",
    "allowWeekends": false,
    "durationMins": 45,
    "participants": ["teammate@example.com"]
  }
- GET  /api/meetings/:id
- POST /api/meetings/:id/participants { "participants": ["a@b.com", "c@d.com"] }
```

Make sure MongoDB is running locally or adjust `MONGODB_URI`.
