# Tracker

30 January 2026

1. [ADD] Created `.env` configuration file in `exam-battle-backend` with provided environment variables.
2. [ADD] Created `.env.local` configuration file in `exam-battle-frontend` with provided environment variables.
3. [FIX] Resolved missing dependencies by installing `npm` packages in both backend and frontend directories.
4. [FIX] Troubleshooting "Profile unavailable" issue by identifying missing database data.
5. [ADD] Implemented `player_ready` socket event and battle start logic in `battle.websocket.ts`.
6. [UPDATE] Updated `BattleLobby.tsx` to include "Ready" button and handle ready state.
7. [UPDATE] Pushed changes to `dev-os` branch in `exam-battle-frontend` and `exam-battle-backend`.
8. [ADD] Implemented `player_unready` socket event in `battle.websocket.ts` to allow canceling ready status.
9. [UPDATE] Updated `BattleLobby.tsx` to support toggling between "Ready" and "Cancel Ready".
10. [UPDATE] Pushed Ready/Unready toggle changes to `dev-os` branch in `exam-battle-frontend` and `exam-battle-backend`.
11. [UPDATE] Pulled latest changes from `dev-os`. Backend: Updated `user.service.ts`. Frontend: Up to date.
12. [ADD] Implemented Online Status feature. Backend tracks socket connections; Frontend displays online indicator in Battle Buddies sidebar.
13. [UPDATE] Pushed Online Status feature changes to `dev-os` branch in `exam-battle-frontend` and `exam-battle-backend`.
14. [UPDATE] Updated `battle.websocket.ts` to persist lobby data (users, paper) and emit it with `battle_start`. Added console logs for debugging.
15. [NEW] Created dynamic Battle Page at `/battle/[battleId]`. Fetches and renders questions using `join_battle` socket event.
16. [NEW] Implemented backend API `GET /question-papers/:id` for fetching single question papers.
17. [UPDATE] Integrated `useGetSingleQuestionPaperQuery` in `BattlePage` to fetch questions reliably.
18. [DEBUG] Verified `getQuestionPaperById` correctly returns populated questions. Added console logs in `BattlePage` to confirm.
19. [UPDATE] Pushed changes (Question API, Data Persistence Fix, Debug Logs) to `dev-os`.
20. [INFO] Relocated `tracker.md` to `exam-battle-backend` directory as requested.

01 February 2026

21. [UPDATE] Added `explanation` field to `Question` model and interface.
22. [ADD] Created and executed `scripts/backfill-explanation.ts` to populate demo explanations for existing questions.
23. [FIX] Resolved frontend route conflict by removing duplicate `app/battle/[battleId]` directory.
24. [UPDATE] Updated `BattlePage` (`[battleRoomId]`) to display question explanations after the battle is finished.
25. [FIX] Resolved React state update error in `QuestionPaperModal` by wrapping `onSelect` in `useEffect`.
26. [NEW] Implemented `BattleResultModal` with "Show Explanation" and "Back to Lobby" options.
27. [UPDATE] Updated `BattlePage` logic to wait for both players to finish before showing results.
28. [FIX] Added persistent "Back to Lobby" button in `BattlePage` for explanation view.
29. [BACKEND] Implemented `Battle` model, `BattleController`, and History API (`GET /battles/history`).
30. [BACKEND] Updated `battle.websocket.ts` to persist battle results to MongoDB upon completion.
31. [FRONTEND] Implemented `BottomNav` component for floating navigation.
32. [FRONTEND] Created `ProfilePage` (`/profile`) and `HistoryPage` (`/history`).
33. [UPDATE] Pushed all changes (Backend & Frontend) to `dev-os`.
