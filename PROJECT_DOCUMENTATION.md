# Digital Library Management System — Formal Engineering Specification

## 1. Document Control

- Project name: Digital Library Management System
- Type: Full-stack web application
- Primary technologies: React, PHP, MySQL
- Repository root: web-based-digitallibrary
- Status: Functional prototype / internal demo system
- Authoring context: Development and onboarding documentation

---

## 2. Purpose

This specification defines the functional and technical requirements for the Digital Library Management System (DLMS). The system is intended to support library operations across public browsing, member account management, staff workflows, administration, analytics, and digital content access.

The system is designed for local deployment using a React frontend, PHP API, and MySQL database. The present implementation is suitable for educational use, demo deployment, and internal operational workflows, but it does not yet represent a hardened production-grade platform.

---

## 3. Business Objective

The system shall provide a digital solution for managing a library's core operations, including catalog administration, member access, loan lifecycle processing, reservations, fines, digital reading, notifications, and role-based administration. It should reduce manual record-keeping while supporting transparent operations for both staff and members.

---

## 4. Scope

### 4.1 In Scope
- User authentication and authorization
- Role-based access for user, librarian, admin, and super-admin
- Book catalog management and metadata
- Inventory and availability management
- Loan and return workflows
- Reservation queue management
- Fines and payment tracking
- Notifications and messaging
- Digital reading for PDF/EPUB materials
- Member analytics and admin reporting

### 4.2 Out of Scope
- SaaS multi-tenant architecture
- Real-time websocket-based collaboration
- Enterprise DRM for digital content
- Container orchestration or cloud deployment automation
- Automated end-to-end test suite at initial release
- Large-scale search and index services

---

## 5. Users and Roles

### 5.1 User Roles

| Role | Description | Typical Access |
|------|-------------|----------------|
| user | Library member | Browse books, read digital books, manage loans, favorites, profile, fines |
| librarian | Library staff | Inventory, loans, reservations, member management, reports |
| admin | Institutional admin | User management, settings, analytics, financial reports |
| super-admin | Root system owner | Full system oversight, security, audit controls |

### 5.2 Role Rules
- Each authenticated user shall have exactly one active role.
- Role shall be validated on both the UI and API layers.
- Access to protected routes and endpoints shall be checked against the user role.
- Admin and super-admin roles shall have elevated permissions beyond standard user and librarian roles.

---

## 6. System Context

### 6.1 Runtime Components

| Layer | Technology | Responsibility |
|------|------------|----------------|
| Presentation | React + MUI | User interfaces, routing, dashboards, forms |
| API | PHP | Request handling, validation, business logic, DB access |
| Data | MySQL | Schema persistence and relational data integrity |

### 6.2 Runtime Topology

```text
Browser -> React UI (localhost:3000)
          -> PHP API (localhost:8000)
          -> MySQL database (digital_library)
```

---

## 7. Functional Requirements

## 7.1 Authentication and Session Management

### FR-01: Registration
The system shall allow a new user to register with name, email, password, and additional profile details as required by the UI.

Acceptance criteria:
- A valid registration request shall create a user row in users.
- Duplicate email shall be rejected.
- Password hashing shall be applied before persistence.
- Successful registration shall return a success response and instruct the user to log in.

### FR-02: Login
The system shall authenticate a user using email and password and issue an auth token.

Acceptance criteria:
- A valid credential pair shall return a JWT or equivalent auth token.
- Invalid credentials shall return an error response without exposing internal details.
- Failed attempts shall result in a structured response with lockout metadata if applicable.

### FR-03: Token Verification
The system shall validate stored tokens on application reload.

Acceptance criteria:
- A valid stored token shall restore the current authenticated user state.
- An invalid token shall clear local auth state and force re-login.

### FR-04: Logout
The system shall allow a user to terminate the active session.

Acceptance criteria:
- Logout shall clear local token and user data.
- The frontend shall redirect to the login or home state after logout.

### FR-05: Google Sign-In
The system shall support Google OAuth-based login for eligible users.

