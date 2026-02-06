# Security Policy

## 🔒 Reporting Security Vulnerabilities

**Banabyte LLC** takes security seriously. We appreciate your efforts to responsibly disclose any security issues.

### 📧 Private Disclosure

For **critical security vulnerabilities**, please email directly:

**Email:** wegj1@hotmail.com  
**Subject:** `[SECURITY] AutoDJ-Extreme - Brief Description`

**DO NOT** open public issues for critical security vulnerabilities.

### What to Include

Please provide:
- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Affected versions
- Suggested fix (if applicable)

### 📋 Non-Critical Issues

For minor security improvements or non-critical concerns, you may:
1. Use our [Security Report Template](https://github.com/ZEROPOINTBRUH/AutoDJ-Extreme/issues/new?template=security_report.yml)
2. Email wegj1@hotmail.com

---

## 🛡️ Security Response Process

### Timeline

1. **Acknowledgment** - Within 48 hours
2. **Assessment** - 3-5 business days
3. **Fix Development** - Depends on severity
4. **Testing** - 1-3 days
5. **Release** - Coordinated disclosure

### Severity Levels

| Level | Response Time | Description |
|-------|---------------|-------------|
| **Critical** | 24-48 hours | Immediate threat, active exploitation |
| **High** | 3-5 days | Significant security risk |
| **Medium** | 1-2 weeks | Moderate security concern |
| **Low** | Best effort | Minor improvements |

---

## 🔐 Supported Versions

| Version | Supported | Notes |
|---------|-----------|-------|
| Extreme Edition (latest) | ✅ | Full support |
| Enhanced Edition | ✅ | Security updates only |
| Original Edition | ❌ | No longer supported |

---

## 🛠️ Security Best Practices

### For Administrators

**Required Actions:**
1. ✅ Change ALL default passwords immediately
2. ✅ Use strong passwords (16+ characters)
3. ✅ Different password for each service
4. ✅ Keep software updated
5. ✅ Monitor logs regularly

**Password Requirements:**
- Minimum 12 characters (enforced)
- Mix of uppercase, lowercase, numbers, symbols
- No common words or patterns
- Unique per service

**Generate Strong Passwords:**
```bash
# Linux/Mac
openssl rand -base64 24

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})
```

### Network Security

**Recommendations:**
- Use HTTPS/TLS for admin panel access
- Restrict admin panel to specific IPs
- Use firewall rules
- Enable fail2ban for brute force protection
- Consider VPN for admin access

**Firewall Configuration:**
```bash
# Allow stream port
ufw allow 8000/tcp

# Restrict admin (use SSH tunnel instead)
ufw deny from any to any port 8000/tcp
```

### File System Security

**Permissions:**
```bash
# Restrict config files
chmod 600 /mnt/server/icecast.xml
chmod 600 /mnt/server/ezstream.xml

# Restrict logs
chmod 750 /mnt/server/log
```

### Environment Variables

**Security Notes:**
- Store passwords in panel environment variables, never in code
- Don't commit `.env` files with passwords
- Rotate passwords periodically (every 90 days)
- Use different passwords across environments (dev/prod)

---

## 🚨 Known Security Considerations

### Default Configurations

**Issue:** Default passwords in example configurations  
**Mitigation:** Change immediately during installation  
**Status:** Documented in installation guide

### Admin Panel Access

**Issue:** Admin panel exposed on public port  
**Mitigation:** Use reverse proxy with authentication  
**Status:** Recommended in documentation

### Log File Permissions

**Issue:** Logs may contain sensitive information  
**Mitigation:** Restrict log directory permissions  
**Status:** Handled by installation script

---

## 🔍 Security Audits

### Self-Audit Checklist

- [ ] All default passwords changed
- [ ] Strong passwords in use (16+ chars)
- [ ] Admin panel access restricted
- [ ] Logs monitored regularly
- [ ] Software up to date
- [ ] Firewall configured
- [ ] Backups in place
- [ ] SSL/TLS enabled (if applicable)

### Third-Party Audits

We welcome security researchers to audit AutoDJ-Extreme. If you perform a security audit:
1. Report findings via email
2. Allow time for fixes before disclosure
3. You'll be credited in release notes (if desired)

---

## 📜 Security Advisories

Security advisories will be published:
- GitHub Security Advisories
- Release notes
- Email notification (for critical issues)

### Subscribe to Advisories

Watch the repository and enable:
- Security alerts
- All activity notifications

---

## 🤝 Responsible Disclosure

We follow coordinated vulnerability disclosure:

### Our Commitment

- Acknowledge reports within 48 hours
- Provide regular updates on progress
- Credit researchers (if desired)
- Coordinate disclosure timing
- Release patches promptly

### Your Commitment

- Report privately before public disclosure
- Allow reasonable time for fixes
- Don't exploit vulnerabilities
- Act in good faith

---

## 📞 Security Contact

**Primary Contact:** wegj1@hotmail.com  
**Organization:** Banabyte LLC  
**Response Time:** 24-48 hours  

**For urgent issues, include:**
- Subject line: `[URGENT SECURITY]`
- Clear severity indication
- Contact method for follow-up

---

## 🏆 Hall of Fame

Security researchers who have helped improve AutoDJ-Extreme:

*(No entries yet - be the first!)*

---

## ⚖️ Legal

### Safe Harbor

Banabyte LLC commits to:
- Not pursue legal action against security researchers
- Work cooperatively on vulnerability resolution
- Credit researchers for responsible disclosure

**Conditions:**
- Research conducted in good faith
- No data exfiltration or damage
- Compliance with responsible disclosure
- No extortion or threats

### Scope

**In Scope:**
- AutoDJ-Extreme code and dependencies
- Docker images
- Web interface
- Configuration security
- Documentation accuracy

**Out of Scope:**
- Third-party services (Icecast, ezstream)
- Hosting provider vulnerabilities
- Social engineering attacks
- Physical security

---

**Last Updated:** February 5, 2026  
**Version:** 2.0 (Extreme Edition)

**Questions?** Email wegj1@hotmail.com
