# Complete Settings System User Guide

## Overview
The Digital Library Management System now includes a comprehensive settings system that allows administrators to configure library policies, system behavior, and maintenance operations through a user-friendly interface.

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Navigate to backend directory
cd web-based-digitallibrary/backend

# Run the migration script to set up the settings system
php migrate-settings-system.php

# Start the backend server
php -S localhost:8000 router.php
```

### 2. Access Settings
1. Login as an administrator
2. Navigate to **Admin Dashboard** → **Settings**
3. Configure your library policies and system settings

## 📋 Settings Categories

### Library Information
Configure basic library details and policies:

- **Basic Information**: Name, description, address, contact details
- **Library Policies** (NEW):
  - Maximum books per user (default: 5)
  - Daily fine amount (default: $0.50)
  - Maximum loan period (default: 14 days)
- **Operating Hours**: Set hours for each day of the week
- **Social Media**: Configure social media links

### System Configuration
Control system behavior and features:

- **Loan Settings**: Borrow periods, renewal limits, grace periods
- **User Registration**: Enable/disable registration, email verification
- **Security**: Password policies, session timeouts
- **Features**: Auto-renewal, maintenance mode, notifications

### Notification Settings
Manage how the system communicates with users:

- **Channels**: Email, SMS, push notifications
- **Types**: Overdue reminders, reservation alerts, new book notifications
- **Templates**: Customize email templates for different events
- **Scheduling**: Set times for automated notifications

### Security Settings
Configure security and data protection:

- **Authentication**: Login attempts, lockout duration, password expiry
- **Data Protection**: Audit logging, data encryption
- **Backup**: Frequency and retention policies
- **API Security**: Rate limiting, CORS settings

### Appearance Settings
Customize the visual appearance:

- **Theme**: Light, dark, or auto mode
- **Colors**: Primary and secondary color schemes
- **Branding**: Logo, favicon, custom CSS
- **Layout**: Compact mode, animations

### Maintenance
Monitor system health and perform maintenance:

- **System Status**: Real-time monitoring of database, memory, storage, CPU
- **Maintenance Actions**: Backup, cache clearing, database optimization
- **System Information**: Version, uptime, performance metrics

## 🔧 Policy Enforcement

### Automatic Enforcement
The settings system automatically enforces policies throughout the library system:

#### Loan Creation
- **Borrow Limit Check**: Prevents users from exceeding maximum book limit
- **Loan Period Validation**: Ensures loan periods don't exceed maximum days
- **Policy Integration**: Real-time checking against current settings

#### Fine Calculation
- **Automatic Calculation**: Fines calculated based on policy settings
- **Grace Period**: Respects grace period before applying fines
- **Dynamic Updates**: Recalculates when policies change

#### User Management
- **Registration Control**: Enforces registration policies
- **Password Validation**: Validates passwords against policy requirements
- **Session Management**: Applies session timeout settings

### Manual Policy Checks
Use the policy validation APIs for custom integrations:

```javascript
// Check if user can borrow more books
const response = await axios.post('/api/loans/policy-check', {
  action: 'checkBorrowLimit',
  user_id: userId
});

