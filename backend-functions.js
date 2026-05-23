// Enhanced Backend Functions for UCIS Quiz App
// This file contains all the Firebase Firestore functions for user management, quiz results, and rankings

import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc,
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    where,
    increment,
    serverTimestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const db = getFirestore();

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

/**
 * Create a new user profile in Firestore
 * @param {Object} userData - User data from Firebase Auth
 * @returns {Promise<Object>} Created user profile
 */
export async function createUserProfile(userData) {
    try {
        const userDocRef = doc(db, 'users', userData.uid);
        
        const userProfile = {
            displayName: userData.displayName || 'Anonymous User',
            email: userData.email,
            photoURL: userData.photoURL || null,
            totalScore: 0,
            quizzesTaken: 0,
            averageTime: 0,
            rank: '--',
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            subjects: {
                mathematics: { score: 0, attempts: 0, averageTime: 0 },
                integratedScience: { score: 0, attempts: 0, averageTime: 0 },
                englishLanguage: { score: 0, attempts: 0, averageTime: 0 },
                computing: { score: 0, attempts: 0, averageTime: 0 }
            },
            preferences: {
                theme: 'light',
                notifications: true
            }
        };
        
        await setDoc(userDocRef, userProfile);
        console.log('User profile created successfully');
        return userProfile;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

/**
 * Get user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            throw new Error('User profile not found');
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

/**
 * Update user profile in Firestore
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updateData) {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            ...updateData,
            lastActive: serverTimestamp()
        });
        console.log('User profile updated successfully');
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Delete user profile from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUserProfile(userId) {
    try {
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        console.log('User profile deleted successfully');
    } catch (error) {
        console.error('Error deleting user profile:', error);
        throw error;
    }
}

// ========================================
// QUIZ RESULTS FUNCTIONS
// ========================================

/**
 * Save quiz attempt to Firestore
 * @param {Object} attemptData - Quiz attempt data
 * @returns {Promise<string>} Attempt ID
 */
export async function saveQuizAttempt(attemptData) {
    try {
        const attemptRef = doc(collection(db, 'quizAttempts'));
        
        const attempt = {
            ...attemptData,
            timestamp: serverTimestamp(),
            attemptId: attemptRef.id
        };
        
        await setDoc(attemptRef, attempt);
        console.log('Quiz attempt saved successfully');
        return attemptRef.id;
    } catch (error) {
        console.error('Error saving quiz attempt:', error);
        throw error;
    }
}

/**
 * Get user's quiz history
 * @param {string} userId - User ID
 * @param {number} limit - Number of attempts to retrieve
 * @returns {Promise<Array>} Quiz attempts
 */
export async function getUserQuizHistory(userId, limit = 10) {
    try {
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(
            attemptsRef,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        const attempts = [];
        
        querySnapshot.forEach((doc) => {
            attempts.push({ id: doc.id, ...doc.data() });
        });
        
        return attempts;
    } catch (error) {
        console.error('Error getting user quiz history:', error);
        throw error;
    }
}

/**
 * Get quiz statistics for a subject and year
 * @param {string} subject - Subject name
 * @param {string} year - Academic year
 * @returns {Promise<Object>} Quiz statistics
 */
export async function getQuizStatistics(subject, year) {
    try {
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(
            attemptsRef,
            where('subject', '==', subject),
            where('year', '==', year)
        );
        
        const querySnapshot = await getDocs(q);
        const attempts = [];
        
        querySnapshot.forEach((doc) => {
            attempts.push(doc.data());
        });
        
        // Calculate statistics
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
        const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts || 0;
        
        return {
            totalAttempts,
            totalScore,
            averageScore: Math.round(averageScore * 100) / 100,
            averageTime: Math.round(averageTime),
            subject,
            year
        };
    } catch (error) {
        console.error('Error getting quiz statistics:', error);
        throw error;
    }
}

// ========================================
// RANKING FUNCTIONS
// ========================================

/**
 * Calculate and update user's rank
 * @param {string} userId - User ID
 * @returns {Promise<number>} User's rank
 */
export async function calculateUserRank(userId) {
    try {
        // Get all users ordered by total score
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalScore', 'desc'));
        const querySnapshot = await getDocs(q);
        
        let rank = 1;
        for (const doc of querySnapshot.docs) {
            if (doc.id === userId) {
                break;
            }
            rank++;
        }
        
        // Update user's rank
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            rank: rank
        });
        
        console.log(`User rank updated to ${rank}`);
        return rank;
    } catch (error) {
        console.error('Error calculating user rank:', error);
        throw error;
    }
}

/**
 * Update global rankings
 * @returns {Promise<void>}
 */
export async function updateGlobalRankings() {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalScore', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        let rank = 1;
        
        querySnapshot.forEach((doc) => {
            const userRef = doc(db, 'users', doc.id);
            batch.update(userRef, { rank: rank });
            rank++;
        });
        
        await batch.commit();
        console.log('Global rankings updated successfully');
    } catch (error) {
        console.error('Error updating global rankings:', error);
        throw error;
    }
}

