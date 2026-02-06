# Contributing to AutoDJ-Extreme

Thank you for considering contributing to AutoDJ-Extreme! This document provides guidelines for contributions.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

---

## 🤝 Code of Conduct

### Our Pledge

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Unprofessional conduct

---

## 🎯 How Can I Contribute?

### Reporting Bugs

Use our [Bug Report Template](https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues/new?template=bug_report.yml)

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Logs (if applicable)

### Suggesting Features

Use our [Feature Request Template](https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues/new?template=feature_request.yml)

Include:
- Problem statement
- Proposed solution
- Use cases
- Implementation ideas

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos or clarify instructions
- Add examples
- Improve organization
- Translate to other languages

### Code Contributions

1. Check existing issues
2. Discuss major changes first
3. Follow coding standards
4. Write tests
5. Update documentation

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Required
- Git
- Docker (for testing)
- Text editor (VS Code recommended)

# Optional
- Pterodactyl/Pelican Panel (for testing)
- Ubuntu/Debian system (for native testing)
```

### Clone Repository

```bash
git clone https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme.git
cd AutoDJ-Extreme
```

### Local Testing

```bash
# Build Docker image
cd docker
docker build -t autodj-extreme-test .

# Run locally
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/music:/home/container/music \
  autodj-extreme-test
```

### File Structure

```
AutoDJ-Extreme/
├── .github/           # GitHub templates & workflows
├── docs/             # Documentation
├── docker/           # Docker files
├── egg/              # Pterodactyl eggs
├── webui/            # Web interface
└── README.md         # Main readme
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Create an issue first** for major changes
2. **Fork the repository**
3. **Create a feature branch**: `git checkout -b feature/your-feature`
4. **Make your changes**
5. **Test thoroughly**
6. **Update documentation**
7. **Commit with clear messages**

### Commit Messages

Use conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(playlist): add weighted rotation algorithm

Implements intelligent playlist rotation based on play frequency
and user preferences.

Closes #123
```

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Dependent changes merged

### Review Process

1. **Automated checks** run on PR
2. **Maintainer review** (1-3 days)
3. **Feedback addressed**
4. **Approval and merge**

---

## 📝 Coding Standards

### Bash Scripts

```bash
#!/bin/bash
set -e  # Exit on error

# Use meaningful variable names
MUSIC_DIR="/home/container/music"

# Add comments for complex logic
# Calculate optimal buffer size based on bitrate
BUFFER_SIZE=$((BITRATE * 8))

# Use functions for reusability
log_info() {
    echo "[INFO] $1"
}

# Error handling
if [ ! -d "$MUSIC_DIR" ]; then
    log_error "Music directory not found"
    exit 1
fi
```

### JavaScript

```javascript
// Use ES6+ features
const player = {
    volume: 0.7,
    isPlaying: false,
    
    // Clear method names
    togglePlay() {
        this.isPlaying = !this.isPlaying;
    },
    
    // Handle errors
    async loadStream() {
        try {
            await this.audio.play();
        } catch (error) {
            console.error('Playback failed:', error);
            this.showError('Unable to play stream');
        }
    }
};
```

### CSS

```css
/* Use meaningful class names */
.player-controls {
    display: flex;
    gap: 1rem;
}

/* CSS custom properties for theming */
:root {
    --primary-color: #6366f1;
    --spacing-unit: 1rem;
}

/* BEM naming for components */
.button--primary {
    background: var(--primary-color);
}
```

### Documentation (Markdown)

```markdown
# Clear Heading Hierarchy

## Use H2 for major sections

### H3 for subsections

- Bullet points for lists
- Clear and concise language

**Bold** for emphasis
`code` for inline code

\`\`\`bash
# Code blocks with language
command here
\`\`\`
```

---

## ✅ Testing Guidelines

### Manual Testing

**For Script Changes:**
1. Test installation from scratch
2. Test with different configurations
3. Test error conditions
4. Verify logging output

**For Web Interface:**
1. Test in multiple browsers
2. Test responsive design
3. Test with slow connections
4. Test error states

**For Egg Changes:**
1. Import to clean panel
2. Test server creation
3. Test all environment variables
4. Verify startup and logs

### Test Checklist

- [ ] Basic functionality works
- [ ] Edge cases handled
- [ ] Errors handled gracefully
- [ ] Logs are informative
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

---

## 🐛 Bug Fix Guidelines

### For Bug Fixes

1. **Reproduce the bug** first
2. **Write a test** that fails
3. **Fix the bug**
4. **Verify test passes**
5. **Check for regressions**

### Commit Message

```
fix(ads): prevent duplicate ad injection

Fixed issue where ads would play twice in succession
when ads frequency was set to 1.

Fixes #456
```

---

## ✨ Feature Guidelines

### Adding Features

1. **Discuss in an issue** first
2. **Design the feature** (if complex)
3. **Implement incrementally**
4. **Add tests**
5. **Update docs**
6. **Get feedback**

### Feature Branches

```bash
# Create feature branch
git checkout -b feature/my-feature

# Keep up to date with main
git fetch origin
git rebase origin/main

# Push when ready
git push origin feature/my-feature
```

---

## 📚 Documentation Standards

### For New Features

Update:
- [ ] README.md (if user-facing)
- [ ] Relevant guide in docs/
- [ ] Configuration reference
- [ ] CHANGELOG (for releases)

### Documentation Style

- Clear and concise
- Step-by-step instructions
- Code examples
- Screenshots (if helpful)
- Troubleshooting section

---

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## 📞 Questions?

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Email**: wegj1@hotmail.com for direct contact

---

## 🙏 Recognition

Contributors will be:
- Listed in CREDITS.md
- Mentioned in release notes
- Thanked in our community

---

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT with Attribution Requirement).

See [LICENSE](../LICENSE) and [ATTRIBUTION.md](../ATTRIBUTION.md) for details.

---

**Thank you for contributing to AutoDJ-Extreme!** 🎵
