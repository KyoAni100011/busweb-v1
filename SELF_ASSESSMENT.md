# Final project Self-assessment report

Team: 21126019-21126020-21126073

GitHub repo URL: https://github.com/KyoAni100011/busapi-v1/commits/khiem/ - https://github.com/KyoAni100011/busweb-v1/commits/dev/

## TEAM INFORMATION

| Student ID | Full name | Git account | Contribution | Contribution percentage (100% total) | Expected total points | Final total points |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 21126019 | Nguyễn Thái Huyền | https://github.com/Harin-Nguyen | QA & Mockup UI | 33% | 7 |  |
| 21126020 | Trương Hoàng Kha | https://github.com/KyoAni100011 | Backend dev | 33% | 7 |  |
| 21126073 | Phạm Nguyễn Gia Khiêm | https://github.com/Cyderxxv | Refind UI, implement API into Frontend, DB test | 34% | 7 |  |

## FEATURE LIST

Project: Bus Ticket Booking System - Intercity Bus Ticketing Platform

Students must input minus points to every uncompleted feature in the SE column.

*SE: Self-evaluation*

*TR: Teacher review*

| ID | Features | Grade | SE* | TR* | Notes |
| ----- | :---- | ----- | :---- | :---- | :---- |
|  |  | **Point** |  |  |  |
| **1** | **Overall requirements** |  |  |  |  |
|  | User-centered design | -5 | 0 |  | Core UX flows in place (search, seat map, booking). |
|  | Database design | -1 | 0 |  | Entities cover users, roles, routes, stops, buses, trips, seats, bookings, payments (see busapi). |
|  | Database mock data | -1 | 0 |  | Seeding present in busapi seed script. |
|  | Website layout | -2 | 0 |  | Customer and admin layouts available. |
|  | Website architect | -3 | 0 |  | MVC-style separation with controllers/services/repos; React SPA frontend. |
|  | Website stability and compatibility | -4 | 0 |  | Responsive across Chrome, Safari, Firefox, and Edge verified. |
|  | Document | -2 | 0 |  | Developer and user documentation completed (setup, API, DB design, architecture, user guide) |
|  | Demo video | -5 | 0 |  | Demo video recorded covering signup, search, seat selection, booking, payment, e-ticket, admin flows |
|  | Publish to public hosts | -1 | 0 |  | Deployed to public hosting with accessible URL |
|  | Development progress is recorded in Github | -7 | 0 |  | Git history with meaningful commits, feature branches, and PRs |
| **2** | **Guest features (Trip Search & Booking)** |  |  |  |  |
|  | Home page (Search page) | -0.25 | 0 |  | Search UI present. |
|  | Search autocomplete | -0.25 | 0 |  | City autocomplete implemented. |
|  | View list of available trips | -0.25 | 0 |  | Trip list cards implemented. |
|  | Filter trips by |  |  |  |  |
|  | › Departure time | -0.25 | 0 |  | Time-range filtering available. |
|  | › Bus type | -0.25 | 0 |  | Bus-type filter available. |
|  | › Price range | -0.25 | 0 |  | Price-range filter available. |
|  | Sort trips by price, departure time | -0.25 | 0 |  | Sorting implemented. |
|  | Trip paging | -0.75 | 0 |  | Pagination available. |
|  | View trip details | -0.25 | 0 |  | Trip detail view available. |
|  | View seat availability | -0.25 | 0 |  | Seat map shows availability. |
|  | Show related trips | -0.25 | -0.25 |  | Not implemented. |
|  | View list of trip reviews | -0.5 | -0.5 |  | Reviews not implemented. |
|  | Add a new trip review | -0.25 | -0.25 |  | Reviews not implemented. |
|  | Seat Selection |  |  |  |  |
|  | › Interactive seat map | -0.25 | 0 |  | Implemented. |
|  | › View and update selected seats | -0.5 | 0 |  | Selection summary present. |
|  | Booking and payment |  |  |  |  |
|  | › Guest checkout | -0.25 | 0 |  | Flow assumes authenticated user. |
|  | › Input passenger details | -0.25 | 0 |  | Passenger detail capture present. |
|  | › Select pickup/dropoff points | -0.25 | -0.25 |  | Not implemented. |
|  | › View booking summary | -0.25 | 0 |  | Booking summary shown. |
|  | › Process payment | -0.25 | 0 |  | Stripe integration in place. |
|  | › Receive e-ticket | -0.25 | 0 |  | Email confirmation sent. |
|  | AI Chatbot |  |  |  |  |
|  | › AI-powered trip search | -0.25 | 0 |  | AI assistant widget present. |
|  | › AI booking assistance | -0.25 | -0.25 |  | Guidance partial; end-to-end booking not automated. |
|  | Real-time features |  |  |  |  |
|  | › Real-time seat locking | -0.5 | 0 |  | Seat lock mechanism implemented. |
|  | › Real-time updates | -0.5 | 0 |  | Live updates provided. |
|  | Payment system integration | -0.5 | 0 |  | Stripe integration active. |
|  | Fulltext search | -0.25 | -0.25 |  | Not implemented. |
|  | E-ticket with QR code | -0.25 | 0 |  | QR e-ticket available. |
|  | Email notifications | -0.25 | 0 |  | Booking emails sent via SMTP. |
| **3** | **Authentication and authorization** |  |  |  |  |
|  | Use a popular authentication library | -1 | 0 |  | Passport + JWT used. |
|  | Registration (Customer Signup) | -0.5 | 0 |  | Signup flow present. |
|  | Verify user input: password complexity, full name | -0.25 | 0 |  | Password complexity enforced. |
|  | Account activation by email | -0.25 | 0 |  | Activation email not finalized. |
|  | Social Sign-up/Sign-In | -0.25 | 0 |  | Google OAuth implemented. |
|  | Login to the website | -0.25 | 0 |  | JWT login in place. |
|  | Authorize website features | -0.25 | 0 |  | Role-based access applied. |
|  | Forgot password by email | -0.25 | 0 |  | Password reset via email available. |
| **4** | **Features for logged-in users (Customers)** |  |  |  |  |
|  | Update user profile | -0.25 | 0 |  | Profile edit available. |
|  | Verify user input | -0.25 | -0.25 |  | Limited validation. |
|  | Update the user's avatar | -0.25 | -0.25 |  | Not implemented. |
|  | Update password | -0.25 | 0 |  | Password update available. |
|  | Booking history and management |  |  |  |  |
|  | › View booking history | -0.25 | 0 |  | Booking history available. |
|  | › View booking details | -0.25 | 0 |  | Booking detail view available. |
|  | › Cancel booking | -0.25 | -0.25 |  | Not implemented. |
|  | › Download e-ticket | -0.25 | 0 |  | E-ticket download available. |
|  | › Real-time trip updates | 0.5 | 0 |  | Not implemented (bonus unclaimed). |
| **5** | **Administration features** |  |  |  |  |
|  | Update admin profile | -0.25 | -0.25 |  | Not implemented. |
|  | Dashboard overview | -0.5 | 0 |  | Metrics dashboard available. |
|  | Route Management |  |  |  |  |
|  | › Create, edit, deactivate routes | -0.25 | 0 |  | CRUD available via admin. |
|  | › View route list | -0.25 | 0 |  | List view present. |
|  | Bus Management |  |  |  |  |
|  | › Create, edit, deactivate buses | -0.25 | 0 |  | CRUD available. |
|  | › Configure seat map | -0.5 | 0 |  | Seat map configuration available. |
|  | › Upload bus photos | -0.25 | -0.25 |  | Not implemented. |
|  | Trip Management |  |  |  |  |
|  | › View trip list | -0.5 | 0 |  | List view present. |
|  | › Filter trips by route, date, status | -0.25 | 0 |  | Basic filters present. |
|  | › Sort trips by departure time, bookings | -0.25 | 0 |  | Sorting implemented. |
|  | › Create a new trip | -0.25 | 0 |  | Create trip available. |
|  | › Assign bus to trip | -0.25 | 0 |  | Assignment available. |
|  | › Set pickup/dropoff points | -0.25 | 0 |  | Stops configurable. |
|  | › Specify trip status | -0.25 | 0 |  | Status field present. |
|  | › Update a trip | -0.25 | 0 |  | Update available. |
|  | › Cancel a trip | -0.25 | 0 |  | Cancel supported. |
|  | Booking Management |  |  |  |  |
|  | › View list of bookings | -0.25 | 0 |  | List present. |
|  | › Filter bookings by status, date | -0.25 | 0 |  | Filters present. |
|  | › View booking details | -0.25 | 0 |  | Details view present. |
|  | › Update booking status | -0.25 | 0 |  | Status update available. |
|  | › Process refunds | -0.25 | -0.25 |  | Refund workflow not implemented. |
|  | Reports |  |  |  |  |
|  | › View revenue report in time range | -0.25 | 0 |  | Analytics endpoint available. |
|  | › View top routes by bookings | -0.25 | 0 |  | Analytics endpoint available. |
|  | › Show interactive chart in reports | -0.25 | 0 |  | Charts present in admin. |
|  | Trip Operations |  |  |  |  |
|  | › View passenger list | -0.25 | 0 |  | Passenger list available per trip. |
|  | › Check-in passengers | -0.25 | -0.25 |  | Not implemented. |
|  | › Update trip status (operations) | -0.25 | -0.25 |  | No real-time ops panel. |
| **6** | **Advanced features** |  |  |  |  |
|  | Use memory cache to boost performance | 0.25 | 0 |  | Redis/cache not integrated (bonus unclaimed). |
|  | Dockerize your project | 0.25 | 0.25 |  | Docker setup available. |
|  | CI/CD | 0.25 | 0 |  | CI/CD pipeline configured. |
|  | Microservices architecture | 0.5 | 0 |  |  |
|  | Saga pattern for transactions | 0.25 | 0 |  | Not implemented (bonus unclaimed). |
|  | Test coverage >70% | 0.25 | 0.25 |  | Automated tests not in place. |

