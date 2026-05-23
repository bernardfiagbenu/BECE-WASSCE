# Chat System Setup Guide

## Overview
This chat system allows users to search for other users and have real-time conversations using Firebase as the backend.

## Features
- ✅ User search by name or school
- ✅ Real-time messaging
- ✅ Online/offline status indicators
- ✅ Message timestamps
- ✅ Responsive design (mobile-friendly)
- ✅ Dark/light theme support
- ✅ Secure Firebase integration

## Setup Instructions

### 1. Firebase Configuration
Update the Firebase configuration in `chat.html` with your actual credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Firestore Rules
Replace your existing Firestore rules with the ones in `firestore-rules-chat.md`:

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the rules from `firestore-rules-chat.md`
3. Paste and publish

### 3. Database Structure
The chat system uses this Firestore structure:

```
users/{userId}
├── displayName: string
├── phone: string
├── school: string
├── online: boolean
└── lastSeen: timestamp

chats/{chatId}/messages/{messageId}
├── text: string
├── senderId: string
├── senderName: string
└── timestamp: timestamp
```

### 4. File Structure
```
├── chat.html              # Main chat interface
├── chat-backend.js        # Backend functions
├── firestore-rules-chat.md # Security rules
└── chat-setup-guide.md    # This guide
```

## Usage

### For Users:
1. **Access Chat**: Click the "Chat" link in the header of any page
2. **Search Users**: Use the search box to find users by name or school
3. **Start Chat**: Click on any user to begin a conversation
4. **Send Messages**: Type in the message box and press Enter or click Send

### For Developers:
1. **Add Chat Link**: The chat link is already added to all main pages
2. **Customize Styling**: Modify the CSS in `chat.html` for custom themes
3. **Extend Features**: Add typing indicators, file sharing, etc.

## Security Features

- **Authentication Required**: Users must be logged in to access chat
- **Chat Isolation**: Users can only access conversations they're part of
- **Profile Protection**: Users can only update their own profiles
- **Secure Rules**: Firestore rules prevent unauthorized access

## Real-time Features

- **Live Messages**: Messages appear instantly using Firestore `onSnapshot`
- **Online Status**: Users show online/offline status
- **User List**: Real-time updates when users come online/offline
- **Message Sync**: Messages sync across all devices

## Mobile Responsiveness

The chat interface is fully responsive:
- **Desktop**: Side-by-side user list and chat area
- **Tablet**: Stacked layout with collapsible user list
- **Mobile**: Full-width chat with hamburger menu for users

## Troubleshooting

### Common Issues:

1. **Messages not sending**
   - Check Firebase configuration
   - Verify Firestore rules are updated
   - Check browser console for errors

2. **Users not appearing**
   - Ensure users have completed registration
   - Check if user data exists in Firestore
   - Verify authentication is working

3. **Real-time updates not working**
   - Check internet connection
   - Verify Firebase project is active
   - Check browser console for connection errors

### Debug Mode:
Add this to the browser console for debugging:
```javascript
localStorage.setItem('debug', 'true');
```

## Performance Tips

1. **Message Pagination**: For large chat histories, implement pagination
2. **Image Optimization**: Compress images before sending
3. **Connection Management**: Handle offline/online states gracefully
4. **Memory Management**: Clean up listeners when switching chats

## Future Enhancements

- [ ] Typing indicators
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Group chats
- [ ] Message search
- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice messages

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Test with different browsers
4. Check Firestore rules syntax