Acceptance criteria:
- A valid Google credential shall be accepted and mapped to a user account if configured.
- The resulting user record shall include the normalized role and auth state.
- Login response shall contain both token and user metadata.

---

## 7.2 User and Profile Management

### FR-06: User Profile Retrieval
The system shall provide users with access to their profile information.

Acceptance criteria:
- GET /api/users/{id} shall return the requested profile for an authorized user.
- Unauthorized users shall receive a forbidden-style rejection.

### FR-07: User Update
The system shall allow authorized users to update profile details.

Acceptance criteria:
- Valid updates shall persist changes to users.
- Fields outside the allowed set shall be rejected.
- Updated profile values shall be reflected in the UI after successful save.

### FR-08: User Suspension
Admin users shall be able to suspend or reactivate library accounts.

Acceptance criteria:
- Suspended accounts shall not be allowed access to protected workflows.
- Account status change shall be persisted in the database.
- The action shall be auditable in related logs or admin views.

### FR-09: Profile Image Upload
Users shall be able to upload and store profile images.

Acceptance criteria:
- A valid image upload shall persist a file reference in the user record.
- Unsupported file types shall be rejected.
- The frontend shall render the updated profile image when present.

---

## 7.3 Catalog and Inventory Management

### FR-10: Browse Books
The system shall allow users and staff to view available books by category, title, author, ISBN, or search text.

Acceptance criteria:
- The books listing endpoint shall return a collection of book records.
- Search and filter parameters shall operate correctly.
- Book data shall include title, author, category, status, and availability.

### FR-11: Manage Book Metadata
Librarians and admins shall be able to create and update book records.

Acceptance criteria:
- A valid book record shall be inserted or updated in books.
- ISBN field shall remain unique.
- The UI shall reflect the new metadata immediately after save.

### FR-12: Availability Tracking
The system shall track total copies and available copies for each book.

Acceptance criteria:
- Available quantity shall decrease when a book is issued.
- Available quantity shall increase when a book is returned.
- Inventory mismatch shall be prevented by business logic and validation.

### FR-13: Digital Book Metadata
The system shall support digital-book attributes and file association fields.

Acceptance criteria:
- Each digital book shall record file path and file type.
- File type shall be limited to supported values such as pdf, epub, or physical.
- Metadata shall be stored in the book record without exposing storage paths to the browser.

---

## 7.4 Loan Lifecycle

### FR-14: Book Issuance
Librarians shall be able to issue a book to a user with a due date.

Acceptance criteria:
- A valid issue action shall create a row in book_loans.
- The issue action shall require a valid user and book.
- Available copies shall be decremented only when issue succeeds.

### FR-15: Return Processing
The system shall allow book returns to be processed.

Acceptance criteria:
- Returning a loan shall update return_date and status.
- The book shall become available again if eligible.
- Return processing shall be associated with the returning librarian when available.

### FR-16: Renewal
Users or staff shall be able to renew an active loan when permitted.

Acceptance criteria:
- Renewal shall update due date and increment renewal_count.
- Renewal shall be rejected if the loan is not eligible for renewal.
- Renewal action shall be recorded in the loan history.

### FR-17: Overdue Detection
The system shall identify books that are overdue.

Acceptance criteria:
- Any active loan past due date shall be reported as overdue.
- Overdue status shall be visible in user and staff dashboards.
- Fine generation shall be based on overdue conditions.

---

## 7.5 Reservations and Queueing

### FR-18: Reserve Book
A user shall be able to reserve a book that is currently unavailable.

Acceptance criteria:
- Reservation shall create a book_reservations record.
- Reservation shall include queue position and expiry details.
- pending shall be set as the initial status for valid requests.

### FR-19: Reservation Fulfillment
When a reserved book becomes available, the system shall notify the user and update the reservation.

Acceptance criteria:
- The reservation status shall move to available or fulfilled based on workflow state.
- Notification status shall be tracked by notification_sent.
- Only the appropriate reservation holder shall be notified.

### FR-20: Reservation Expiry
Expired reservations shall be handled per defined business rules.

