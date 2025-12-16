# node-json-file-cache

A lightweight Node.js caching library that implements key-value cache storage based on local JSON files, with an API style similar to the browser's localStorage.

[中文文档](./readme-zh-cn.md)

> ⚠️ **Important Notice**: This is a simple single-process caching system that **does not support multi-process, multi-threaded, or cluster environments**. It is only suitable for command-line tools, development environments, single-machine scripts, and other single-process scenarios. For concurrent support, please use professional solutions like Redis or SQLite.

## Features

- 🚀 Simple and easy to use, API design similar to localStorage
- 💾 Persistent storage based on local JSON files
- 🔑 Support for key-value pair caching
- 📁 Customizable cache file storage path
- ⚡ Lightweight with no external dependencies
- 🔒 Complete TypeScript type definitions
- 🗂️ Intelligent MD5 sharding storage, avoiding large file read/write operations
- 📊 3-level nested directory structure, optimizing file system performance

## Installation

```bash
npm install node-json-file-cache
```

Or using yarn:

```bash
yarn add node-json-file-cache
```

## Quick Start

### JavaScript

```javascript
const JsonFileCache = require('node-json-file-cache');

// Initialize cache object with cache folder path
const cache = new JsonFileCache('./cache');

// Set cache
cache.setItem('username', 'zhangsan');
cache.setItem('userInfo', { id: 1, name: 'zhangsan', age: 25 });

// Get cache
const username = cache.getItem('username');
console.log(username); // 'zhangsan'

const userInfo = cache.getItem('userInfo');
console.log(userInfo); // { id: 1, name: 'zhangsan', age: 25 }

// Remove cache
cache.removeItem('username');

// Clear all cache
cache.clear();

// Get all cache keys
const keys = cache.keys();
console.log(keys); // ['userInfo']

// Get cache item count
const length = cache.length;
console.log(length); // 1
```

### TypeScript

```typescript
import JsonFileCache from 'node-json-file-cache';

// Define type
interface UserInfo {
  id: number;
  name: string;
  age: number;
}

// Initialize cache object
const cache = new JsonFileCache('./cache');

// Set cache with type
cache.setItem<string>('username', 'zhangsan');
cache.setItem<UserInfo>('userInfo', { id: 1, name: 'zhangsan', age: 25 });

// Get cache with type hints
const username = cache.getItem<string>('username');
const userInfo = cache.getItem<UserInfo>('userInfo');

// TypeScript provides complete type checking and intelligent hints
if (userInfo) {
  console.log(userInfo.name); // Type-safe
}
```

## API Documentation

### Initialization

```javascript
const cache = new JsonFileCache(cachePath, options);
```

**Parameters:**
- `cachePath` (string): Folder path where cache files are stored
- `options` (object, optional): Configuration options
  - `filename` (string): Cache file name, defaults to `cache.json`
  - `autoSave` (boolean): Whether to auto-save, defaults to `true`

### Methods

#### `setItem(key, value)`

Set a cache item.

```javascript
cache.setItem('key', 'value');
cache.setItem('user', { name: 'zhangsan' });
```

**Parameters:**
- `key` (string): Cache key name
- `value` (any): Cache value, supports any serializable JavaScript type

**Return value:** `void`

---

#### `getItem(key)`

Get a cache item.

```javascript
const value = cache.getItem('key');
```

**Parameters:**
- `key` (string): Cache key name

**Return value:** Cache value, or `null` if not found

---

#### `removeItem(key)`

Delete a specific cache item.

```javascript
cache.removeItem('key');
```

**Parameters:**
- `key` (string): Cache key name

**Return value:** `void`

---

#### `clear()`

Clear all cache.

```javascript
cache.clear();
```

**Return value:** `void`

---

#### `keys()`

Get all cache key names.

```javascript
const allKeys = cache.keys();
console.log(allKeys); // ['key1', 'key2', 'key3']
```

