# CampusConnect — Smart Campus Management & Student Service Portal

A full-stack web application built for a final-year college project. Students can submit complaints and service requests, view notices and events, and track everything from a personal dashboard. Admins get a full management console with analytics.

## Features

**Student Portal**
- Register / Login (JWT-secured)
- Personal dashboard with live stats
- Submit & track complaints and service requests
- Browse notices (with pinned/priority) and campus events
- Editable profile, activity history, search & filters

**Admin Console**
- KPI dashboard with charts (Chart.js)
- Manage complaints & requests (update status, respond)
- Manage students (search, filter, activate/deactivate)
- Create/edit/delete notices and events
- Full analytics page (category, status, department, monthly trend)

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js, Font Awesome
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas) with Mongoose
- **Auth:** JWT + bcrypt password hashing

## System Requirements

- Node.js v18 or higher
- A free MongoDB Atlas account
- A modern web browser

## Installation

```bash
cd backend
npm install
```

## MongoDB Setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username + password)
3. Under Network Access, allow access from your current IP (or 0.0.0.0/0 for local dev)
4. Click "Connect" → "Drivers" and copy your connection string

## Environment Variables

Copy `.env.example` to `.env` inside the `backend` folder and fill in:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
PORT=5000
```

## Seeding Demo Data

```bash
cd backend
npm run seed
```

This creates 1 admin, 13 students, 15 complaints, 12 service requests, 8 notices, and 6 events.

## Running the Project

```bash
cd backend
npm start
```

Then open: **http://localhost:5000**

## Demo Credentials

| Role    | Email                       | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@campusconnect.com      | Admin@123   |
| Student | student@campusconnect.com    | Student@123 |

*(These are demo credentials only — created by the seed script.)*

## Folder Structure

```
CampusConnect/
├── backend/        Express server, models, routes, middleware, seed script
└── frontend/       Static HTML/CSS/JS pages served by Express
```

## API Overview

| Method | Endpoint                     | Description                  |
|--------|-------------------------------|-------------------------------|
| POST   | /api/auth/register            | Register a student           |
| POST   | /api/auth/login                | Log in                       |
| GET    | /api/auth/me                   | Get current user             |
| GET/POST/PUT/DELETE | /api/complaints    | Complaint CRUD                |
| GET/POST/PUT/DELETE | /api/requests      | Service request CRUD          |
| GET/POST/PUT/DELETE | /api/notices       | Notice CRUD (admin write)     |
| GET/POST/PUT/DELETE | /api/events        | Event CRUD (admin write)      |
| GET    | /api/admin/stats                | Dashboard KPIs                |
| GET    | /api/admin/students             | List students                 |
| GET    | /api/admin/analytics            | Chart data                    |

## Future Enhancements

- Email/push notifications on status updates
- AI-based automatic complaint categorization
- AI chatbot for common student queries
- QR-based event attendance
- Mobile app version
- College ERP integration

## Author

Final-year academic project — built with CampusConnect (2026).
