# 📋 Firebase Field Reference Card

## **Collection: `users`**

### **Required Fields for Each Document:**

| Field Name | Type | Example Value | Description |
|------------|------|---------------|-------------|
| `displayName` | string | `"John Doe"` | User's display name |
| `totalScore` | number | `25` | Total score from all quizzes |
| `quizzesTaken` | number | `5` | Number of quizzes completed |
| `averageTime` | number | `45` | Average time per quiz (seconds) |
| `rank` | number | `1` | Current ranking position |

## **Sample Documents to Create:**

### **Document 1: `sample1`**
```json
{
  "displayName": "John Doe",
  "totalScore": 25,
  "quizzesTaken": 5,
  "averageTime": 45,
  "rank": 1
}
```

### **Document 2: `sample2`**
```json
{
  "displayName": "Jane Smith",
  "totalScore": 20,
  "quizzesTaken": 4,
  "averageTime": 50,
  "rank": 2
}
```

### **Document 3: `sample3`**
```json
{
  "displayName": "Mike Johnson",
  "totalScore": 18,
  "quizzesTaken": 3,
  "averageTime": 55,
  "rank": 3
}
```

## **Quick Setup Checklist:**

- [ ] Enable Firestore Database
- [ ] Create collection named `users`
- [ ] Create document `sample1` with all 5 fields
- [ ] Create document `sample2` with all 5 fields
- [ ] Create document `sample3` with all 5 fields
- [ ] Test rankings in your app

## **Field Types in Firebase Console:**

When adding fields in Firebase Console:
- **String**: Use for `displayName`
- **Number**: Use for `totalScore`, `quizzesTaken`, `averageTime`, `rank`

## **Important Notes:**

- Field names are **case-sensitive**
- Collection name must be exactly `users` (lowercase)
- Document IDs can be anything (we used `sample1`, `sample2`, `sample3`)
- Numbers should be entered as numbers, not strings

