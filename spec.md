# Lil.Tiny Barber

## Current State
- Home page with "Book a Slot" CTA
- Customer Booking page: 4-step flow (salon select, personal details, service, time slot)
  - `getSalons()` returns ALL registered salons (approved or not)
  - Slot generation: 9:00 AM – 6:50 PM (hour 9-18, 10-min intervals)
  - No support for blocking 2 consecutive slots for Hair Cut + Beard in availability query
- Staff Login page: mobile → simulated OTP → register/login → dashboard
  - `registerSalon()` immediately makes salon active; no approval step
- Dashboard page: view bookings for logged-in salon, mark complete/cancel
- Salon type has no `status` field (pending/approved)
- No admin page

## Requested Changes (Diff)

### Add
- `status` field (`"pending"` | `"approved"`) on `Salon` type, defaulting to `"pending"` on registration
- Backend: `getApprovedSalons()` – returns only approved salons (public query, no auth needed)
- Backend: `approveSalon(id)` – admin-only, sets salon status to `"approved"`
- Backend: `rejectSalon(id)` – admin-only, removes or sets salon status to `"rejected"`
- Backend: `getPendingSalons()` – admin-only, returns salons with status `"pending"`
- Backend: fix slot generation to cover 8:00 AM – 7:00 PM (hour 8-18 inclusive, 10-min intervals)
- Backend: `getAvailableSlots` – for Hair Cut + Beard service, also block the next consecutive slot when checking availability
- Admin page (`AdminPage.tsx`) – shows pending salon registrations with approve/reject buttons; admin login via simple admin PIN stored in localStorage
- `App.tsx`: add `"admin"` page to the `Page` union; route to `AdminPage`
- After staff registers, show a "pending approval" message instead of redirecting to dashboard

### Modify
- `BookingPage.tsx`: call `getApprovedSalons()` instead of `getSalons()` for the dropdown
- `BookingPage.tsx`: slot timing label updated to "8:00 AM – 7:00 PM"
- `BookingPage.tsx` step 4: reload available slots after successful booking so just-booked slot disappears without page refresh
- `StaffLoginPage.tsx`: after `registerSalon()` succeeds, do NOT redirect to dashboard; instead show a "Your salon is pending admin approval" message. Login should only succeed if salon status is `"approved"`.
- `loginSalon()` in backend: only return salon data if status is `"approved"` (unapproved salons cannot log in)
- `DashboardPage.tsx`: add link/button to navigate to admin page in header (for admin access)

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend:
   - Add `status` field to `Salon` type
   - `registerSalon` sets status = "pending"
   - `loginSalon` only returns data for approved salons
   - Add `getApprovedSalons`, `getPendingSalons`, `approveSalon`, `rejectSalon`
   - Fix slot generation: 8:00–18:50 (8 AM to 6:50 PM last slot, i.e., hours 8–18)
   - Fix `getAvailableSlots` to block slot+1 for Hair Cut + Beard service
2. Update `BookingPage.tsx`:
   - Use `getApprovedSalons()` for dropdown
   - Update slot timing hint text
   - Refresh slots after booking confirmation
3. Update `StaffLoginPage.tsx`:
   - After registration show pending approval message (no auto-login)
   - `handleVerifyOtp` for existing salon: check if returned salon is approved before allowing login
4. Add `AdminPage.tsx`:
   - Simple PIN-based admin access (PIN: "1234", stored in sessionStorage)
   - Shows pending salons list with approve/reject actions
5. Update `App.tsx`:
   - Add admin page route
   - Add admin link in nav
