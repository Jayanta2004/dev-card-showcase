# Uplift Reminder Service

**Issue #6461**

## Overview
Uplift Reminder Service allows users to schedule and send uplifting messages or reminders to friends, family, or themselves. The app tracks sent and received reminders, offers templates for encouragement, and celebrates users who consistently uplift others.

## Features

### 🎯 Core Functionality
- **Schedule Uplifting Messages**: Set specific dates and times for reminder delivery
- **Self-Reminders**: Send encouragement to yourself
- **Repeat Reminders**: Option to create weekly recurring messages
- **Quick Templates**: Pre-written uplifting messages for quick scheduling
- **Custom Messages**: Write personalized encouraging notes

### 📊 Tracking & Statistics
- **Messages Sent**: Track total uplifting messages you've sent
- **Messages Received**: Count reminders sent to yourself
- **Scheduled Reminders**: View pending scheduled messages
- **Uplift Streak**: Track consecutive days of spreading positivity

### 🏆 Celebration & Gamification
- **Top Uplifters Leaderboard**: See who's spreading the most positivity
- **Personal Rankings**: Track your position among top uplifters
- **Badges**: Earn recognition for consistent uplifting
- **Activity Feed**: View recent uplift history

### 💡 User Experience
- **6 Quick Templates**: One-click template application
- **8 Pre-written Messages**: Dropdown selection for common encouragements
- **Real-time Notifications**: Toast messages confirm actions
- **Auto-send**: Reminders automatically send at scheduled times
- **Send Now Feature**: Manually trigger scheduled reminders early
- **Responsive Design**: Works on desktop, tablet, and mobile

## Template Categories

1. **Keep Pushing** - Motivation for perseverance
2. **Self-Care** - Reminders for personal wellness
3. **Stay Consistent** - Encouragement for ongoing efforts
4. **You Matter** - Affirmation of impact
5. **Positive Vibes** - General encouragement
6. **Smile Today** - Happiness reminders

## Data Persistence
All data is stored locally in browser localStorage:
- Scheduled reminders
- Activity history (last 50 items)
- User statistics
- Leaderboard data

## Technical Stack
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No dependencies
- **LocalStorage API**: Client-side data persistence
- **Font Awesome 6.5.2**: Icon library
- **Google Fonts (Inter)**: Typography

## How to Use

1. **Schedule a Message**:
   - Enter recipient name (or "Me" for yourself)
   - Choose a template or write custom message
   - Set date and time
   - Optionally enable weekly repeat
   - Click "Schedule Message"

2. **Quick Template**:
   - Click any quick template card at bottom
   - Template fills into message field
   - Complete recipient and schedule details

3. **View Top Uplifters**:
   - Click "Top Uplifters" button in header
   - See leaderboard and your ranking
   - View your sent message count

4. **Manage Reminders**:
   - View all scheduled reminders in the list
   - Send immediately with paper plane icon
   - Delete unwanted reminders with trash icon

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- Email/SMS integration for actual delivery
- Recipient contact management
- Message templates customization
- Team/group uplift challenges
- Export activity history
- Social sharing features
- Notification sounds
- Dark mode

## License
This project is part of the EWOC DEV-CARD-SHOW collection.

---

**Start spreading positivity today! 💖✨**