Acceptance criteria:
- An expired reservation shall be marked expired or excluded from active queue handling.
- Expired items shall no longer reserve priority for the user.

---

## 7.6 Fines and Payments

### FR-21: Fine Creation
The system shall generate fines for overdue loans or other chargeable library conditions.

Acceptance criteria:
- Fine creation shall insert a valid row in fines.
- Fine amount shall be non-negative and derived from the business rules.
- Fine type shall be one of the supported enum values.

### FR-22: Fine Payment
Users shall be able to view and settle fines.

Acceptance criteria:
- Payment action shall update paid_amount and status.
- Successful payment shall store transaction metadata if provided.
- User balances shall reflect the updated fine state.

### FR-23: Payment Return Page
The system shall support a return flow after a payment process.

Acceptance criteria:
- A successful payment flow shall redirect to the configured return page.
- Payment outcome shall be represented in the UI and user records.

---

## 7.7 Messaging and Support

### FR-24: Send Message
Authenticated users shall be able to send a message to an allowed contact.

Acceptance criteria:
- A message shall create a record in messages with valid sender and receiver.
- Sender and receiver roles shall be validated against the allowed communication model.
- Message content shall be limited to the supported length and format.

### FR-25: Read Conversation
The system shall expose message threads to the relevant parties.

Acceptance criteria:
- A valid conversation request shall return messages between the current user and the selected peer.
- Unauthorized participants shall not access the thread.
- A cap on thread size shall be enforced.

### FR-26: Mark Message as Read
The recipient shall be able to mark the message as read.

Acceptance criteria:
- Read state shall update to read for the receiver only.
- Message visibility in unread counts shall update immediately.

---

## 7.8 Notifications

### FR-27: Notify on Due Date
The system shall issue a reminder notification before a due date expires.

Acceptance criteria:
- A due-reminder notification shall be created for eligible users.
- The notification shall reference the relevant loan or user event.

### FR-28: Notify on Overdue and Reservation Changes
The system shall notify users and staff for overdue and reservation-related updates.

Acceptance criteria:
- Notification rows shall be created with a valid type and payload.
- Notification status shall be tracked from unread to read.

---

## 7.9 Reading Notes and Favorites

### FR-29: Save Reading Notes
Authenticated users shall be able to save notes for books.

Acceptance criteria:
- Valid note payloads shall persist to the notes table.
- One note per user-book combination shall be stored or updated correctly.
- Notes shall render in the reading experience without data loss.

### FR-30: Favorite Books
Users shall be able to save or remove books from a favorites list.

Acceptance criteria:
- Favorite add/remove operations shall mirror a valid user and book record.
- The favorites endpoint shall list only the current user's saved books.

---

## 7.10 Admin and Analytics

### FR-31: Dashboard Metrics
The system shall provide summary metrics for administrators and librarians.

Acceptance criteria:
- Dashboard endpoints shall return aggregate values for user counts, loans, books, fines, and other relevant metrics.
- Data shall be filtered appropriately for the requesting role.

### FR-32: Reports
The system shall support reporting for librarians and admins.

Acceptance criteria:
- Reports shall contain relevant operational summaries and exported data.
- Reports shall include role-specific restrictions and data availability checks.

### FR-33: Maintenance and Settings
Admins shall be able to manage application settings and maintenance states.

Acceptance criteria:
- Settings update endpoints shall persist valid configuration values.
- Maintenance mode values shall be reflected in the application behavior.

---

## 8. Non-Functional Requirements

### NFR-01: Usability
The system shall provide accessible, role-aware interfaces for members and staff.

### NFR-02: Reliability
Core workflows shall handle invalid input and failed DB operations without exposing stack traces to end users.

### NFR-03: Security
The system shall validate auth tokens, enforce role checks, and prevent unauthorized data access.

### NFR-04: Maintainability
The codebase shall keep domain logic separated by feature area and route type.

### NFR-05: Scalability
The current architecture is suited for a local or mid-sized deployment, not a large enterprise SaaS load.

