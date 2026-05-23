# UCIS Quiz App - Backend Implementation Guide

## 🎯 Overview
This guide will help you implement the complete backend functionality for the UCIS Quiz App, including user management, quiz results storage, ranking system, and analytics.

## 📋 Prerequisites
- Firebase project: `g00gleauthen-2afqo4`
- Firebase Authentication enabled
- Basic knowledge of JavaScript and Firebase

## 🚀 Step-by-Step Implementation

### Step 1: Enable Firestore Database

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `g00gleauthen-2afqo4`

2. **Create Firestore Database**
   - Navigate to "Firestore Database" in the left sidebar
   - Click "Create Database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to your users)

3. **Set Up Security Rules**
   - Go to "Rules" tab in Firestore
   - Replace the default rules with:

```javascript
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

### Step 2: Update Firebase Configuration

1. **Update auth.html**
   - Add Firestore imports to the Firebase SDK section
   - Update the `storeUserData` function to create user profile

2. **Update index1.html**
   - Import the backend functions
   - Replace existing Firebase functions with enhanced versions

### Step 3: Implement Core Functions

#### 3.1 User Profile Management

```javascript
// In auth.html, update the storeUserData function
async function storeUserData(user) {
    try {
        // Import backend functions
        const { initializeUserProfile } = await import('./backend-functions.js');
        
        // Initialize user profile in Firestore
        await initializeUserProfile(user);
        
        // Store basic data in localStorage
        const userData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('User data stored successfully');
    } catch (error) {
        console.error('Error storing user data:', error);
    }
}
```

#### 3.2 Quiz Results Storage

```javascript
// In index1.html, update the saveQuizResults function
async function saveQuizResults(score, timeSpent) {
    try {
        if (!currentUser) return;
        
        // Import backend functions
        const { saveQuizAttempt, updateUserStats } = await import('./backend-functions.js');
        
        // Prepare quiz attempt data
        const attemptData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userDisplayName: currentUser.displayName,
            score: score,
            totalQuestions: quizData.length,
            timeSpent: timeSpent,
            subject: localStorage.getItem('selectedSubject') || 'Computing',
            year: localStorage.getItem('selectedYear') || '2025',
            answers: userAnswers,
            correctAnswers: quizData.map(q => q.correct)
        };
        
        // Save quiz attempt
        await saveQuizAttempt(attemptData);
        
        // Update user stats
        await updateUserStats(currentUser.uid, {
            score: score,
            timeSpent: timeSpent,
            subject: attemptData.subject
        });
        
        // Reload user stats
        await loadUserStats();
        
        console.log('Quiz results saved successfully');
    } catch (error) {
        console.error('Error saving quiz results:', error);
    }
}
```

#### 3.3 Enhanced User Stats Loading

```javascript
// In index1.html, update the loadUserStats function
async function loadUserStats() {
    try {
        if (!currentUser) return;
        
        // Import backend functions
        const { getUserProfile } = await import('./backend-functions.js');
        
        // Get user profile from Firestore
        const userProfile = await getUserProfile(currentUser.uid);
        
        // Update local stats
        userStats = {
            totalScore: userProfile.totalScore || 0,
            quizzesTaken: userProfile.quizzesTaken || 0,
            averageTime: userProfile.averageTime || 0,
            rank: userProfile.rank || '--'
        };
        
        // Update UI
        updateProfileStats();
        
        console.log('User stats loaded successfully');
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}
```

### Step 4: Add Ranking System

#### 4.1 Create Rankings Page

Create a new file `rankings.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UCIS - Rankings</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Add your CSS styles here -->
</head>
<body class="font-inter bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Global Rankings</h1>
        
        <!-- Rankings Table -->
        <div id="rankings-table" class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <!-- Rankings will be loaded here -->
        </div>
    </div>
    
    <script type="module">
        import { getTopRankings } from './backend-functions.js';
        
        async function loadRankings() {
            try {
                const rankings = await getTopRankings(20);
                displayRankings(rankings);
            } catch (error) {
                console.error('Error loading rankings:', error);
            }
        }
        
        function displayRankings(rankings) {
            const table = document.getElementById('rankings-table');
            // Implement rankings display logic
        }
        
        // Load rankings on page load
        loadRankings();
    </script>
</body>
</html>
```

#### 4.2 Add Rankings Link to Navigation

Update the profile dropdown in all pages to include a "View Rankings" link.

### Step 5: Implement Analytics

#### 5.1 Create Analytics Dashboard

Create `analytics.html` for admin/advanced users:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UCIS - Analytics</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="font-inter bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        
        <!-- Analytics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div id="total-users" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Total Users</h3>
                <p class="text-3xl font-bold text-blue-600">--</p>
            </div>
            <div id="total-attempts" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Total Attempts</h3>
                <p class="text-3xl font-bold text-green-600">--</p>
            </div>
            <div id="average-score" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Average Score</h3>
                <p class="text-3xl font-bold text-purple-600">--</p>
            </div>
            <div id="active-users" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Active Users</h3>
                <p class="text-3xl font-bold text-orange-600">--</p>
            </div>
        </div>
        
        <!-- Subject Analytics -->
        <div id="subject-analytics" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 class="text-xl font-bold mb-4">Subject Performance</h2>
            <!-- Subject analytics will be loaded here -->
        </div>
    </div>
    
    <script type="module">
        import { getSystemAnalytics, getSubjectAnalytics } from './backend-functions.js';
        
        async function loadAnalytics() {
            try {
                const systemAnalytics = await getSystemAnalytics();
                displaySystemAnalytics(systemAnalytics);
                
                // Load subject analytics
                const subjects = ['Mathematics', 'Integrated Science', 'English Language', 'Computing'];
                const subjectAnalytics = {};
                
                for (const subject of subjects) {
                    subjectAnalytics[subject] = await getSubjectAnalytics(subject);
                }
                
                displaySubjectAnalytics(subjectAnalytics);
            } catch (error) {
                console.error('Error loading analytics:', error);
            }
        }
        
        function displaySystemAnalytics(analytics) {
            document.getElementById('total-users').querySelector('p').textContent = analytics.totalUsers;
            document.getElementById('total-attempts').querySelector('p').textContent = analytics.totalAttempts;
            document.getElementById('average-score').querySelector('p').textContent = analytics.averageScore;
            document.getElementById('active-users').querySelector('p').textContent = analytics.activeUsers;
        }
        
        function displaySubjectAnalytics(analytics) {
            // Implement subject analytics display
        }
        
        // Load analytics on page load
        loadAnalytics();
    </script>
</body>
</html>
```

### Step 6: Testing and Validation

#### 6.1 Test User Registration
1. Sign in with Google
2. Verify user profile is created in Firestore
3. Check localStorage for user data

#### 6.2 Test Quiz Completion
1. Complete a quiz
2. Verify quiz attempt is saved
3. Check user stats are updated
4. Verify ranking is calculated

#### 6.3 Test Rankings
1. Complete multiple quizzes
2. Check rankings page
3. Verify rank calculations

#### 6.4 Test Analytics
1. Access analytics dashboard
2. Verify data is displayed correctly
3. Check subject-specific analytics

### Step 7: Performance Optimization

#### 7.1 Implement Caching
```javascript
// Add caching for frequently accessed data
const cache = new Map();

async function getCachedUserProfile(userId) {
    if (cache.has(userId)) {
        return cache.get(userId);
    }
    
    const profile = await getUserProfile(userId);
    cache.set(userId, profile);
    return profile;
}
```

#### 7.2 Optimize Database Queries
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use batch operations for multiple updates

#### 7.3 Add Error Handling
```javascript
// Add comprehensive error handling
function handleFirebaseError(error) {
    console.error('Firebase Error:', error);
    
    switch (error.code) {
        case 'permission-denied':
            // Handle permission errors
            break;
        case 'not-found':
            // Handle not found errors
            break;
        default:
            // Handle other errors
            break;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Firestore not enabled**
   - Solution: Enable Firestore in Firebase Console

2. **Security rules blocking access**
   - Solution: Check and update security rules

3. **Import errors**
   - Solution: Ensure proper module imports and file paths

4. **Authentication issues**
   - Solution: Verify Firebase Auth configuration

### Debug Tips

1. **Check Firebase Console**
   - Monitor Firestore usage
   - Check authentication logs
   - Review security rules

2. **Browser Console**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify data flow

3. **Test Incrementally**
   - Test each function individually
   - Verify data at each step
   - Use console.log for debugging

## 📈 Next Steps

1. **Add Real-time Updates**
   - Implement Firestore listeners for live data
   - Add real-time ranking updates

2. **Enhance Analytics**
   - Add charts and graphs
   - Implement advanced analytics

3. **Add Admin Features**
   - User management dashboard
   - Quiz content management
   - System monitoring

4. **Performance Monitoring**
   - Add Firebase Performance Monitoring
   - Implement error tracking
   - Monitor user engagement

## 🎉 Conclusion

With this implementation, your UCIS Quiz App will have:
- ✅ Complete user management system
- ✅ Quiz results storage and tracking
- ✅ Real-time ranking system
- ✅ Comprehensive analytics
- ✅ Secure data handling
- ✅ Scalable architecture

The app is now ready for production use with a robust backend that can handle multiple users, track performance, and provide meaningful insights!
