# Database Utilities - Quick Reference

## Import Statement
```javascript
import { query, run } from './lib/db.js';
```

## Function Signatures

### query(sql, params = [])
- **Use for**: SELECT statements
- **Returns**: Array of objects
- **Example**: `query('SELECT * FROM users WHERE id = ?', [123])`

### run(sql, params = [])
- **Use for**: INSERT, UPDATE, DELETE statements  
- **Returns**: Object with `{ lastInsertRowid, changes }`
- **Example**: `run('UPDATE users SET name = ? WHERE id = ?', ['John', 123])`

## Common Patterns

### Select with Conditions
```javascript
const activeUsers = query('SELECT * FROM users WHERE active = ? AND created_at > ?', [true, '2024-01-01']);
```

### Update with Confirmation
```javascript
const result = run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
console.log(`Updated ${result.changes} rows`);
```

### Insert and Get ID
```javascript
const result = run('INSERT INTO tracks (title, artist_id) VALUES (?, ?)', ['Song Title', artistId]);
const newTrackId = result.lastInsertRowid;
```

### Complex Join Query
```javascript
const artistTracks = query(`
  SELECT t.title, t.created_at, ap.artist_name 
  FROM tracks t 
  JOIN artist_profiles ap ON t.artist_id = ap.user_id 
  WHERE ap.genre = ?
`, ['Hip Hop']);
```

## Security Notes
- ✅ Always use `?` placeholders for parameters
- ✅ Never concatenate user input into SQL strings
- ✅ Both functions use prepared statements automatically

## Error Handling
```javascript
try {
  const result = query('SELECT * FROM users WHERE id = ?', [userId]);
  return result;
} catch (error) {
  console.error('Database error:', error.message);
  throw error;
}
```

---
**Status**: ✅ Ready for Production Use  
**Updated**: 2025-07-12
