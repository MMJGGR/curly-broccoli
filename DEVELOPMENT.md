# Development Guide - Personal Finance App

## 🚀 Quick Start

```bash
# Start the development environment
docker-compose up -d

# Access services
Frontend: http://localhost:3000
Backend: http://localhost:8000
Database: localhost:5432
```

## 🔧 Code Quality & Prevention of Errors

### Frontend Development

```bash
# Before committing code, always run:
cd frontend

# 1. Fix linting issues automatically
npm run lint:fix

# 2. Check for any remaining issues (MUST pass)
npm run lint:strict

# 3. Format code
npm run format

# 4. Run all validations (lint + format + tests)
npm run validate
```

### Backend Development

```bash
cd api

# 1. Format Python code
black .

# 2. Check linting
flake8 .

# 3. Run tests
pytest --cov=. --cov-report=term-missing
```

## 🛡️ Error Prevention Strategy

### 1. **Pre-Commit Hooks** (Recommended)

Install pre-commit to automatically check code before commits:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Now every commit will automatically run:
# - ESLint (with --max-warnings 0)
# - Prettier formatting check
# - Python Black formatting
# - Python Flake8 linting
# - Basic file checks
```

### 2. **IDE Configuration**

#### VS Code Settings (`.vscode/settings.json`)
```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript", "javascriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "python.linting.flake8Enabled": true,
  "python.linting.enabled": true
}
```

### 3. **Available Scripts**

| Command | Purpose | Fail Level |
|---------|---------|------------|
| `npm run lint` | Check for issues | Errors only |
| `npm run lint:strict` | **Zero tolerance** | Errors + Warnings |
| `npm run lint:fix` | Auto-fix issues | - |
| `npm run validate` | Full validation | Strict |

### 4. **CI/CD Pipeline**

The GitHub Actions workflow (`/.github/workflows/ci.yml`) runs:

✅ **Frontend Checks:**
- ESLint with `--max-warnings 0` (STRICT)
- Prettier formatting verification
- Unit tests with coverage
- Build verification

✅ **Backend Checks:**  
- Black formatting verification
- Flake8 linting
- Pytest with coverage requirements
- Build verification

✅ **E2E Testing:**
- Full Docker stack deployment
- Cypress tests execution
- API health checks

### 5. **Branch Protection**

Ensure these branch protection rules are enabled on `main`:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging  
- ✅ Require review from code owners
- ✅ Restrict pushes to matching branches

## 🚨 Common Error Types & Solutions

### ESLint Errors

```bash
# Error: 'variable' is assigned a value but never used
# Solution: Remove unused imports/variables or prefix with underscore
const { unusedVar, ...rest } = props; // ❌ 
const { _unusedVar, ...rest } = props; // ✅

# Auto-fix many issues:
npm run lint:fix
```

### Import/Export Issues

```bash
# Error: Unable to resolve path to module
# Solution: Check file paths and extensions
import Component from './Component';     // ✅
import Component from './component.js';  // ❌ (case sensitive)
```

### Type/PropTypes Issues

```bash
# Add proper PropTypes or TypeScript
npm install prop-types
```

## 🔄 Development Workflow

### Making Changes

1. **Create feature branch**
```bash
git checkout -b feature/authentication-fix
```

2. **Develop with quality checks**
```bash
# Make changes
# Run validation frequently
npm run validate

# Fix any issues
npm run lint:fix
npm run format
```

3. **Before committing**
```bash
# Final validation
npm run validate

# If using pre-commit hooks, they'll run automatically
git add .
git commit -m "feat: improve authentication flow"
```

4. **Push and create PR**
```bash
git push origin feature/authentication-fix
# Create PR - CI will run all checks
```

### Handling CI Failures

If CI fails:

1. **Check the specific failure in GitHub Actions**
2. **Run the same command locally:**
```bash
# Frontend linting failure
cd frontend && npm run lint:strict

# Backend linting failure  
cd api && flake8 .

# Test failure
npm test
pytest
```

3. **Fix and re-commit**

## 📊 Coverage Requirements

- **Frontend**: Maintain >80% test coverage
- **Backend**: Maintain >90% test coverage
- **E2E**: Critical user flows must pass

## 🎯 Quality Gates

**Before any release:**

1. ✅ All CI checks pass
2. ✅ No ESLint warnings (`--max-warnings 0`)
3. ✅ All tests pass
4. ✅ Coverage requirements met
5. ✅ E2E tests pass
6. ✅ Manual smoke testing completed

This ensures we **never ship with preventable errors** like the ESLint warning we just fixed! 🚀