# 🏨 Hotel Management System - Complete Project Architecture

## 📋 Overview

Your hotel management system has **4 main user roles** with separate panels and workflows:

1. **Guest** (Customer) - Public booking interface
2. **Reception Staff** - Check-in/Check-out operations
3. **Housekeeping Staff** - Room cleaning management
4. **Admin** - System oversight and management

---

## 🔐 Authentication & Authorization

### Login System

- **Guest Login** → `/login` → **Guest Panel** (`/`)
- **Staff Login** → `/login/staff` → **Staff Dashboard** (`/staff`)
- **Admin Login** → `/login` → **Admin Dashboard** (`/admin`)

### Token Storage

```
Guest:        localStorage['token'] + localStorage['user']
Staff:        localStorage['staffToken'] + localStorage['staffUser']
Admin:        localStorage['adminToken'] + localStorage['adminUser']
```

### Role-Based Access Control (RBAC)

```
Receptionist  → Can check-in/check-out, manage bookings, create rooms
Housekeeping  → Can only see CLEANING rooms, mark as CLEAN/FREE
Manager       → Full staff permissions
Admin         → Full system control
```

---

## 👥 GUEST/CUSTOMER PANEL

### Purpose

Guests browse rooms and book hotel stays online

### Pages & Features

| Page             | Route           | Features                                                        |
| ---------------- | --------------- | --------------------------------------------------------------- |
| **Landing Page** | `/`             | Hero section, room showcase, about us, services, loyalty offers |
| **Room Booking** | `/booking`      | Browse available rooms, select dates, filter by type            |
| **Booking Form** | `/booking/form` | Guest details, payment via Stripe, final confirmation           |
| **My Bookings**  | `/bookings`     | View past & upcoming reservations, booking status               |
| **About**        | `/aboutpage`    | Hotel information, mission, values                              |
| **Services**     | `/services`     | Hotel amenities and services list                               |
| **Contact**      | `/contact`      | Contact form, support information                               |

### Data Flow

```
Guest views room → Selects dates → Fills booking form →
Stripe payment → Booking created (Confirmed status) →
Email confirmation → Booking appears in /bookings
```

### Key Models Used

- **RoomListing** - Available rooms with pricing
- **Booking** - Guest reservations
- **User** - Guest account info
- **Payment** - Stripe payment records

### APIs Called

- `GET /api/rooms/` - List available rooms
- `GET /api/rooms/available` - Check availability for date range
- `POST /api/booking/` - Create new booking
- `GET /api/booking/my` - Fetch my bookings
- `POST /api/payment/` - Process Stripe payment

---

## 👔 STAFF PANEL

### Purpose

Reception & Housekeeping staff manage daily operations

### Staff Roles & Permissions

#### **RECEPTIONIST** ✅

**Responsibilities:**

- Check guests in/out
- Create bookings manually
- Manage reservations
- View all active bookings

**Dashboard Access:**

- `/staff/dashboard` - Stats overview
- `/staff/checkinout` - Check-in/Out interface
- `/staff/bookings` - View/manage bookings
- `/staff/rooms` - Room status overview
- `/staff/guests` - Active guests list
- `/staff/reports` - Daily reports

**Room Status Transitions:**

```
Check-in  → Sets room status: FREE → STAY
Check-out → Sets room status: STAY → CLEANING
           ↓ (Auto-creates housekeeping task)
```

---

#### **HOUSEKEEPING** 🧹

**Responsibilities:**

- See only CLEANING rooms
- Mark rooms as clean
- Auto-release rooms as FREE

**Dashboard Access:**

- `/staff/housekeeping` - Cleaning panel (PRIMARY)
- `/staff/rooms` - Room status view

**Room Status Workflow:**

```
Receptionist checks out → Room becomes CLEANING
                        ↓
Housekeeping sees room in "Rooms Needing Cleaning" section
                        ↓
Clicks "Mark Clean" → Room status: CLEANING → CLEAN
                        ↓
Housekeeping sees room in "Clean Rooms Ready" section
                        ↓
Clicks "Mark Free" → Room status: CLEAN → FREE (30s auto-transition)
```

