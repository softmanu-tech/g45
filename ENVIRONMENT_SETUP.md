# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### 1. Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/church-management
```
Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/church-management
```

### 2. JWT Secret for Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Bishop Account (Initial Setup)
```env
BISHOP_EMAIL=bishop@church.com
BISHOP_PASSWORD=secure-bishop-password-123
```

### 4. Cron API Key (for Automated Reminders)
```env
CRON_API_KEY=1db1e4c2ec4aba042d635fee334ec1aa7553d184efc5321ce65deae741a68c16
```

### 5. Environment
```env
NODE_ENV=development
```

## Complete .env.local File Template

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/church-management

# JWT Secret for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Bishop Account Configuration
BISHOP_EMAIL=bishop@church.com
BISHOP_PASSWORD=secure-bishop-password-123

# Cron API Key for Automated Reminders
CRON_API_KEY=1db1e4c2ec4aba042d635fee334ec1aa7553d184efc5321ce65deae741a68c16

# Environment
NODE_ENV=development
```

## How to Use the CRON_API_KEY

The `CRON_API_KEY` is used to secure the automated reminders endpoint at `/api/cron/reminders`.

### Setting up Automated Reminders

1. **Manual Testing:**
   ```bash
   curl -X POST http://localhost:3000/api/cron/reminders \
     -H "Authorization: Bearer 1db1e4c2ec4aba042d635fee334ec1aa7553d184efc5321ce65deae741a68c16" \
     -H "Content-Type: application/json"
   ```

2. **Production Cron Job (Linux/Mac):**
   ```bash
   # Add to crontab (crontab -e)
   # Run every day at 9 AM
   0 9 * * * curl -X POST https://your-domain.com/api/cron/reminders \
     -H "Authorization: Bearer 1db1e4c2ec4aba042d635fee334ec1aa7553d184efc5321ce65deae741a68c16" \
     -H "Content-Type: application/json"
   ```

3. **Using External Cron Services:**
   - **Vercel Cron Jobs:** Configure in `vercel.json`
   - **GitHub Actions:** Set up workflow with scheduled triggers
   - **Cron-job.org:** Free external cron service
   - **EasyCron:** Another external option

### What the Reminders Do

The cron endpoint sends two types of notifications:

1. **Event Reminders:** Notifies members about events happening tomorrow
2. **Attendance Reminders:** Reminds leaders to mark attendance for yesterday's events

## Security Notes

- **Never commit `.env.local` to version control**
- **Use strong, unique keys in production**
- **Regenerate keys if compromised**
- **Consider rotating keys periodically**

## Generating New Keys

To generate a new CRON_API_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

To generate a new JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
