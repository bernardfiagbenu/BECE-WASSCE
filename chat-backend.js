// Chat Backend Functions
// This file contains backend functions for the chat system

// Update user online status
function updateOnlineStatus(userId, isOnline) {
    const userRef = doc(db, 'users', userId);
    return updateDoc(userRef, {
        online: isOnline,
        lastSeen: serverTimestamp()
    });
}

// Set user as online when they connect
function setUserOnline(userId) {
    return updateOnlineStatus(userId, true);
}

// Set user as offline when they disconnect
function setUserOffline(userId) {
    return updateOnlineStatus(userId, false);
}

// Get chat messages between two users
function getChatMessages(userId1, userId2) {
    const chatId = [userId1, userId2].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return getDocs(q);
}

// Send a message
function sendMessage(senderId, receiverId, messageText) {
    const chatId = [senderId, receiverId].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    
    return addDoc(messagesRef, {
        text: messageText,
        senderId: senderId,
        timestamp: serverTimestamp()
    });
}

// Get all users for chat
function getAllUsers() {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName'));
    return getDocs(q);
}

// Search users by name or school
function searchUsers(searchTerm) {
    const usersRef = collection(db, 'users');
    // Note: Firestore doesn't support full-text search natively
    // This would need to be implemented with a search service like Algolia
    // For now, we'll filter on the client side
    return getAllUsers();
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateOnlineStatus,
        setUserOnline,
        setUserOffline,
        getChatMessages,
        sendMessage,
        getAllUsers,
        searchUsers
    };
}
