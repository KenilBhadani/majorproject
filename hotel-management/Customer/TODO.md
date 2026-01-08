# TODO: Connect Slogin.js to Database Staff Model

## Tasks
- [x] Edit src/Staff/Slogin.js:
  - Remove static DEFAULT_EMAIL and DEFAULT_PASSWORD constants.
  - Remove the hardcoded check for static credentials.
  - Change fetch URL to '/api/staff/auth/login'.
  - Update response handling to use data.staff for localStorage.
  - Adjust role check to navigate staff to dashboard.
  - Remove demo credentials display section.

## Followup
- [ ] Test staff login with database credentials.
- [ ] Ensure backend has staff records.
