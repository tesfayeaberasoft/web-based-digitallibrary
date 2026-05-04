# Digital Library Management System - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- MySQL (v5.7 or higher)
- Composer (for PHP dependencies)

## Installation Steps

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE digital_library;
```

2. Import the database schema:
```bash
mysql -u root -p digital_library < database/schema.sql
```

3. Import sample data (optional):
```bash
mysql -u root -p digital_library < database/sample_data.sql
```

4. Update database credentials in `backend/config/database.php`:
```php
private $host = "localhost";
private $db_name = "digital_library";
private $username = "root";
private $password = "your_password";
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Start the PHP development server:
```bash
php -S localhost:8000
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Default Login Credentials

### Admin Account
- Email: admin@digitallibrary.com
- Password: password

### Librarian Account
- Email: sarah@library.com
- Password: password

### User Account
- Email: john.doe@example.com
- Password: password

## Features Implemented

### Core Features ✅
- User Management (Registration, Login, Profile)
- Book Management (Add, Update, Delete, View)
- Search & Browse functionality
- Issue & Return Books workflow
- Real-time availability tracking

### Admin Dashboard ✅
- Overview with statistics
- User management
- Librarian management
- Analytics and reports
- System settings

### Librarian Dashboard ✅
- Book inventory management
- Request handling
- Member management
- Quick actions for issue/return

### User Dashboard ✅
- Personal reading statistics
- Active loans and reservations
- Reading history
- Achievements and goals

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/verify` - Verify JWT token

### Users
- GET `/api/users` - List all users (Admin only)
- GET `/api/users/:id` - Get user details
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Books
- GET `/api/books` - List all books
- GET `/api/books/:id` - Get book details
- POST `/api/books` - Add new book (Librarian/Admin)
- PUT `/api/books/:id` - Update book
- DELETE `/api/books/:id` - Delete book

## Technology Stack

- **Frontend**: React.js, Material-UI, Axios, React Router
- **Backend**: PHP (RESTful API)
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Material-UI with custom theme

## Project Structure

```
web-based-digitallibrary/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── librarian/   # Librarian pages
│   │   │   ├── user/        # User pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── public/      # Public pages
│   │   │   └── shared/      # Shared pages
│   │   └── App.js           # Main app component
│   └── package.json
├── backend/                  # PHP backend
│   ├── api/                 # API endpoints
│   │   ├── auth/            # Authentication endpoints
│   │   ├── users/           # User endpoints
│   │   └── books/           # Book endpoints
│   ├── config/              # Configuration files
│   ├── models/              # Data models
│   ├── controllers/         # Business logic
│   ├── middleware/          # Middleware functions
│   ├── utils/               # Utility functions
│   └── index.php            # Main entry point
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   └── sample_data.sql      # Sample data
└── README.md

```

## Development

### Running Both Servers Concurrently

From the root directory:
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 8000) servers.

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend `config/config.php` has the correct frontend URL:
```php
header("Access-Control-Allow-Origin: http://localhost:3000");
```

### Database Connection Issues
1. Verify MySQL is running
2. Check database credentials in `backend/config/database.php`
3. Ensure the database exists and tables are created

### Port Already in Use
If port 3000 or 8000 is already in use:
- Frontend: Set a different port in package.json or use `PORT=3001 npm start`
- Backend: Use `php -S localhost:8001` for a different port

## Next Steps

1. Configure external API keys in `backend/config/config.php`:
   - Google Books API
   - SendGrid API
   - Chapa Payment Gateway

2. Implement additional features:
   - Email notifications
   - Payment integration
   - Digital book reader
   - Advanced analytics

3. Deploy to production:
   - Set up proper web server (Apache/Nginx)
   - Configure SSL certificates
   - Set environment variables
   - Enable production mode

## Support

For issues and questions, please refer to the documentation or contact the development team.

## License

MIT License - See LICENSE file for details