"""
HAMCODZ Telegram Bot Integration
================================
Handles sending trading signals to Telegram channels.

Setup:
1. Create a bot via @BotFather on Telegram
2. Get your bot token
3. Create a channel and add the bot as admin
4. Get the channel ID (can use @userinfobot)
"""

import os
import asyncio
import aiohttp
from typing import Optional, List
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TelegramConfig:
    """Telegram bot configuration"""
    bot_token: str
    channel_id: str
    parse_mode: str = "HTML"


class TelegramBot:
    """Telegram bot for signal delivery"""
    
    def __init__(self, config: TelegramConfig):
        self.config = config
        self.base_url = f"https://api.telegram.org/bot{config.bot_token}"
    
    async def send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        """
        Send a message to the configured channel.
        
        Args:
            text: Message text (can include HTML formatting)
            parse_mode: Parse mode (HTML or Markdown)
        
        Returns:
            True if successful, False otherwise
        """
        url = f"{self.base_url}/sendMessage"
        data = {
            "chat_id": self.config.channel_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data) as response:
                    result = await response.json()
                    
                    if result.get("ok"):
                        logger.info(f"Message sent successfully to {self.config.channel_id}")
                        return True
                    else:
                        logger.error(f"Failed to send message: {result}")
                        return False
                        
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            return False
    
    async def send_signal(self, signal_text: str) -> bool:
        """Send a trading signal to the channel"""
        return await self.send_message(signal_text)
    
    async def send_daily_summary(self, stats: dict) -> bool:
        """Send daily performance summary"""
        message = f"""
📊 <b>DAILY PERFORMANCE SUMMARY</b>

🎯 <b>Signals Today:</b> {stats.get('total_signals', 0)}
✅ <b>Wins:</b> {stats.get('wins', 0)}
❌ <b>Losses:</b> {stats.get('losses', 0)}
⏳ <b>Pending:</b> {stats.get('pending', 0)}

📈 <b>Win Rate:</b> {stats.get('win_rate', 0):.1f}%
💰 <b>Total Pips:</b> {stats.get('total_pips', 0):.0f}

<i>Keep following for more signals!</i>
"""
        return await self.send_message(message.strip())
    
    async def send_weekly_report(self, stats: dict) -> bool:
        """Send weekly performance report"""
        message = f"""
📅 <b>WEEKLY PERFORMANCE REPORT</b>

━━━━━━━━━━━━━━━━━━━━━━━
📈 <b>TRADING STATISTICS</b>
━━━━━━━━━━━━━━━━━━━━━━━

📊 <b>Total Signals:</b> {stats.get('total_signals', 0)}
✅ <b>Wins:</b> {stats.get('wins', 0)}
❌ <b>Losses:</b> {stats.get('losses', 0)}
📈 <b>Win Rate:</b> {stats.get('win_rate', 0):.1f}%

━━━━━━━━━━━━━━━━━━━━━━━
💰 <b>PROFIT SUMMARY</b>
━━━━━━━━━━━━━━━━━━━━━━━

💵 <b>Total Pips:</b> {stats.get('total_pips', 0):.0f}
📊 <b>Avg Pips/Signal:</b> {stats.get('avg_pips', 0):.1f}

<i>Thank you for following HAMCODZ Trading!</i>
"""
        return await self.send_message(message.strip())
    
    async def send_market_alert(self, alert_type: str, message: str) -> bool:
        """Send market alert (news, volatility, etc.)"""
        emoji = {
            "NEWS": "📰",
            "VOLATILITY": "⚠️",
            "WARNING": "🚨",
            "INFO": "ℹ️"
        }.get(alert_type, "📢")
        
        text = f"""
{emoji} <b>{alert_type} ALERT</b>

{message}

<i>Stay safe and trade smart!</i>
"""
        return await self.send_message(text.strip())
    
    async def get_me(self) -> Optional[dict]:
        """Get bot information"""
        url = f"{self.base_url}/getMe"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    result = await response.json()
                    return result if result.get("ok") else None
        except Exception as e:
            logger.error(f"Error getting bot info: {e}")
            return None
    
    async def get_chat(self) -> Optional[dict]:
        """Get channel/group information"""
        url = f"{self.base_url}/getChat"
        params = {"chat_id": self.config.channel_id}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    result = await response.json()
                    return result if result.get("ok") else None
        except Exception as e:
            logger.error(f"Error getting chat info: {e}")
            return None


class SignalSender:
    """High-level signal sending utility"""
    
    def __init__(self, bot_token: str, channel_id: str):
        config = TelegramConfig(bot_token=bot_token, channel_id=channel_id)
        self.bot = TelegramBot(config)
    
    async def send_signal(self, signal_text: str) -> bool:
        """Send a signal message"""
        return await self.bot.send_signal(signal_text)
    
    async def test_connection(self) -> bool:
        """Test if bot is properly configured"""
        me = await self.bot.get_me()
        if me:
            logger.info(f"Bot connected: @{me['result']['username']}")
            return True
        return False
    
    async def send_welcome_message(self) -> bool:
        """Send a welcome/test message"""
        message = """
🚀 <b>HAMCODZ Trading Signals</b>

Welcome to our trading signal channel!

📊 We provide:
• ICT-based analysis
• Real-time forex signals
• Clear entry, TP, and SL levels
• Transparent track record

<i>Signals will be posted automatically when opportunities arise.</i>
"""
        return await self.bot.send_message(message.strip())


# CLI utility for testing
async def main():
    """Test the Telegram bot"""
    
    # Get configuration from environment
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    channel_id = os.getenv("TELEGRAM_CHANNEL_ID", "")
    
    if not bot_token or not channel_id:
        print("Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID environment variables")
        print("\nTo get these:")
        print("1. Create a bot via @BotFather on Telegram")
        print("2. Create a channel and add the bot as admin")
        print("3. Get channel ID (use @userinfobot or forward a message to @getmyid_bot)")
        return
    
    sender = SignalSender(bot_token, channel_id)
    
    # Test connection
    print("Testing bot connection...")
    if await sender.test_connection():
        print("✅ Bot connected successfully!")
        
        # Send test message
        print("\nSending test message...")
        if await sender.send_welcome_message():
            print("✅ Test message sent!")
        else:
            print("❌ Failed to send test message")
    else:
        print("❌ Failed to connect to bot")


if __name__ == "__main__":
    asyncio.run(main())
