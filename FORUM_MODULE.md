# Forum / Community Module

Self-contained Forum module for Thinkz AI: discussions, voting, comments with
@mentions, categories, bookmarks, Live Class Studio and a moderation dashboard.

The module is deliberately isolated so it can be lifted out of the codebase as
a unit: it uses its own `fetch`-based service layer (not the shared axios
client), no redux, and its own styles. A guard test enforces this
(`src/tests/forum/moduleIndependence.test.js`).

## Layout

```
backend/src/                     # Express router mounted at /api in app.js
  data/mockData.js               # seed: users, categories, d1..d5 + 1120 generated
  models/ services/ controllers/ routes/ middleware/ websocket/
frontend/src/
  services/forumApi|categoryApi|bookmarkApi|moderationApi|studioApi|websocket.js
  hooks/useDiscussions|useVoting|useBookmarks|useWebSocket.js
  components/forum|liveStudio|moderation/
  pages/forum|liveStudio|moderation/
  routes/ForumModuleRoutes.jsx   # ForumRoutes, StudioRoutes, ModerationRoutes
  styles/forum.css|liveStudio.css|moderation.css
  tests/{forum,liveStudio,moderation}/   # vitest + testing-library (jsdom)
```

## Routes

| Path            | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `/forum`        | Discussion list (search, filters, pagination)      |
| `/forum/new`    | Create discussion                                  |
| `/forum/:id`    | Thread detail, comments, solved toggle             |
| `/forum/categories` | Category CRUD                                 |
| `/forum/bookmarks`  | Bookmarked threads (localStorage-synced)      |
| `/forum/preferences`| Notification channel preferences              |
| `/studio`       | Live Class Studio (chat, polls, attendees)         |
| `/moderation`   | Flagged queue, user bans, hidden content, editor   |

Wired into the app via three lines in `src/App.jsx` importing
`routes/ForumModuleRoutes.jsx`.

## API (backend, port 5000)

`/api/discussions` (GET list w/ search+filters+sort+pagination, POST),
`/api/discussions/:id`, `/api/discussions/:id/vote`, `/api/discussions/:id/solved`,
`/api/discussions/:id/comments` (GET/POST), `/api/categories` CRUD,
`/api/bookmarks` (GET/POST/DELETE), `/api/notifications`,
`/api/moderation/*` (flagged, hidden, users ban/unban, hide/show, resolve),
`/api/studio/sessions/:id` (+ polls). Socket.IO namespace: `/studio`
(chat, presence, poll updates; falls back to a MockSocket offline mode).

Auth is mocked: requests carry `x-user-id` (default user `u1`).

## Run

```bash
cd backend  && npm install && npx prisma generate && npm start   # :5000
cd frontend && npm install && npm run dev                        # :5173
```

Note: `backend/config/database.js` exits without `DATABASE_URL`; for local
API work against mock data use the temp stub server (see repo history) or set
a dummy Postgres URL.

## Test

```bash
cd frontend
npx vitest run --project forum   # 16 files / 69 tests (jsdom)
npm run build                    # production build check
```

Backend API contract verified with a 38-check smoke suite covering pagination,
voting, mentions, bookmarks, preferences, moderation actions, studio polls and
filter/deep-pagination performance (<20 ms).
