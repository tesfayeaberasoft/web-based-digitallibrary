# Contributing to Digital Library Management System

First off, thank you for considering contributing to the Digital Library Management System! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to tesfayeaberasoft@example.com.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, browser, PHP version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- **Beginner issues** - issues labeled `good first issue`
- **Help wanted issues** - issues labeled `help wanted`

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes following our commit guidelines
6. Push to your fork
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 14+
- PHP 7.4+
- MySQL 5.7+
- Git

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/web-based-digitallibrary.git
cd web-based-digitallibrary

# 2. Setup database
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample_data.sql

# 3. Install frontend dependencies
cd frontend
npm install

# 4. Configure backend
# Edit backend/config/database.php with your credentials

# 5. Start development servers
# Terminal 1: Backend
cd backend
php -S localhost:8000

# Terminal 2: Frontend
cd frontend
npm start
```

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Follow Airbnb JavaScript Style Guide
- Use functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

**Example:**
```javascript
// Good
const UserCard = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card>
      <Typography>{user.name}</Typography>
    </Card>
  );
};

// Bad
const card = (u) => {
  const [x, setX] = useState(false);
  return <div>{u.n}</div>;
};
```

### PHP

- Follow PSR-12 coding standard
- Use meaningful variable names
- Add PHPDoc comments for functions
- Use prepared statements for database queries
- Handle errors appropriately

**Example:**
```php
// Good
/**
 * Get user by ID
 * @param int $userId
 * @return array|null
 */
function getUserById($userId) {
    $query = "SELECT * FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch();
}

// Bad
function get($id) {
    return $db->query("SELECT * FROM users WHERE id = $id");
}
```

### CSS/Styling

- Use Material-UI's `sx` prop for styling
- Follow the existing color scheme
- Ensure responsive design
- Use consistent spacing

### Database

- Use meaningful table and column names
- Add appropriate indexes
- Use foreign keys for relationships
- Document complex queries

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

Implement password reset feature with email verification.
Users can now request a password reset link via email.

Closes #123
```

```
fix(books): correct pagination on book list

Fixed an issue where pagination was not working correctly
when filtering books by category.

Fixes #456
```

```
docs(api): update API documentation for user endpoints

Added examples and clarified parameter descriptions
for all user-related API endpoints.
```

## Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**
   - Run the application locally
   - Test all affected features
   - Check for console errors
   - Verify responsive design

2. **Update documentation**
   - Update README if needed
   - Update API documentation for API changes
   - Add comments to complex code

3. **Follow coding standards**
   - Run linter: `npm run lint`
   - Fix any warnings or errors
   - Format code consistently

4. **Write good commit messages**
   - Follow commit guidelines
   - Reference related issues

### Submitting the Pull Request

1. **Create a descriptive title**
   ```
   feat: Add book recommendation system
   ```

2. **Fill out the PR template**
   - Describe your changes
   - Link related issues
   - Add screenshots if applicable
   - List any breaking changes

3. **Request review**
   - Tag relevant reviewers
   - Respond to feedback promptly
   - Make requested changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Testing

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (when implemented)
cd backend
php vendor/bin/phpunit
```

### Writing Tests

- Write tests for new features
- Update tests for modified features
- Ensure tests are meaningful
- Aim for good code coverage

## Documentation

### Code Documentation

- Add JSDoc comments for JavaScript functions
- Add PHPDoc comments for PHP functions
- Document complex algorithms
- Explain non-obvious code

### User Documentation

- Update README for new features
- Update SETUP.md for setup changes
- Update API_DOCUMENTATION.md for API changes
- Add examples where helpful

## Review Process

### What We Look For

1. **Code Quality**
   - Clean, readable code
   - Follows coding standards
   - No unnecessary complexity

2. **Functionality**
   - Works as intended
   - No bugs introduced
   - Edge cases handled

3. **Testing**
   - Adequate test coverage
   - Tests pass
   - Manual testing done

4. **Documentation**
   - Code is documented
   - User docs updated
   - API docs updated

### Review Timeline

- Initial review within 2-3 days
- Follow-up reviews within 1-2 days
- Merge after approval from maintainers

## Getting Help

### Resources

- **Documentation**: See docs/ folder
- **Issues**: Check existing issues
- **Discussions**: Use GitHub Discussions

### Contact

- **GitHub Issues**: For bugs and features
- **Email**: tesfayeaberasoft@example.com
- **Discussions**: For questions and ideas

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Digital Library Management System! 🎉