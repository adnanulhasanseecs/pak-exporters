# Contributing Guidelines

## Welcome!

Thank you for considering contributing to Pak-Exporters B2B Marketplace! This document provides guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/pak-exporters.git
cd pak-exporters
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes

Follow the coding standards and best practices outlined below.

### 5. Test Your Changes

```bash
npm test
npm run lint
npm run build
```

### 6. Commit Your Changes

Follow conventional commit messages:

```
feat: add new product filter
fix: resolve mobile menu issue
docs: update API documentation
style: format code with prettier
refactor: improve component structure
test: add tests for product form
chore: update dependencies
```

### 7. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types
- Use interfaces for object shapes
- Use enums for constants

### React

- Use functional components and hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Styling

- Use TailwindCSS utility classes
- Follow mobile-first approach
- Use shadcn/ui components when possible
- Maintain consistent spacing and colors

### File Structure

```
components/
  ui/           # Base UI components
  layout/       # Layout components
  cards/        # Card components
  forms/        # Form components
```

### Naming Conventions

- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types/Interfaces: PascalCase (`Product`, `UserData`)

---

## Testing

### Unit Tests

- Write tests for all utilities
- Test component rendering
- Test user interactions
- Aim for 80%+ coverage

### Integration Tests

- Test complete user flows
- Test API integrations
- Test form submissions

### E2E Tests

- Test critical user journeys
- Test cross-browser compatibility
- Test mobile responsiveness

---

## Documentation

### Code Comments

- Document complex logic
- Explain "why" not "what"
- Use JSDoc for functions

### README Updates

- Update README for new features
- Document new environment variables
- Update setup instructions if needed

---

## Pull Request Process

1. **Update Documentation** - Update docs if needed
2. **Add Tests** - Add tests for new features
3. **Ensure Tests Pass** - All tests must pass
4. **Update CHANGELOG** - Document your changes
5. **Request Review** - Request review from maintainers

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings
- [ ] Build succeeds

---

## Issue Reporting

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

### Feature Requests

Include:
- Clear description
- Use case
- Proposed solution
- Alternatives considered

---

## Development Workflow

1. Create issue or pick existing issue
2. Fork repository
3. Create feature branch
4. Make changes
5. Write tests
6. Update documentation
7. Submit pull request
8. Address review feedback
9. Merge when approved

---

## Questions?

Feel free to:
- Open an issue for questions
- Contact maintainers
- Check existing documentation

---

**Thank you for contributing!** 🎉

