# TODO: Fetch Check-in and Check-out Dates from RoomCard.js in Bookingcus.js

## Steps Completed:

1. ✅ Modified the useEffect in Bookingcus.js to read searchParams from URLSearchParams(location.search), similar to RoomCard.js.
2. ✅ Set searchParams state to the object parsed from URL params (checkIn, checkOut, roomType, guests).
3. ✅ Update sessionStorage with the URL-based searchParams for persistence.
4. ✅ Kept room loading logic unchanged (from location.state or sessionStorage).

## Remaining Steps:

5. Test the booking flow to ensure dates are correctly fetched and displayed on the right side.
6. Verify that on page refresh, dates are still available via sessionStorage.
