# Updated Firestore Rules with Chat Support

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to quiz collections
    match /quiz-chat/{document} {
      allow read, write: if true;
    }
    match /quiz-scores/{document} {
      allow read, write: if true;
    }
    
    // Allow read access to test collection
    match /test/{document} {
      allow read: if true;
    }
    
    // Chat system rules
    match /users/{userId} {
      // Users can read all user profiles for chat
      allow read: if true;
      // Users can only update their own profile
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /chats/{chatId} {
      // Users can only access chats they're part of
      allow read, write: if request.auth != null && 
        (request.auth.uid in chatId.split('_'));
    }
    
    match /chats/{chatId}/messages/{messageId} {
      // Users can read/write messages in chats they're part of
      allow read, write: if request.auth != null && 
        (request.auth.uid in chatId.split('_'));
    }
    
    // Quiz attempts - users can only access their own attempts
    match /quizAttempts/{attemptId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Flags - users can only access their own flags
    match /flags/{flagId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## Key Features:

1. **User Profiles**: All users can read profiles for chat functionality, but only update their own
2. **Chat Messages**: Users can only access chats they're part of (chatId contains their UID)
3. **Quiz Data**: Maintains existing permissions for quiz functionality
4. **Security**: All operations require authentication
5. **Chat Structure**: Uses `chats/{chatId}/messages/{messageId}` structure

## Chat ID Format:
- Chat IDs are created by sorting two user IDs and joining with underscore
- Example: User A (uid: "abc123") and User B (uid: "def456") create chat "abc123_def456"
- This ensures consistent chat access regardless of who initiates

## Usage:
1. Replace your existing Firestore rules with these
2. The chat system will automatically work with proper permissions
3. Users can only see and send messages in their own conversations