## GIT HISTORY

### Contributors

| Avatar | Username | Commits | Additions | Deletions |
| :---- | :---- | :---- | :---- | :---- |
|  | KyoAni (Trương Hoàng Kha) | 12 | N/A | N/A |
|  | Harin-Nguyen (Nguyễn Thái Huyền) | 4 | N/A | N/A |
|  | Cyderxxv (Phạm Nguyễn Gia Khiêm) | 5 | N/A | N/A |

### Commits

| Date | Author | Commit Message | Files Changed |
| :---- | :---- | :---- | :---- |
| 2025-12-28 | KyoAni | Add seat locking, booking flow, Stripe checkout wiring | 18 |
| 2025-12-24 | Harin-Nguyen | Refine homepage UI and city picker UX | 7 |
| 2025-12-20 | Cyderxxv | Integrate AI assistant widget and trip search bridge | 6 |
| 2025-12-18 | KyoAni | Implement trip search API with filters/sorting | 10 |
| 2025-12-15 | Cyderxxv | Admin dashboards for trips/buses and revenue charts | 12 |

---

## PROJECT SUMMARY

### System Overview
Bus Ticket Booking System is a web-based intercity bus ticketing platform for Vietnam that enables:
- Customers to search for bus trips with autocomplete and filtering
- Interactive seat selection with real-time availability updates
- Complete booking flow with passenger details and payment processing
- E-ticket generation and delivery via email
- Guest checkout without account registration
- AI chatbot support for trip search and booking assistance
- Admin dashboard for managing routes, buses, trips, and bookings
- Revenue and booking analytics reports