**Return value:** `string[]` - Array of all cache key names

---

#### `length`

Get the number of cache items (property).

```javascript
const count = cache.length;
console.log(count); // 3
```

**Return value:** `number` - Number of cache items

## Typical Use Cases

### ✅ Suitable Scenarios

**1. Command-line Tool Configuration**
```javascript
// CLI tool saves user configuration
const cache = new JsonFileCache('~/.my-cli/cache');
cache.setItem('apiKey', 'xxx');
cache.setItem('lastUpdate', Date.now());
```

**2. Development Environment Data Mocking**
```javascript
// Cache API responses during development to avoid frequent requests
const cache = new JsonFileCache('./dev-cache');
const mockData = cache.getItem('userList');
if (!mockData) {
  const data = await fetchFromAPI();
  cache.setItem('userList', data);
}
```

**3. Single-Machine Script Data Persistence**
```javascript
// Web scraper script saves progress
const cache = new JsonFileCache('./crawler-cache');
cache.setItem('lastCrawledPage', 100);
cache.setItem('processedUrls', urlList);
```

**4. Local Application Configuration Storage**
```javascript
// Electron app saves user preferences
const cache = new JsonFileCache(app.getPath('userData'));
cache.setItem('theme', 'dark');
cache.setItem('language', 'en-US');
```

### ❌ Unsuitable Scenarios

- **Web Servers**: Multi-process/cluster environments lead to data inconsistency
- **High-Concurrency Applications**: No locking mechanism, cannot guarantee data safety
- **Distributed Systems**: Does not support cross-machine cache sharing
- **Scenarios Requiring Transactions**: No ACID guarantees
- **High Real-Time Requirements**: Synchronous I/O may block the main thread

## TypeScript Support

This library provides complete TypeScript type definition files (`.d.ts`), no need to install `@types` packages separately.

### Type Hints

In TypeScript or JSDoc-supporting editors (like VSCode), you will get:

- Complete method parameter hints
- Return value type inference
- Detailed documentation comments
- Intelligent code completion

### Generic Support

```typescript
// Use generics to specify value types
const user = cache.getItem<UserInfo>('user');
const count = cache.getItem<number>('count');
const tags = cache.getItem<string[]>('tags');
```

## Storage Architecture

This library uses an MD5 hash sharding storage strategy. For detailed design, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

**Core Features:**
- First 3 MD5 characters serve as 3-level nested folders (e.g., `a/b/c/`)
- 4th MD5 character serves as file name (e.g., `d.json`)
- Complete MD5 used as key within files to avoid conflicts
- Theoretically supports 65,536 different file shards

## Important Notes

### Data Type Limitations
- Cache data is stored in JSON format, so only serializable data types are supported
- Functions, Symbols, and other non-serializable types are not supported

### Concurrency Limitations
- ⚠️ **Does not support multi-process concurrent access**: Simultaneous read/write by multiple processes may corrupt data
- ⚠️ **Does not support multi-threaded concurrent access**: No file locking mechanism, thread safety not guaranteed
- ⚠️ **Does not support cluster environments**: Not suitable for use in Node.js cluster mode
- Recommended for use in single-process, single-threaded environments

### Performance Limitations
- Suitable for small to medium-sized data caching (< 1 million records)
- File operations are synchronous, large-scale writes may impact performance
- Each read/write operation performs file I/O

### Use Cases
- ✅ Local cache for single-process applications
- ✅ Temporary data storage in development environments
- ✅ Configuration cache for command-line tools
- ✅ Data persistence for single-machine scripts
- ❌ High-concurrency applications in production
- ❌ Multi-process/cluster deployed applications
- ❌ Scenarios requiring transaction support
- ❌ Browser environments

## License

MIT

## Contributing

Issues and Pull Requests are welcome!

## Author

[Your Name]

## Changelog

### v1.0.0
- Initial release
- Implemented basic localStorage-style API
- Support for JSON file persistent storage