/**
 * Get top ranked users
 * @param {number} limit - Number of users to retrieve
 * @returns {Promise<Array>} Top ranked users
 */
export async function getTopRankings(limit = 10) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(
            usersRef,
            orderBy('totalScore', 'desc'),
            limit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        const rankings = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            rankings.push({
                userId: doc.id,
                displayName: data.displayName,
                photoURL: data.photoURL,
                totalScore: data.totalScore,
                quizzesTaken: data.quizzesTaken,
                averageTime: data.averageTime,
                rank: data.rank
            });
        });
        
        return rankings;
    } catch (error) {
        console.error('Error getting top rankings:', error);
        throw error;
    }
}

/**
 * Get subject-specific rankings
 * @param {string} subject - Subject name
 * @param {string} year - Academic year
 * @param {number} limit - Number of users to retrieve
 * @returns {Promise<Array>} Subject rankings
 */
export async function getSubjectRankings(subject, year, limit = 10) {
    try {
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(
            attemptsRef,
            where('subject', '==', subject),
            where('year', '==', year),
            orderBy('score', 'desc'),
            limit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        const rankings = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            rankings.push({
                userId: data.userId,
                displayName: data.userDisplayName,
                score: data.score,
                timeSpent: data.timeSpent,
                timestamp: data.timestamp
            });
        });
        
        return rankings;
    } catch (error) {
        console.error('Error getting subject rankings:', error);
        throw error;
    }
}

// ========================================
// ANALYTICS FUNCTIONS
// ========================================

/**
 * Get user performance analytics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User analytics
 */
export async function getUserAnalytics(userId) {
    try {
        const userProfile = await getUserProfile(userId);
        const quizHistory = await getUserQuizHistory(userId, 50);
        
        // Calculate subject-wise performance
        const subjectPerformance = {};
        const subjects = ['mathematics', 'integratedScience', 'englishLanguage', 'computing'];
        
        subjects.forEach(subject => {
            const subjectAttempts = quizHistory.filter(attempt => 
                attempt.subject.toLowerCase().includes(subject.toLowerCase())
            );
            
            if (subjectAttempts.length > 0) {
                const totalScore = subjectAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
                const averageScore = totalScore / subjectAttempts.length;
                const averageTime = subjectAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / subjectAttempts.length;
                
                subjectPerformance[subject] = {
                    attempts: subjectAttempts.length,
                    totalScore,
                    averageScore: Math.round(averageScore * 100) / 100,
                    averageTime: Math.round(averageTime),
                    bestScore: Math.max(...subjectAttempts.map(a => a.score))
                };
            }
        });
        
        // Calculate improvement over time
        const recentAttempts = quizHistory.slice(0, 10);
        const olderAttempts = quizHistory.slice(10, 20);
        
        const recentAverage = recentAttempts.length > 0 ? 
            recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / recentAttempts.length : 0;
        const olderAverage = olderAttempts.length > 0 ? 
            olderAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / olderAttempts.length : 0;
        
        const improvement = recentAverage - olderAverage;
        
        return {
            userProfile,
            subjectPerformance,
            improvement: Math.round(improvement * 100) / 100,
            totalAttempts: quizHistory.length,
            averageScore: userProfile.totalScore / userProfile.quizzesTaken || 0
        };
    } catch (error) {
        console.error('Error getting user analytics:', error);
        throw error;
    }
}

/**
 * Get subject performance analytics
 * @param {string} subject - Subject name
 * @returns {Promise<Object>} Subject analytics
 */