**Validation:**

- Can ONLY update rooms with status CLEANING or CLEAN
- Cannot access rooms in STAY or FREE status
- Role-based permission checks on backend

---

### Staff Dashboard Components

#### Statistics

```
- Total Rooms
- Available Rooms
- Occupied Rooms (STAY)
- Cleaning Rooms (CLEANING)
- Maintenance Rooms
- Active Guests
- Check-ins Today
- Check-outs Today
- Pending Tasks
- Occupancy Rate
```

#### Lists

```
- Recent Bookings (with room assignment)
- Active Guests (checked-in only)
- Room Status (color-coded)
- Pending Tasks (auto-created from checkout)
```

### Staff APIs

| Method | Endpoint                         | Role             | Purpose               |
| ------ | -------------------------------- | ---------------- | --------------------- |
| GET    | `/api/staff/panel`               | Any Staff        | Dashboard data        |
| GET    | `/api/staff/rooms`               | Any Staff        | List all rooms        |
| GET    | `/api/staff/bookings`            | Receptionist     | View bookings         |
| PUT    | `/api/staff/bookings/:id/status` | Receptionist     | Check-in/Check-out    |
| POST   | `/api/staff/bookings`            | Receptionist     | Create manual booking |
| PATCH  | `/api/staff/rooms/:id`           | Housekeeping/Mgr | Update room status    |
| PUT    | `/api/staff/rooms/status`        | Any Staff        | Update via booking    |
| GET    | `/api/staff/tasks`               | Any Staff        | List tasks            |
| PATCH  | `/api/staff/tasks/:id`           | Any Staff        | Update task           |
| POST   | `/api/staff/tasks/:id/complete`  | Any Staff        | Mark task complete    |

---

## 🛠️ ADMIN PANEL

### Purpose

System-wide management, analytics, reporting

### Admin Pages & Features

| Page                | Route                    | Features                                      |
| ------------------- | ------------------------ | --------------------------------------------- |
| **Dashboard**       | `/admin`                 | KPI cards, trends chart, recent bookings      |
| **Manage Bookings** | `/admin/manage-booking`  | Search/view all bookings, cancel reservations |
| **Manage Rooms**    | `/admin/manage-room`     | Create/edit/delete room types, set pricing    |
| **Manage Users**    | `/admin/manage-user`     | View guest accounts, disable users            |
| **Manage Staff**    | `/admin/manage-staff`    | Create staff accounts, assign roles           |
| **Payment Reports** | `/admin/manage-payment`  | Revenue analytics, monthly summaries          |
| **Dashboard Stats** | `/admin/dashboard-stats` | Detailed metrics, graphs, trends              |

### Dashboard KPIs

```
📊 Total Bookings      - All time or by month
🛏️  Rooms Available    - Quantity available now
💰 Monthly Revenue    - Total $ for selected month
📈 Occupancy %        - % of rooms currently occupied
```

### Analytics & Trends

- 30-day booking trends
- 30-day revenue trends
- Monthly revenue breakdown
- Booking status distribution
- Guest checkout analytics

### Admin APIs

| Method | Endpoint                              | Purpose                   |
| ------ | ------------------------------------- | ------------------------- |
| GET    | `/api/admin/overview`                 | Dashboard KPIs            |
| GET    | `/api/admin/stats`                    | Monthly statistics        |
| GET    | `/api/admin/trends`                   | Trend data                |
| GET    | `/api/admin/bookings/recent-bookings` | Recent bookings list      |
| PUT    | `/api/admin/bookings/:id/cancel`      | Cancel booking            |
| GET    | `/api/admin/rooms`                    | All rooms                 |
| POST   | `/api/admin/rooms`                    | Create room               |
| PUT    | `/api/admin/rooms/:id`                | Edit room                 |
| DELETE | `/api/admin/rooms/:id`                | Delete room               |
| GET    | `/api/admin/users`                    | All guests                |
| GET    | `/api/admin/staff`                    | All staff members         |
| POST   | `/api/admin/staff`                    | Create staff account      |
| GET    | `/api/admin/payments/summary`         | Payment summary by month  |
| GET    | `/api/admin/payments/by-date`         | Payment breakdown by date |

