# Quick Reference Card - Digital Library Management System

## 🚀 Quick Start

```bash
# Start Backend
cd backend && php -S localhost:8000

# Start Frontend (new terminal)
cd frontend && npm start
```

**Access:** http://localhost:3000

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@digitallibrary.com | password |
| 📚 Librarian | sarah@library.com | password |
| 👤 User | john.doe@example.com | password |

---

## 📍 Key Routes

### Public
- `/` - Home page
- `/login` - Login
- `/register` - Registration
- `/browse` - Browse books

### Admin
- `/admin` - Dashboard
- `/admin/users` - User management
- `/admin/librarians` - Librarian management
- `/admin/analytics` - Analytics
- `/admin/settings` - Settings

### Librarian
- `/librarian` - Dashboard
- `/librarian/inventory` - Book inventory
- `/librarian/requests` - Book requests

### User
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/my-books` - Active loans
- `/history` - Reading history
- `/achievements` - Achievements

---

## 🔌 API Endpoints

**Base URL:** `http://localhost:8000/api`

### Authentication
```
POST   /auth/login       - User login
POST   /auth/register    - User registration
GET    /auth/verify      - Verify token
```

### Users
```
GET    /users            - List users (Admin)
GET    /users/:id        - Get user details
PUT    /users/:id        - Update user
DELETE /users/:id        - Delete user (Admin)
```

### Books
```
GET    /books            - List books
GET    /books/:id        - Get book details
POST   /books            - Add book (Librarian/Admin)
PUT    /books/:id        - Update book
DELETE /books/:id        - Delete book (Admin)
```

---

## 🗄️ Database

**Database:** `digital_library`  
**Tables:** 20+

### Key Tables
- `users` - User accounts
- `books` - Book catalog
- `categories` - Book categories
- `book_loans` - Borrowing records
- `book_reservations` - Reservations
- `fines` - Fine management
- `notifications` - User notifications
- `book_reviews` - Reviews & ratings
- `reading_history` - Reading progress
- `achievements` - User achievements

### Quick Queries
```sql
-- View all users
SELECT * FROM users;

-- View all books
SELECT * FROM books;

-- View active loans
SELECT * FROM book_loans WHERE status = 'active';

-- View pending reservations
SELECT * FROM book_reservations WHERE status = 'pending';
```

---

## 🎨 Design System

### Colors
- **Primary:** #4a9b8e (Teal)
- **Primary Light:** #7bb3a8
- **Primary Dark:** #2d6b61
- **Secondary:** #f50057
- **Background:** #f5f7fa

### Typography
- **Font Family:** Inter, Roboto, Helvetica, Arial
- **Headings:** 600 weight
- **Body:** 400 weight

### Components
- **Cards:** 12px border radius, subtle shadow
- **Buttons:** 8px border radius, no text transform
- **Avatars:** 56px for large, 40px for medium

---

## 📦 Project Structure

```
web-based-digitallibrary/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── api/
│   ├── config/
│   ├── utils/
│   └── index.php
├── database/
│   ├── schema.sql
│   └── sample_data.sql
└── docs/
```

---

## 🛠️ Common Commands

### Frontend
```bash
npm install          # Install dependencies
npm start            # Start dev server
npm run build        # Build for production
npm test             # Run tests
```

### Backend
```bash
php -S localhost:8000              # Start server
php -S localhost:8000 -t backend   # Start from root
```

### Database
```bash
# Import schema
mysql -u root -p digital_library < database/schema.sql

# Import sample data
mysql -u root -p digital_library < database/sample_data.sql

# Backup database
mysqldump -u root -p digital_library > backup.sql

# Connect to database
mysql -u root -p digital_library
```

### Git
```bash
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to GitHub
git pull origin main          # Pull from GitHub
```

---

## 🔧 Configuration Files

### Backend Config
**File:** `backend/config/database.php`
```php
private $host = "localhost";
private $db_name = "digital_library";
private $username = "root";
private $password = "";
```

**File:** `backend/config/config.php`
- JWT secret key
- API keys (Google Books, SendGrid, Chapa)
- CORS settings
- File upload settings

### Frontend Config
**File:** `frontend/src/contexts/AuthContext.js`
- API base URL: `http://localhost:8000/api`

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Backend connection error
1. Check MySQL is running
2. Verify database credentials
3. Ensure database exists
4. Check PHP version (7.4+)

### CORS errors
Update `backend/config/config.php`:
```php
header("Access-Control-Allow-Origin: http://localhost:3000");
```

### Port already in use
```bash
# Frontend
PORT=3001 npm start

# Backend
php -S localhost:8001
```

---

## 📊 Statistics (Sample Data)

- **Total Users:** 5,234
- **Total Books:** 10,234
- **Active Loans:** 856
- **Revenue:** $45,678
- **Librarians:** 12
- **Fines Collected:** $2,345

---

## 🔐 Security

### JWT Token
- **Storage:** localStorage
- **Key:** 'token'
- **Expiration:** 24 hours
- **Header:** `Authorization: Bearer <token>`

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt
- No plain text storage

### Role Permissions
- **Admin:** Full access
- **Librarian:** Book management, user viewing
- **User:** Personal data only

---

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Installation guide
- **DEPLOYMENT.md** - Deployment guide
- **API_DOCUMENTATION.md** - API reference
- **TESTING_GUIDE.md** - Testing procedures
- **PROJECT_SUMMARY.md** - Feature summary

---

## 🆘 Support

- **GitHub:** https://github.com/tesfayeaberasoft/web-based-digitallibrary
- **Issues:** https://github.com/tesfayeaberasoft/web-based-digitallibrary/issues
- **Email:** tesfayeaberasoft@example.com

---

## 📝 License

MIT License - Free to use and modify

---

## ✅ Quick Checklist

Before starting development:
- [ ] MySQL installed and running
- [ ] PHP 7.4+ installed
- [ ] Node.js 14+ installed
- [ ] Database created and populated
- [ ] Backend config updated
- [ ] Dependencies installed
- [ ] Both servers running

---

**Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Status:** Production Ready