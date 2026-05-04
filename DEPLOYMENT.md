# Deployment Guide - Digital Library Management System

## Production Deployment

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4+ with required extensions
- MySQL 5.7+
- Node.js 14+ (for building frontend)
- SSL certificate (recommended)

## Option 1: Traditional Server Deployment

### 1. Server Setup

#### Install Required Software
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2 php php-mysql php-mbstring php-json mysql-server
sudo apt install nodejs npm

# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE digital_library;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON digital_library.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u library_user -p digital_library < database/schema.sql
mysql -u library_user -p digital_library < database/sample_data.sql
```

### 3. Backend Deployment

```bash
# Clone repository
cd /var/www/
git clone https://github.com/tesfayeaberasoft/web-based-digitallibrary.git
cd web-based-digitallibrary

# Set permissions
sudo chown -R www-data:www-data backend/
sudo chmod -R 755 backend/

# Create uploads directory
mkdir -p backend/uploads
sudo chown -R www-data:www-data backend/uploads
sudo chmod -R 775 backend/uploads

# Update configuration
nano backend/config/database.php
# Update with production credentials

nano backend/config/config.php
# Update JWT secret, API keys, and set APP_ENV to 'production'
```

#### Apache Virtual Host Configuration

Create `/etc/apache2/sites-available/digitallibrary.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    DocumentRoot /var/www/web-based-digitallibrary/backend
    
    <Directory /var/www/web-based-digitallibrary/backend>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Rewrite rules for API routing
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.php [QSA,L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/digitallibrary_error.log
    CustomLog ${APACHE_LOG_DIR}/digitallibrary_access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2ensite digitallibrary
sudo systemctl reload apache2
```

### 4. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to web server
sudo cp -r build/* /var/www/html/library/

# Or serve with Apache
sudo cp -r build /var/www/web-based-digitallibrary/frontend-build
```

#### Frontend Apache Configuration

Create `/etc/apache2/sites-available/digitallibrary-frontend.conf`:

```apache
<VirtualHost *:80>
    ServerName app.yourdomain.com
    
    DocumentRoot /var/www/web-based-digitallibrary/frontend-build
    
    <Directory /var/www/web-based-digitallibrary/frontend-build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/digitallibrary_frontend_error.log
    CustomLog ${APACHE_LOG_DIR}/digitallibrary_frontend_access.log combined
</VirtualHost>
```

### 5. SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com -d app.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Option 2: Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: digital_library
      MYSQL_USER: library_user
      MYSQL_PASSWORD: library_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/1-schema.sql
      - ./database/sample_data.sql:/docker-entrypoint-initdb.d/2-data.sql
    ports:
      - "3306:3306"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/var/www/html
    ports:
      - "8000:80"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_NAME: digital_library
      DB_USER: library_user
      DB_PASSWORD: library_password

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM php:8.0-apache

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Enable Apache modules
RUN a2enmod rewrite headers

# Copy application files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

EXPOSE 80
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:16 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Option 3: Cloud Platform Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create digitallibrary-api

# Add MySQL addon
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL

# Deploy
git push heroku main

# Run migrations
heroku run php backend/migrate.php
```

### AWS Deployment

1. **EC2 Instance**: Follow traditional server deployment
2. **RDS**: Use for MySQL database
3. **S3**: Store uploaded files
4. **CloudFront**: CDN for frontend
5. **Route 53**: DNS management

### DigitalOcean Deployment

1. Create Droplet (Ubuntu 20.04)
2. Follow traditional server deployment
3. Use Managed Database for MySQL
4. Configure firewall rules

## Post-Deployment Checklist

- [ ] Update all API keys and secrets
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure monitoring (e.g., New Relic, Datadog)
- [ ] Set up error logging
- [ ] Configure email service (SendGrid)
- [ ] Test payment gateway integration
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Test all user roles and permissions
- [ ] Verify file upload functionality
- [ ] Test notification system
- [ ] Configure cron jobs for scheduled tasks
- [ ] Set up CDN for static assets
- [ ] Optimize database indexes
- [ ] Enable caching (Redis/Memcached)
- [ ] Set up log rotation
- [ ] Configure rate limiting
- [ ] Test disaster recovery procedures

## Maintenance

### Database Backup

```bash
# Create backup
mysqldump -u library_user -p digital_library > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -u library_user -p digital_library < backup_20260505.sql
```

### Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/bin/mysqldump -u library_user -pPASSWORD digital_library > /backups/db_$(date +\%Y\%m\%d).sql
```

### Update Application

```bash
cd /var/www/web-based-digitallibrary
git pull origin main

# Update frontend
cd frontend
npm install
npm run build

# Restart services
sudo systemctl restart apache2
```

## Monitoring

### Log Files

```bash
# Apache logs
tail -f /var/log/apache2/digitallibrary_error.log
tail -f /var/log/apache2/digitallibrary_access.log

# MySQL logs
tail -f /var/log/mysql/error.log

# Application logs
tail -f backend/logs/app.log
```

### Performance Monitoring

- Set up application performance monitoring (APM)
- Monitor database query performance
- Track API response times
- Monitor server resources (CPU, RAM, Disk)

## Security Best Practices

1. Keep all software updated
2. Use strong passwords
3. Implement rate limiting
4. Regular security audits
5. Monitor for suspicious activity
6. Keep backups encrypted
7. Use environment variables for secrets
8. Implement CSRF protection
9. Sanitize all user inputs
10. Use prepared statements for database queries

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check database credentials
- Verify MySQL service is running
- Check firewall rules

**CORS Errors**
- Update CORS headers in backend/config/config.php
- Verify frontend URL is whitelisted

**File Upload Issues**
- Check directory permissions
- Verify upload size limits in php.ini
- Check available disk space

**API Not Responding**
- Check Apache/Nginx logs
- Verify PHP-FPM is running
- Check server resources

## Support

For deployment issues, refer to:
- GitHub Issues: https://github.com/tesfayeaberasoft/web-based-digitallibrary/issues
- Documentation: See SETUP.md and README.md