export async function getSubjectAnalytics(subject) {
    try {
        const attemptsRef = collection(db, 'quizAttempts');
        const q = query(attemptsRef, where('subject', '==', subject));
        const querySnapshot = await getDocs(q);
        
        const attempts = [];
        querySnapshot.forEach((doc) => {
            attempts.push(doc.data());
        });
        
        const totalAttempts = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
        const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts || 0;
        
        // Calculate score distribution
        const scoreDistribution = {
            excellent: attempts.filter(a => a.score >= 80).length,
            good: attempts.filter(a => a.score >= 60 && a.score < 80).length,
            average: attempts.filter(a => a.score >= 40 && a.score < 60).length,
            poor: attempts.filter(a => a.score < 40).length
        };
        
        return {
            subject,
            totalAttempts,
            totalScore,
            averageScore: Math.round(averageScore * 100) / 100,
            averageTime: Math.round(averageTime),
            scoreDistribution
        };
    } catch (error) {
        console.error('Error getting subject analytics:', error);
        throw error;
    }
}

/**
 * Get overall system analytics
 * @returns {Promise<Object>} System analytics
 */
export async function getSystemAnalytics() {
    try {
        const usersRef = collection(db, 'users');
        const attemptsRef = collection(db, 'quizAttempts');
        
        const [usersSnapshot, attemptsSnapshot] = await Promise.all([
            getDocs(usersRef),
            getDocs(attemptsRef)
        ]);
        
        const totalUsers = usersSnapshot.size;
        const totalAttempts = attemptsSnapshot.size;
        
        const users = [];
        const attempts = [];
        
        usersSnapshot.forEach((doc) => {
            users.push(doc.data());
        });
        
        attemptsSnapshot.forEach((doc) => {
            attempts.push(doc.data());
        });
        
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;
        const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts || 0;
        
        // Calculate subject popularity
        const subjectCounts = {};
        attempts.forEach(attempt => {
            const subject = attempt.subject;
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
        
        return {
            totalUsers,
            totalAttempts,
            totalScore,
            averageScore: Math.round(averageScore * 100) / 100,
            averageTime: Math.round(averageTime),
            subjectPopularity: subjectCounts,
            activeUsers: users.filter(user => user.lastActive).length
        };
    } catch (error) {
        console.error('Error getting system analytics:', error);
        throw error;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Update user stats after quiz completion
 * @param {string} userId - User ID
 * @param {Object} quizResult - Quiz result data
 * @returns {Promise<void>}
 */
export async function updateUserStats(userId, quizResult) {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }
        
        const userData = userDoc.data();
        const subject = quizResult.subject.toLowerCase().replace(' ', '');
        
        // Update overall stats
        const newTotalScore = userData.totalScore + quizResult.score;
        const newQuizzesTaken = userData.quizzesTaken + 1;
        const newAverageTime = Math.round(
            (userData.averageTime * userData.quizzesTaken + quizResult.timeSpent) / newQuizzesTaken
        );
        
        // Update subject-specific stats
        const subjectStats = userData.subjects[subject] || { score: 0, attempts: 0, averageTime: 0 };
        const newSubjectScore = subjectStats.score + quizResult.score;
        const newSubjectAttempts = subjectStats.attempts + 1;
        const newSubjectAverageTime = Math.round(
            (subjectStats.averageTime * subjectStats.attempts + quizResult.timeSpent) / newSubjectAttempts
        );
        
        const updateData = {
            totalScore: newTotalScore,
            quizzesTaken: newQuizzesTaken,
            averageTime: newAverageTime,
            lastActive: serverTimestamp(),
            [`subjects.${subject}.score`]: newSubjectScore,
            [`subjects.${subject}.attempts`]: newSubjectAttempts,
            [`subjects.${subject}.averageTime`]: newSubjectAverageTime
        };
        
        await updateDoc(userDocRef, updateData);
        
        // Update user's rank
        await calculateUserRank(userId);
        
        console.log('User stats updated successfully');
    } catch (error) {
        console.error('Error updating user stats:', error);
        throw error;
    }
}

/**
 * Initialize user profile if it doesn't exist
 * @param {Object} userData - User data from Firebase Auth
 * @returns {Promise<Object>} User profile
 */
export async function initializeUserProfile(userData) {
    try {
        const userDocRef = doc(db, 'users', userData.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            return await createUserProfile(userData);
        }
    } catch (error) {
        console.error('Error initializing user profile:', error);
        throw error;
    }
}

export default {
    // User Management
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    initializeUserProfile,
    
    // Quiz Results
    saveQuizAttempt,
    getUserQuizHistory,
    getQuizStatistics,
    
    // Rankings
    calculateUserRank,
    updateGlobalRankings,
    getTopRankings,
    getSubjectRankings,
    
    // Analytics
    getUserAnalytics,
    getSubjectAnalytics,
    getSystemAnalytics,
    
    // Utilities
    updateUserStats
};
