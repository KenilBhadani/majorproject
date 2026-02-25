# TODO: Implement Room Instance Creation on Admin Room Addition

## Completed Tasks

- [x] Import createRoomInstancesForListing utility in adminRooms.js
- [x] Call createRoomInstancesForListing after creating a new room in the POST route
- [x] Room instances will be created based on the totalRooms quantity provided in admin side

## Pending Tasks

- [ ] Test the functionality by adding a room in admin side and verify room instances are created
- [ ] Handle updates to totalRooms in the PUT route (if needed for adjusting instances)
- [ ] Consider edge cases like deleting rooms and cleaning up instances

## Notes

- When admin adds a room with totalRooms = 5, 5 room instances will be created automatically
- Each instance has a unique roomNumber starting from 1
- Instances are linked to the roomListing via roomListing field
