# Frontend Smoke Test (Manual Outline)

1. Load base route (/) and ensure index.html served by Vercel (production) or dev server.
2. Open network tab and attempt login (requires valid backend URL via VITE_API_URL). Expect 200 from /api/auth/login.
3. After login, localStorage should contain: token, userId, isAuthenticated=true.
4. Navigate to /userdashboard (auto redirected via success alert currently forcing full reload).
5. Hit a data-fetching component (e.g., ParkingFinderPage) and confirm requests go to production API host (no localhost).
6. Trigger booking flow: search parking spaces, select one, attempt booking (POST /api/bookings) and verify 200/201.
7. Lister flow: login as lister, open ListerDashboard, confirm GET /api/parking-entries success.
8. Admin flow: login as admin, open AdminRequestPage to see pending parking requests.

Automated script could be added with Playwright later.
