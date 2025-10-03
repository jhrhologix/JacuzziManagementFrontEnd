# Security Incident Response - Exposed Secrets

## Date: 2025-10-03

## Issue
GitHub Secret Scanning detected exposed secrets in commit `105fb56b`.

## Exposed Secrets Identified:
1. **Google Maps API Key**: `AIzaSyB42TNeUHFfY9FDUHDf88H4HZqyjCyrJ4o` (in src/index.html)
2. **Cloudinary API Key**: `554175892629915` (in environment files - public key, less critical)
3. **Encryption Key**: `89e22b8d9e6a3b25cb03211576464d0eebf0e5f3c9c246493eb889e4eedd195a`

---

## IMMEDIATE ACTIONS REQUIRED (Do This NOW):

### 1. Rotate Google Maps API Key (CRITICAL - Priority 1)
**Time to complete: 5 minutes**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find the exposed key: `AIzaSyB42TNeUHFfY9FDUHDf88H4HZqyjCyrJ4o`
3. **Delete/Disable** this key immediately
4. Create a NEW API key
5. **Restrict the new key**:
   - Application restrictions: HTTP referrers
   - Add: `https://jacuzzimanagement.rhologix.com/*`
   - Add: `http://localhost:4200/*` (for dev only)
6. API restrictions: Maps JavaScript API, Places API
7. Update `src/index.html` with new key (line with `YOUR_RESTRICTED_API_KEY_HERE`)

### 2. Review Cloudinary API Key (Priority 2)
**Time to complete: 2 minutes**

The Cloudinary API key (`554175892629915`) is a **public key** used for uploads. This is less critical BUT:
1. Check [Cloudinary Console](https://console.cloudinary.com/) settings
2. Ensure "Unsigned uploads" are restricted to your upload preset: `jacuzzi_unsigned`
3. Verify API Secret is NOT exposed anywhere
4. Enable upload restrictions (file types, size limits)

### 3. Rotate Encryption Key (Priority 3)
**Time to complete: 10 minutes**

The exposed encryption key `89e22b8d9e6a3b25cb03211576464d0eebf0e5f3c9c246493eb889e4eedd195a`:
1. Generate a NEW 256-bit key:
   ```javascript
   const crypto = require('crypto');
   console.log(crypto.randomBytes(32).toString('hex'));
   ```
2. Update BOTH frontend and backend with new key
3. This may require re-encrypting existing encrypted data

---

## Code Fixes Applied:

### Fixed Files:
- ✅ `src/index.html` - Removed hardcoded API key, added placeholder
- ✅ Added this documentation

### Files Still Need Manual Update:
- ⚠️ `src/index.html` line 22 - Replace `YOUR_RESTRICTED_API_KEY_HERE` with NEW restricted key
- ⚠️ `src/environments/environment.ts` - Encryption key (after rotating)
- ⚠️ `src/environments/environment.development.ts` - Encryption key (after rotating)

---

## Clean Git History (After rotating keys):

Once you've rotated all keys, clean the git history:

```powershell
# WARNING: This rewrites git history - coordinate with team first!

# Install BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove the exposed key from ALL commits
java -jar bfg.jar --replace-text passwords.txt JacuzziManagementFrontEnd

# Where passwords.txt contains:
# AIzaSyB42TNeUHFfY9FDUHDf88H4HZqyjCyrJ4o
# 89e22b8d9e6a3b25cb03211576464d0eebf0e5f3c9c246493eb889e4eedd195a

# Force push (AFTER coordinating with team!)
cd JacuzziManagementFrontEnd
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Alternative (Simpler but less thorough):**
Just commit the fixes and move forward. The old keys are now invalid after rotation.

---

## Prevention Measures:

### 1. Add Pre-Commit Hooks
Install git-secrets:
```powershell
# Install git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
./install.sh

# Configure for your repos
cd path/to/JacuzziManagementFrontEnd
git secrets --install
git secrets --register-aws
git secrets --add 'AIza[0-9A-Za-z_-]{35}'  # Google API keys pattern
```

### 2. Use Environment Variables (NOT committed to git)
- Store secrets in `.env` files
- Add `.env` to `.gitignore`
- Use environment-specific configs

### 3. Backend Proxy for API Keys
For Google Maps, create a backend endpoint:
```csharp
[HttpGet("google-maps-config")]
public IActionResult GetGoogleMapsConfig()
{
    return Ok(new { apiKey = _configuration["GoogleMatrixApiKey"] });
}
```

Then load it in frontend:
```javascript
fetch('/api/google-maps-config')
  .then(r => r.json())
  .then(config => loadGoogleMaps(config.apiKey));
```

### 4. Update .gitignore
Ensure these patterns are in `.gitignore`:
```
**/appsettings*.json
!**/appsettings.template.json
**/.env
**/.env.*
**/secrets.json
```

---

## Monitoring

- Enable GitHub Secret Scanning alerts (already enabled)
- Monitor Google Cloud Console for API key usage
- Set up billing alerts in Google Cloud
- Review Cloudinary usage logs regularly

---

## Timeline:

- **Now**: Rotate keys immediately
- **Within 1 hour**: Update code with new keys and test
- **Within 24 hours**: Clean git history (optional)
- **Within 1 week**: Implement prevention measures

---

## Status Checklist:

- [ ] Google Maps API key rotated
- [ ] Google Maps API key restricted to domain
- [ ] New key added to index.html
- [ ] Cloudinary settings reviewed
- [ ] Encryption key rotated (if needed)
- [ ] Frontend redeployed with new keys
- [ ] Git history cleaned (optional)
- [ ] Pre-commit hooks installed
- [ ] Team notified
- [ ] GitHub alert resolved

---

## Notes:

**Good News**: 
- Repository is private, so exposure is limited
- Keys can be restricted by domain/IP in Google Cloud
- Detected quickly by GitHub scanning

**Lessons Learned**:
- Never commit API keys directly in code
- Use environment variables or backend proxies
- Always restrict API keys in provider consoles
- Enable secret scanning on all repositories

---

For questions or help, refer to:
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