// Calculate current fines for a user
const fines = await axios.post('/api/fines/calculate-overdue', {
  action: 'calculate_user',
  user_id: userId
});
```

## 🛠 API Reference

### Settings Management

#### Get All Settings
```http
GET /api/admin/settings
Authorization: Bearer {admin_token}
```

#### Update Settings
```http
POST /api/admin/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "category": "library_policies",
  "settings": {
    "max_user_borrow_books": 10,
    "due_fines_per_day": 1.00,
    "max_book_return_days": 21
  }
}
```

### Policy Validation

#### Check Borrow Limit
```http
POST /api/loans/policy-check
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "checkBorrowLimit",
  "user_id": 123
}
```

#### Calculate Fines
```http
POST /api/fines/calculate-overdue
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "calculate_user",
  "user_id": 123
}
```

### Maintenance Operations

#### System Status
```http
GET /api/admin/maintenance
Authorization: Bearer {admin_token}
```

#### Perform Maintenance
```http
POST /api/admin/maintenance
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "action": "backup"
}
```

## 📊 Monitoring and Analytics

### System Health Dashboard
The settings system includes a comprehensive dashboard showing:

- **Database Health**: Response time and connection status
- **Resource Usage**: Memory, CPU, and storage utilization
- **Policy Status**: Overdue books and fine calculations needed
- **System Activity**: Recent maintenance operations and user activity

### Performance Metrics
Monitor key performance indicators:

- Database query response times
- Memory and CPU usage trends
- Storage utilization
- User activity patterns
- Policy enforcement statistics

### Alerts and Notifications
Automatic alerts for:

- High resource usage (memory > 85%, storage > 90%)
- System errors or failures
- Overdue books requiring fine calculations
- Maintenance tasks completion

## 🔄 Maintenance Workflows

### Daily Operations
1. **System Health Check**: Monitor dashboard for any issues
2. **Fine Calculations**: Run overdue fine calculations
3. **Backup Verification**: Ensure automated backups are working
4. **Policy Review**: Check for any policy violations

### Weekly Tasks
1. **Database Optimization**: Run database optimization
2. **Cache Clearing**: Clear system caches if needed
3. **Log Review**: Check maintenance and error logs
4. **Performance Analysis**: Review system performance metrics

### Monthly Tasks
1. **Settings Review**: Review and update library policies
2. **Security Audit**: Check security settings and logs
3. **Backup Testing**: Test backup restoration procedures
4. **System Updates**: Plan and implement system updates

## 🧪 Testing and Validation

### Test Settings Integration
```bash
# Run the comprehensive test script
cd web-based-digitallibrary/backend
php test-settings-integration.php
```

### Manual Testing Checklist
- [ ] Settings load correctly in admin interface
- [ ] Settings save successfully to database
- [ ] Policy enforcement works in loan system
- [ ] Fine calculations use current policy settings
- [ ] Maintenance operations complete successfully
- [ ] System status displays accurate information

### Policy Testing
1. **Borrow Limits**: Try to exceed maximum books per user
2. **Loan Periods**: Request loan period longer than maximum
3. **Fine Calculations**: Verify fines calculated correctly
4. **Registration**: Test registration with various policy settings

## 🔐 Security Considerations

### Access Control
- Settings management requires admin role
- Policy validation respects user permissions
- Audit logging tracks all setting changes
- Secure API endpoints with JWT authentication

### Data Protection
- Sensitive settings encrypted in database
- Backup files secured with proper permissions
- API rate limiting prevents abuse
- Input validation prevents injection attacks

### Best Practices
1. **Regular Backups**: Ensure automated backups are working
2. **Access Monitoring**: Monitor admin access to settings
3. **Change Tracking**: Review settings changelog regularly
4. **Security Updates**: Keep system updated with security patches

## 📈 Optimization Tips

### Performance
1. **Database Indexing**: Ensure proper indexes on settings tables
2. **Caching**: Use appropriate caching for frequently accessed settings
3. **Query Optimization**: Optimize policy validation queries
4. **Resource Monitoring**: Monitor and optimize resource usage

### User Experience
1. **Loading States**: Show loading indicators during operations
2. **Error Handling**: Provide clear error messages
3. **Validation**: Real-time validation of setting inputs
4. **Help Text**: Provide helpful descriptions for settings

### Scalability
1. **Database Design**: Efficient schema for large datasets
2. **API Design**: RESTful APIs for easy integration
3. **Modular Architecture**: Separate concerns for maintainability
4. **Configuration Management**: Environment-specific settings

## 🆘 Troubleshooting

### Common Issues

#### Settings Not Loading
1. Check database connection
2. Verify settings tables exist
3. Run migration script if needed
4. Check API endpoint accessibility

#### Policy Not Enforced
1. Verify settings are saved correctly
2. Check API integration in loan system
3. Review error logs for issues
4. Test policy validation endpoints

#### Maintenance Operations Failing
1. Check file permissions for backups
2. Verify database access for optimization
3. Review system resources availability
4. Check maintenance logs for errors

### Debug Mode
Enable debug logging by setting environment variables:
```bash
export DEBUG_MODE=true
export LOG_LEVEL=debug
```

### Support Resources
- Check system logs in `/backend/logs/`
- Review maintenance log in database
- Use test scripts for validation
- Monitor system status dashboard

## 🔮 Future Enhancements

### Planned Features
1. **Multi-library Support**: Settings per library branch
2. **Advanced Analytics**: Enhanced reporting and analytics
3. **Mobile Integration**: Mobile app settings synchronization
4. **Email Integration**: Direct email service integration
5. **Advanced Notifications**: SMS and push notification services

### Integration Opportunities
1. **External Systems**: Integration with library management systems
2. **Payment Gateways**: Online fine payment integration
3. **Identity Providers**: SSO and LDAP integration
4. **Reporting Tools**: Business intelligence integration

## 📞 Support

For technical support or questions about the settings system:

1. **Documentation**: Review this guide and API documentation
2. **Testing**: Use provided test scripts for validation
3. **Logs**: Check system and maintenance logs
4. **Community**: Consult with development team

---

The settings system provides a robust foundation for library policy management and system administration. Regular monitoring and maintenance ensure optimal performance and user experience.