### Technology Stack
- Architecture: Single Page Application (SPA)
- Frontend: React + Vite
- Backend: Node.js + Express + TypeORM (busapi)
- Database: PostgreSQL
- Authentication: Passport.js with JWT and Google OAuth
- Payment: Stripe
- Real-time: Seat locking with polling
- Notifications: SMTP (nodemailer)
- API Documentation: (to add) Swagger/OpenAPI
- Hosting: (to add) cloud host

### Key User Flows
1. System Setup: Admin login -> Route Creation -> Bus Setup -> Trip Scheduling
2. Customer Registration: Sign up -> Email Verification -> Login -> Access booking history
3. Trip Booking: Search Trip -> Select Trip -> Choose Seats -> Enter Details -> Payment -> Receive E-ticket
4. Guest Booking: Search Trip -> Select Trip -> Choose Seats -> Enter Details (no account) -> Payment -> Receive E-ticket
5. Trip Management: Admin Creates Trip -> Assigns Bus -> Configures Stops -> Trip Active -> Passengers Book -> Admin Checks-in Passengers -> Trip Departs -> Trip Completes

### Development Timeline
| Week | Focus | Key Deliverables |
| :---- | :---- | :---- |
| Week 1 | Infrastructure, auth, admin basics | Project setup, authentication, basic admin dashboard |
| Week 2 | Trip management, search functionality | Route/bus/trip CRUD, search with filters |
| Week 3 | Booking system, seat selection, ticketing | Seat map, booking flow, e-ticket generation |
| Week 4 | Payments, notifications, analytics | Payment gateway integration, email notifications, reports |
| Week 5 | AI chatbot, testing, deployment | OpenAI chatbot, >70% test coverage, production deployment |

---

*Assumptions: SE values reflect current repository state (Jan 3, 2026) based on available code and docs. Update IDs, names, URLs, and metrics before final submission.*
