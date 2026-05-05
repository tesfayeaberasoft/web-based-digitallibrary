# 📚 Digital Library Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql)

A comprehensive, full-stack digital library management system with role-based access control, real-time tracking, and modern UI/UX.

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### ✅ Core Features (Fully Implemented)
- **User Management** - Registration, authentication, profile management with role-based access
- **Book Management** - Complete CRUD operations with ISBN, categories, and metadata
- **Search & Browse** - Advanced search with filters by title, author, ISBN, and category
- **Issue & Return** - Streamlined borrowing workflow with due date tracking
- **Availability Tracking** - Real-time book availability and copy management

### 🎯 Advanced Features
- **Reservation System** - Queue-based book reservations with notifications
- **Fine Management** - Automated fine calculation and payment tracking
- **Notifications** - Real-time alerts for due dates, overdues, and reservations
- **Role-Based Access Control** - Admin, Librarian, and User roles with specific permissions
- **Analytics Dashboard** - Comprehensive statistics and performance metrics
- **Reading History** - Track user reading progress and completed books
- **Achievements System** - Gamification with badges and reading goals
- **Multi-Library Support** - Manage multiple branches and inventory
- **Audit Logs** - Complete activity tracking for security and accountability

### 🎨 User Interface
- **Admin Dashboard** - System overview, user management, analytics, and settings
- **Librarian Panel** - Book operations, request handling, and inventory management
- **User Dashboard** - Personal reading stats, active loans, and achievements
- **Responsive Design** - Mobile-friendly interface matching provided mockups
- **Material-UI** - Modern, accessible components with custom theming

## 🖥️ Demo

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@digitallibrary.com | password |
| Librarian | sarah@library.com | password |
| User | john.doe@example.com | password |

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Material-UI v5** - Component library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Context** - State management
- **React Toastify** - Notifications

### Backend
- **PHP 7.4+** - Server-side language
- **RESTful API** - API architecture
- **JWT** - Authentication
- **PDO** - Database abstraction

### Database
- **MySQL 5.7+** - Relational database
- **20+ Tables** - Comprehensive schema
- **Foreign Keys** - Data integrity
- **Indexes** - Performance optimization

## 📦 Installation

### Prerequisites
- Node.js 14 or higher
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/tesfayeaberasoft/web-based-digitallibrary.git
cd web-based-digitallibrary

# 2. Setup Database
mysql -u root -p
CREATE DATABASE digital_library;
exit

mysql -u root -p digital_library < database/schema.sql
mysql -u root -p digital_library < database/sample_data.sql

# 3. Configure Backend
cd backend
# Edit config/database.php with your MySQL credentials

# 4. Start Backend Server
php -S localhost:8000 router.php

# 5. Setup Frontend (in new terminal)
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Detailed installation and configuration guide
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide for various platforms
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Comprehensive project overview

## 📁 Project Structure

```
web-based-digitallibrary/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── librarian/   # Librarian pages
│   │   │   ├── user/        # User pages
│   │   │   └── auth/        # Authentication
│   │   └── App.js
│   └── package.json
│
├── backend/                  # PHP API
│   ├── api/                 # API endpoints
│   ├── config/              # Configuration
│   ├── utils/               # Utilities
│   └── index.php
│
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   └── sample_data.sql      # Sample data
│
└── docs/                     # Documentation
```

## 🎯 Requirements Implemented

Based on **Digital Library Management System Requirements Specification V4**:

### A. Basic Features ✅
- ✅ User Management
- ✅ Book Management
- ✅ Search & Browse
- ✅ Issue & Return Books
- ✅ Availability Tracking

### B. Intermediate Features ✅
- ✅ Reservation System
- ✅ Fine Management
- ✅ Notifications
- ✅ Role-Based Access Control
- ✅ Reports & Analytics

### C. Advanced Features 🚧
- ⏳ Digital Content Support (Structure ready)
- ⏳ Recommendation System (Structure ready)
- ✅ Multi-Library Support
- ⏳ Barcode/QR Integration (Structure ready)
- ✅ Audit Logs
- ⏳ API Integration (Structure ready)

### D. Engagement Features 🚧
- ⏳ User Reviews & Ratings (Structure ready)
- ⏳ Book Preview (Structure ready)
- ✅ Reading Lists & Bookmarks
- ⏳ Social Sharing (Structure ready)
- ⏳ Text-to-Speech (Planned)
- ⏳ Multilingual Support (Planned)

### E. Strategy Features 🚧
- ⏳ PWA/Offline Mode (Planned)
- ⏳ Self-Check-In/Out (Structure ready)
- ⏳ Bulk Import (Planned)
- ⏳ Waitlist Priority (Structure ready)

### F. Payment Integration 🚧
- ⏳ Chapa Gateway (Structure ready)

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Input validation
- ✅ Audit logging

## 🚀 Deployment

The system can be deployed on:
- Traditional servers (Apache/Nginx)
- Docker containers
- Cloud platforms (AWS, Heroku, DigitalOcean)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Tesfaye Abera** - *Initial work* - [tesfayeaberasoft](https://github.com/tesfayeaberasoft)

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- React team for the amazing framework
- PHP community for robust backend support
- All contributors and testers

## 📞 Support

For support, email tesfayeaberasoft@example.com or open an issue on GitHub.

---

<div align="center">

**[⬆ back to top](#-digital-library-management-system)**

Made with ❤️ by [Tesfaye Abera](https://github.com/tesfayeaberasoft)

</div>