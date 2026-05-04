# API Documentation - Digital Library Management System

Base URL: `http://localhost:8000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1-555-1234",
  "address": "123 Main St, City, State"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please login.",
  "data": {
    "user_id": "USR001",
    "email": "john@example.com"
  }
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "user_id": "USR001",
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "status": "active",
      "profile_image": null
    }
  }
}
```

#### GET /auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user_id": 1,
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Users

#### GET /users
List all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or user ID
- `role` (optional): Filter by role (admin, librarian, user)
- `status` (optional): Filter by status (active, inactive, suspended)

**Example Request:**
```
GET /users?page=1&limit=10&search=john&role=user&status=active
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "user_id": "USR001",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-1234",
        "address": "123 Main St",
        "role": "user",
        "status": "active",
        "profile_image": null,
        "created_at": "2026-01-15 10:30:00",
        "last_login": "2026-05-05 08:15:00",
        "active_loans": 2,
        "unpaid_fines": 5.50
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

#### GET /users/:id
Get user details by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "user_id": "USR001",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-1234",
      "address": "123 Main St",
      "role": "user",
      "status": "active",
      "profile_image": null,
      "created_at": "2026-01-15 10:30:00",
      "statistics": {
        "books_borrowed": 47,
        "active_loans": 2,
        "total_fines": 15.50,
        "paid_fines": 10.00,
        "reading_streak": 12
      }
    }
  }
}
```

#### PUT /users/:id
Update user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "+1-555-9999",
  "address": "456 New St"
}
```

**Response:** `200 OK`

#### DELETE /users/:id
Delete user account (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`

---

### Books

#### GET /books
List all books.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title, author, or ISBN
- `category` (optional): Filter by category ID
- `status` (optional): Filter by status (active, inactive)
- `availability` (optional): Filter by availability (available, unavailable)

**Example Request:**
```
GET /books?page=1&limit=20&search=gatsby&category=1&availability=available
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "isbn": "978-0-7432-7356-5",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "publisher": "Scribner",
        "publication_year": 1925,
        "category_id": 1,
        "category_name": "Fiction",
        "category_color": "#9b59b6",
        "description": "A classic American novel",
        "cover_image": null,
        "total_copies": 5,
        "available_copies": 3,
        "pages": 180,
        "language": "English",
        "file_path": null,
        "file_type": "physical",
        "price": 15.99,
        "status": "active",
        "avg_rating": 4.5,
        "review_count": 128,
        "is_available": true,
        "created_at": "2026-01-01 00:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "pages": 12
    }
  }
}
```

#### GET /books/:id
Get book details by ID.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "book": {
      "id": 1,
      "isbn": "978-0-7432-7356-5",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A classic American novel",
      "total_copies": 5,
      "available_copies": 3,
      "avg_rating": 4.5,
      "reviews": [
        {
          "user_name": "John Doe",
          "rating": 5,
          "review_text": "Excellent book!",
          "created_at": "2026-04-01"
        }
      ]
    }
  }
}
```

#### POST /books
Add a new book (Librarian/Admin only).

**Headers:**
```
Authorization: Bearer <librarian_or_admin_token>
```

**Request Body:**
```json
{
  "isbn": "978-0-123-45678-9",
  "title": "New Book Title",
  "author": "Author Name",
  "publisher": "Publisher Name",
  "publication_year": 2026,
  "category_id": 1,
  "description": "Book description",
  "total_copies": 5,
  "pages": 300,
  "language": "English",
  "price": 19.99
}
```

**Response:** `201 Created`

#### PUT /books/:id
Update book information (Librarian/Admin only).

**Headers:**
```
Authorization: Bearer <librarian_or_admin_token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "available_copies": 4
}
```

**Response:** `200 OK`

#### DELETE /books/:id
Delete a book (Admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`

---

### Book Loans

#### GET /loans
List book loans.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `status` (optional): Filter by status (active, returned, overdue)
- `page`, `limit`: Pagination

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "loans": [
      {
        "id": 1,
        "user_id": 1,
        "user_name": "John Doe",
        "book_id": 1,
        "book_title": "The Great Gatsby",
        "loan_date": "2026-04-20",
        "due_date": "2026-05-20",
        "return_date": null,
        "status": "active",
        "fine_amount": 0,
        "days_remaining": 15
      }
    ]
  }
}
```

#### POST /loans
Issue a book to a user (Librarian/Admin only).

**Headers:**
```
Authorization: Bearer <librarian_or_admin_token>
```

**Request Body:**
```json
{
  "user_id": 1,
  "book_id": 1,
  "due_date": "2026-06-05"
}
```

**Response:** `201 Created`

#### PUT /loans/:id/return
Return a borrowed book (Librarian/Admin only).

**Headers:**
```
Authorization: Bearer <librarian_or_admin_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "fine_amount": 5.50,
    "days_overdue": 11
  }
}
```

---

### Reservations

#### GET /reservations
List book reservations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

#### POST /reservations
Reserve a book.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "book_id": 1
}
```

**Response:** `201 Created`

#### DELETE /reservations/:id
Cancel a reservation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Fines

#### GET /fines
List fines.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `status` (optional): Filter by status (pending, paid, waived)

**Response:** `200 OK`

#### POST /fines/:id/pay
Pay a fine.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 5.50,
  "payment_method": "card",
  "transaction_id": "TXN123456"
}
```

**Response:** `200 OK`

---

### Notifications

#### GET /notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "due_reminder",
        "title": "Book Due Soon",
        "message": "Your book is due in 3 days",
        "status": "unread",
        "created_at": "2026-05-02 10:00:00"
      }
    ],
    "unread_count": 3
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

### Categories

#### GET /categories
List all book categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Fiction",
        "description": "Fictional literature",
        "color_code": "#9b59b6",
        "book_count": 234
      }
    ]
  }
}
```

---

### Statistics & Analytics

#### GET /statistics/dashboard
Get dashboard statistics (Admin/Librarian).

**Headers:**
```
Authorization: Bearer <admin_or_librarian_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total_users": 5234,
    "total_books": 10234,
    "active_loans": 856,
    "revenue": 45678,
    "monthly_circulation": [...],
    "category_distribution": [...],
    "recent_activities": [...]
  }
}
```

---

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## Filtering & Searching

Most list endpoints support:
- `search`: Full-text search
- Various filters specific to the resource

## Best Practices

1. Always include the Authorization header for protected endpoints
2. Handle token expiration (401 errors) by refreshing or re-authenticating
3. Implement proper error handling for all API calls
4. Use pagination for large datasets
5. Cache responses when appropriate
6. Validate input data before sending requests

## Support

For API issues or questions:
- GitHub Issues: https://github.com/tesfayeaberasoft/web-based-digitallibrary/issues
- Email: support@digitallibrary.com