---

## 🚀 DATA FLOW & OPERATIONS

### Complete Booking Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. GUEST BOOKS ONLINE                                       │
│    Guest → /booking → Select room/dates → Stripe payment   │
│    → Booking created with status: "Confirmed"              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. CHECK-IN DAY (Receptionist)                             │
│    Reception → /staff/checkinout → Find booking             │
│    → Click "Check In"                                       │
│    → Booking status: Confirmed → Checked-in                │
│    → Room status: FREE → STAY                              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 3. GUEST STAYING (View in Dashboard)                       │
│    Admin can see occupancy ↑                                │
│    Staff see active guests                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 4. CHECK-OUT DAY (Receptionist)                            │
│    Reception → /staff/checkinout → Find booking             │
│    → Click "Check Out"                                      │
│    → Booking status: Checked-in → Checked-out              │
│    → Room status: STAY → CLEANING ✨                       │
│    → Auto-create Housekeeping Task                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. CLEANING (Housekeeping)                                 │
│    Housekeeping → /staff/housekeeping                      │
│    → See "Rooms Needing Cleaning" (CLEANING status)        │
│    → Click "Mark Clean"                                    │
│    → Room status: CLEANING → CLEAN                         │
│    → Room appears in "Ready for Release" section           │
│    → Click "Mark Free"                                     │
│    → Room status: CLEAN → FREE (auto in 30 seconds)       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 6. ROOM AVAILABLE (Back to pool)                           │
│    Admin sees occupancy ↓                                   │
│    Room ready for next guest                               │
│    Status: FREE - available for booking                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 ROOM STATUS STATES

```
┌────────────────────────────────────────────────────┐
│ Room Status State Machine                          │
├────────────────────────────────────────────────────┤
│                                                    │
│  FREE ←────────────────────────────────────── CLEAN
│   ↓                                              ↑
│   └──→ STAY ──→ CLEANING ──→ CLEAN ─→ (auto) FREE
│         (checkin)  (checkout)   (mark clean)
│                                 (mark free)
│                                                    │
│  Roles allowed:                                  │
│  • FREE/STAY/CLEANING: Receptionist               │
│  • CLEANING/CLEAN/FREE: Housekeeping              │
│  • All: Manager/Admin                            │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE MODELS

### User (Guest)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: "user" (default),
  createdAt: Date
}
```

### Staff

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  role: "Receptionist" | "Housekeeping" | "Manager",
  shift: "Morning" | "Afternoon" | "Night",
  createdAt: Date
}
```

### RoomListing (Room)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  roomType: "Single" | "Double" | "Deluxe" | "Suite" | "Family",
  totalRooms: Number (how many units of this type),
  status: "FREE" | "STAY" | "CLEANING" | "CLEAN" | "MAINTENANCE",
  pricing: {
    standardRate: Number,
    currency: "INR"
  },
  amenities: [String],
  images: [String],
  lastStatusUpdate: Date,
  updatedBy: ObjectId (staff),
  createdAt: Date
}
```

### Booking

