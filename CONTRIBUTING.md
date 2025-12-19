# Contributing to BestTutorEver

First off, thank you for considering contributing to BestTutorEver! 🎉

Following these guidelines helps communicate that you respect the time of the developers managing and developing this open-source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@besttutorever.com](mailto:conduct@besttutorever.com).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account
- Basic knowledge of TypeScript and React

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/novatutor.git
   cd novatutor
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/marlondridley/novatutor.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open http://localhost:9002**

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain which behavior you expected** to see instead
- **Explain why this enhancement would be useful**

### Your First Code Contribution

Unsure where to begin? You can start by looking through `good-first-issue` and `help-wanted` issues:

- **good-first-issue** - issues which should only require a few lines of code
- **help-wanted** - issues which should be a bit more involved

### Pull Requests

1. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clear, readable code
   - Follow our [Style Guidelines](#style-guidelines)
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   See [Commit Messages](#commit-messages) for guidelines

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

---

## 🎨 Style Guidelines

### TypeScript Style Guide

- Use **TypeScript** for all new files
- Prefer `interface` over `type` for object types
- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Add JSDoc comments for public functions

**Example:**
```typescript
/**
 * Generates a homework plan based on student input.
 * 
 * @param tasks - Array of homework tasks
 * @param studentName - Name of the student
 * @returns Structured homework plan with time estimates
 */
export async function createHomeworkPlan(
  tasks: Task[],
  studentName: string
): Promise<HomeworkPlan> {
  // Implementation
}
```

### React Component Style Guide

- Use **functional components** with hooks
- Prefer **named exports** over default exports
- Use **TypeScript interfaces** for props
- Extract complex logic into **custom hooks**
- Use **Tailwind CSS** for styling

**Example:**
```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800'
      )}
    >
      {children}
    </button>
  );
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `GameController.tsx`)
- **Utilities**: camelCase (e.g., `audioFeedback.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useBehaviorFlags.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ROUTES.ts`)

---

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```bash
feat(controller): add haptic feedback to buttons

- Added vibration API integration
- Implemented different patterns for different actions
- Falls back gracefully if not supported

Closes #123
```

```bash
fix(voice): resolve microphone permission issue on iOS

- Changed permission request timing
- Added user-friendly error messages
- Updated documentation

Fixes #456
```

---

## 🔄 Pull Request Process

1. **Ensure your code follows our style guidelines**
2. **Update the README.md** with details of changes if applicable
3. **Add tests** for new functionality
4. **Ensure all tests pass**: `npm test`
5. **Run linting**: `npm run lint`
6. **Check types**: `npm run typecheck`
7. **Update documentation** if you changed APIs
8. **Request review** from maintainers
9. **Address review comments** promptly
10. **Squash commits** before merging (if requested)

### PR Title Format

Use the same format as commit messages:

```
feat(game-controller): add keyboard navigation support
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes
```

---

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- GameController.test.tsx

# Run with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow Arrange-Act-Assert pattern

**Example:**
```typescript
describe('GameController', () => {
  it('should change subject when D-pad button is clicked', () => {
    // Arrange
    const onSubjectChange = vi.fn();
    render(<GameController onSubjectChange={onSubjectChange} />);
    
    // Act
    const mathButton = screen.getByLabelText('Select Math Subject');
    fireEvent.click(mathButton);
    
    // Assert
    expect(onSubjectChange).toHaveBeenCalledWith('math');
  });
});
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## 💬 Questions?

Feel free to ask questions by:
- Opening a [GitHub Discussion](https://github.com/marlondridley/novatutor/discussions)
- Joining our [Discord](https://discord.gg/besttutorever)
- Emailing [support@besttutorever.com](mailto:support@besttutorever.com)

---

Thank you for contributing to BestTutorEver! 🎉