### NFR-06: Performance
Core listing and search actions shall return results within acceptable local-dev latency and support basic paging or limit behavior.

---

## 9. Data Requirements

### 9.1 Core Tables

| Table | Purpose |
|------|---------|
| users | Members and staff matrix |
| categories | Classification taxonomy |
| books | Catalog and availability |
| book_loans | Borrowing lifecycle |
| book_reservations | Waitlist logic |
| fines | Charge tracking |
| notifications | User and system alerts |
| messages | Staff and member communication |
| notes | Reading notes |

### 9.2 Data Integrity Rules
- users.email shall be unique.
- books.isbn shall be unique.
- book_loans shall reference valid users and books records.
- messages shall enforce sender and receiver relationships consistent with the communication model.
- notifications and fines shall be traceable back to a user or supported business event.

---

## 10. API Requirements

### 10.1 Interface Pattern
- All API requests shall be routed through a PHP entry point.
- Request path matching shall use HTTP method and path-based routing.
- JSON responses shall be returned for success and error states.

### 10.2 Authentication Contract
- Authenticated endpoints shall require an Authorization header.
- Tokens shall be validated before sensitive CRUD operations execute.

### 10.3 Error Handling Contract
Errors shall include a success flag and a clear message. Additional structured details shall be used when validation or domain errors require them.

---

## 11. UI Requirements

### 11.1 General
- All pages shall use a consistent theme and layout structure.
- Protected pages shall redirect unauthenticated users appropriately.
- Role-specific routes shall prevent unauthorized role access.

### 11.2 Dashboard Behavior
- User and staff dashboards shall present relevant summaries and quick actions.
- Unauthorized actions shall be hidden or disabled when role access does not permit them.

### 11.3 Responsive Experience
- Primary views shall remain usable on common desktop and tablet layouts.

---

## 12. Acceptance Criteria Summary by Epic

### Epic A: Authentication and identity
- User can register, log in, and log out.
- UI state is restored correctly after page refresh.
- Invalid token flow clears active auth state.

### Epic B: Book management
- Staff can create, update, and view book records.
- Inventory counts reflect issuance and return flows.
- Books can be browsed with search and category filters.

### Epic C: Loan and return workflow
- Loan issuance creates a record with valid due date.
- Return updates availability and loan state.
- Overdue and fine states are visible to users and staff.

### Epic D: Reservation workflow
- Reserved books can be queued and monitored.
- Available reservations trigger notifications.
- Expired or fulfilled reservations are correctly transitioned.

### Epic E: Messaging and notifications
- Users can exchange messages with authorized contacts.
- Unread and read state are persisted accurately.
- Reminder and alert notifications are generated for relevant events.

### Epic F: Digital reading
- Valid PDF/EPUB titles can be read through the application interface.
- File access is restricted through the backend rather than direct public URL exposure.

### Epic G: Administration and analytics
- Admin and librarian dashboards expose operational metrics.
- Settings and maintenance modes can be updated by authorized users.

---

## 13. Risks and Constraints

### Risks
- Localhost-based deployment creates environment coupling.
- Authentication is stored in browser localStorage rather than a secure session pattern.
- File access protections are app-level and not enterprise-grade DRM.
- Manual route logic can be error-prone and difficult to scale.

### Constraints
- The system is built for local development and demo operations.
- MySQL is required as the persistence backend.
- PHP built-in server is expected during development.
- Production hardening is not yet fully implemented.

---

## 14. Definition of Done

The feature set shall be considered complete when:
- all acceptance criteria for the relevant requirement are met;
- the code performs the expected behavior in local development;
- UI and API behavior are consistent for the changed feature;
- role-based access is enforced for authorized and unauthorized paths;
- relevant database changes are documented or reflected in migration scripts.

---

## 15. Summary

This specification formalizes the expected behavior of the Digital Library Management System as a local full-stack application for library operations. It defines the functional scope, system roles, data model, API expectations, UI constraints, and acceptance criteria needed for implementation and validation. The current codebase aligns with this structure in broad terms, but production hardening and architecture maturity remain future work items.