```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: RoomListing),
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  checkIn: Date,
  checkOut: Date,
  totalAmount: Number,
  bookingStatus: "Confirmed" | "Checked-in" | "Checked-out" | "Cancelled",
  assignedRoomNumber: String,
  actualCheckIn: Date,
  actualCheckOut: Date,
  history: [{
    action: String,
    by: ObjectId (staff),
    note: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

### Task

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: "Housekeeping" | "Maintenance" | "Administrative",
  priority: "Low" | "Medium" | "High",
  status: "Pending" | "In Progress" | "Completed",
  roomId: ObjectId (ref: RoomListing),
  assignedTo: ObjectId (staff),
  dueDate: Date,
  completedAt: Date,
  comments: [{
    author: ObjectId (staff),
    text: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

### Payment

```javascript
{
  _id: ObjectId,
  bookingId: ObjectId (ref: Booking),
  stripePaymentIntentId: String,
  amount: Number,
  currency: String,
  status: "succeeded" | "pending" | "failed",
  paymentMethod: String,
  createdAt: Date
}
```

---

## 🔐 Security Features

### Authentication

- JWT tokens for API authentication
- Session-based backup authentication
- Secure password hashing (bcrypt)
- Google OAuth integration for guests

### Authorization

- Role-based middleware (`verifyStaff`, `isAdmin`)
- Endpoint-level permission checks
- Resource-level validation (can only update own scope)
- Status transition validation per role

### Data Protection

- Input validation on all endpoints
- SQL/NoSQL injection prevention (via Mongoose)
- CORS enabled for frontend-backend communication
- Sensitive data excluded from API responses

---

## 🛠️ Technology Stack

### Frontend

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Stripe.js** - Payment processing
- **Lucide React** - Icons
- **Tailwind CSS / Custom CSS** - Styling
- **Recharts** - Admin analytics charts

### Backend

- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Token authentication
- **Stripe API** - Payment gateway
- **Passport.js** - Google OAuth
- **Nodemailer** - Email notifications

### Deployment

- Backend hosted on Node/Express server
- Frontend as React build
- MongoDB Atlas or local MongoDB

---

## 📱 Mobile Responsiveness

- Tailwind CSS grid system (responsive)
- Mobile-first design approach
- Adaptive layouts for all screen sizes
- Touch-friendly UI components

---

## 🎯 Project Scope (College Major Project)

This is a **simplified hotel system** suitable for academic purposes:

- ✅ Basic booking management
- ✅ Role-based staff operations
- ✅ Real-time room status tracking
- ✅ Payment integration
- ✅ Admin analytics
- ❌ NOT enterprise-grade (no inventory, housekeeping schedules, advanced reporting)
- ❌ NOT production-ready (limited error handling, no load testing)

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Guest      │ Receptionist │ Housekeeping │     Admin      │
│   Panel      │   Panel      │   Panel      │    Panel       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┼──────────────┼────────────────┘
                      │
         ┌────────────▼─────────────┐
         │   Express.js API Server  │
         ├────────────┬─────────────┤
         │ /api/auth  │ /api/booking│
         │ /api/rooms │ /api/admin  │
         │ /api/staff │ /api/payment│
         └────────────┬─────────────┘
                      │
         ┌────────────▼─────────────────┐
         │     MongoDB Database         │
         ├──────┬──────┬──────┬─────────┤
         │Users │Rooms │Bookings│Tasks │Payments│
         └──────┴──────┴──────┴─────────┘
                      │
         ┌────────────┴──────────────┐
         │   External Services      │
         ├──────────────┬────────────┤
         │ Stripe API   │ Google OAuth│
         │ Nodemailer   │ (SMTP)     │
         └──────────────┴────────────┘
```

---

## 🚀 Quick Start Commands

### Guest/Public Pages

```
npm start              # Start React dev server
```

### Staff Login

Go to `/login/staff` and login with staff credentials

### Admin Login

Go to `/login` and login with admin credentials

### Backend Server

```
cd Customer/backend
npm install
node server.js         # Start API server (port 5000)
```

---

## 📝 Notes

- Each role has **intentionally separate features** - no merged functionality
- Room status is the **primary communication** between Reception and Housekeeping
- No complex workflows - suitable for college academic project
- All data centralized in MongoDB
- Real-time UI updates via fetch/refresh patterns

---

**Last Updated:** January 28, 2026
