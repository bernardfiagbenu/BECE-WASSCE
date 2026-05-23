# Firebase Backend Setup for UCIS Quiz App

## 1. Firebase Console Configuration

### Enable Firestore Database
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `g00gleauthen-2afqo4`
3. Navigate to Firestore Database
4. Click "Create Database"
5. Choose "Start in test mode" (for development)
6. Select a location (choose closest to your users)

### Security Rules Setup
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quiz attempts - users can read/write their own attempts
    match /quizAttempts/{attemptId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Rankings - public read, authenticated write
    match /rankings/{rankingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 2. Database Collections Structure

### Users Collection
```javascript
users/{userId} {
  displayName: string,
  email: string,
  photoURL: string,
  totalScore: number,
  quizzesTaken: number,
  averageTime: number,
  rank: number,
  createdAt: timestamp,
  lastActive: timestamp,
  subjects: {
    mathematics: { score: number, attempts: number },
    integratedScience: { score: number, attempts: number },
    englishLanguage: { score: number, attempts: number },
    computing: { score: number, attempts: number }
  }
}
```

### Quiz Attempts Collection
```javascript
quizAttempts/{attemptId} {
  userId: string,
  userEmail: string,
  userDisplayName: string,
  score: number,
  totalQuestions: number,
  timeSpent: number,
  subject: string,
  year: string,
  timestamp: timestamp,
  answers: array,
  correctAnswers: array
}
```

### Rankings Collection
```javascript
rankings/{rankingId} {
  userId: string,
  userDisplayName: string,
  totalScore: number,
  quizzesTaken: number,
  averageTime: number,
  rank: number,
  lastUpdated: timestamp,
  subject: string,
  year: string
}
```

## 3. Backend Functions to Implement

### User Management Functions
- `createUserProfile(userData)` - Create new user profile
- `updateUserProfile(userId, data)` - Update user profile
- `getUserProfile(userId)` - Get user profile
- `deleteUserProfile(userId)` - Delete user profile

### Quiz Results Functions
- `saveQuizAttempt(attemptData)` - Save quiz attempt
- `getUserQuizHistory(userId)` - Get user's quiz history
- `getQuizStatistics(subject, year)` - Get quiz statistics

### Ranking Functions
- `calculateUserRank(userId)` - Calculate user's rank
- `updateGlobalRankings()` - Update global rankings
- `getTopRankings(limit)` - Get top ranked users
- `getSubjectRankings(subject, year)` - Get subject-specific rankings

### Analytics Functions
- `getUserAnalytics(userId)` - Get user performance analytics
- `getSubjectAnalytics(subject)` - Get subject performance analytics
- `getSystemAnalytics()` - Get overall system analytics

## 4. Implementation Steps

### Step 1: Update Firebase Configuration
- Ensure Firestore is enabled
- Set up proper security rules
- Test database connection

### Step 2: Implement Core Functions
- User profile management
- Quiz results storage
- Ranking calculations

### Step 3: Add Analytics
- Performance tracking
- User behavior analysis
- System statistics

### Step 4: Testing & Optimization
- Test all functions
- Optimize database queries
- Implement caching if needed

## 5. Security Considerations

### Authentication
- All operations require valid Firebase Auth
- Users can only access their own data
- Admin functions for system management

### Data Validation
- Validate all input data
- Sanitize user inputs
- Prevent injection attacks

### Rate Limiting
- Implement rate limiting for API calls
- Prevent abuse of ranking system
- Monitor for suspicious activity
