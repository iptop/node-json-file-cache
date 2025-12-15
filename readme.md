# node-json-file-cache

一个轻量级的 Node.js 缓存库，基于本地 JSON 文件实现 key-value 缓存存储，API 风格类似浏览器的 localStorage。

> ⚠️ **重要提示**：这是一个简易的单进程缓存系统，**不支持多进程、多线程或集群环境**。仅适用于命令行工具、开发环境、单机脚本等单进程场景。如需并发支持，请使用 Redis、SQLite 等专业方案。

## 特性

- 🚀 简单易用，API 设计类似 localStorage
- 💾 基于本地 JSON 文件持久化存储
- 🔑 支持 key-value 键值对缓存
- 📁 自定义缓存文件存储路径
- ⚡ 轻量级，无额外依赖
- 🔒 完整的 TypeScript 类型定义
- 🗂️ 智能的 MD5 分片存储，避免大文件读写
- 📊 3层嵌套目录结构，优化文件系统性能

## 安装

```bash
npm install node-json-file-cache
```

或使用 yarn：

```bash
yarn add node-json-file-cache
```

## 快速开始

### JavaScript

```javascript
const JsonFileCache = require('node-json-file-cache');

// 初始化缓存对象，传入缓存文件夹路径
const cache = new JsonFileCache('./cache');

// 设置缓存
cache.setItem('username', 'zhangsan');
cache.setItem('userInfo', { id: 1, name: 'zhangsan', age: 25 });

// 获取缓存
const username = cache.getItem('username');
console.log(username); // 'zhangsan'

const userInfo = cache.getItem('userInfo');
console.log(userInfo); // { id: 1, name: 'zhangsan', age: 25 }

// 删除缓存
cache.removeItem('username');

// 清空所有缓存
cache.clear();

// 获取所有缓存键名
const keys = cache.keys();
console.log(keys); // ['userInfo']

// 获取缓存项数量
const length = cache.length;
console.log(length); // 1
```

### TypeScript

```typescript
import JsonFileCache from 'node-json-file-cache';

// 定义类型
interface UserInfo {
  id: number;
  name: string;
  age: number;
}

// 初始化缓存对象
const cache = new JsonFileCache('./cache');

// 设置缓存（带类型）
cache.setItem<string>('username', 'zhangsan');
cache.setItem<UserInfo>('userInfo', { id: 1, name: 'zhangsan', age: 25 });

// 获取缓存（带类型提示）
const username = cache.getItem<string>('username');
const userInfo = cache.getItem<UserInfo>('userInfo');

// TypeScript 会提供完整的类型检查和智能提示
if (userInfo) {
  console.log(userInfo.name); // 类型安全
}
```

## API 文档

### 初始化

```javascript
const cache = new JsonFileCache(cachePath, options);
```

**参数：**
- `cachePath` (string): 缓存文件存储的文件夹路径
- `options` (object, 可选): 配置选项
  - `filename` (string): 缓存文件名，默认为 `cache.json`
  - `autoSave` (boolean): 是否自动保存，默认为 `true`

### 方法

#### `setItem(key, value)`

设置缓存项。

```javascript
cache.setItem('key', 'value');
cache.setItem('user', { name: 'zhangsan' });
```

**参数：**
- `key` (string): 缓存键名
- `value` (any): 缓存值，支持任意可序列化的 JavaScript 类型

**返回值：** `void`

---

#### `getItem(key)`

获取缓存项。

```javascript
const value = cache.getItem('key');
```

**参数：**
- `key` (string): 缓存键名

**返回值：** 缓存值，如果不存在则返回 `null`

---

#### `removeItem(key)`

删除指定的缓存项。

```javascript
cache.removeItem('key');
```

**参数：**
- `key` (string): 缓存键名

**返回值：** `void`

---

#### `clear()`

清空所有缓存。

```javascript
cache.clear();
```

**返回值：** `void`

---

#### `keys()`

获取所有缓存键名。

```javascript
const allKeys = cache.keys();
console.log(allKeys); // ['key1', 'key2', 'key3']
```

**返回值：** `string[]` - 所有缓存键名的数组

---

#### `length`

获取缓存项数量（属性）。

```javascript
const count = cache.length;
console.log(count); // 3
```

**返回值：** `number` - 缓存项数量

## 典型使用场景

### ✅ 适合的场景

**1. 命令行工具配置**
```javascript
// CLI 工具保存用户配置
const cache = new JsonFileCache('~/.my-cli/cache');
cache.setItem('apiKey', 'xxx');
cache.setItem('lastUpdate', Date.now());
```

**2. 开发环境数据 Mock**
```javascript
// 开发时缓存 API 响应，避免频繁请求
const cache = new JsonFileCache('./dev-cache');
const mockData = cache.getItem('userList');
if (!mockData) {
  const data = await fetchFromAPI();
  cache.setItem('userList', data);
}
```

**3. 单机脚本数据持久化**
```javascript
// 爬虫脚本保存进度
const cache = new JsonFileCache('./crawler-cache');
cache.setItem('lastCrawledPage', 100);
cache.setItem('processedUrls', urlList);
```

**4. 本地应用配置存储**
```javascript
// Electron 应用保存用户偏好
const cache = new JsonFileCache(app.getPath('userData'));
cache.setItem('theme', 'dark');
cache.setItem('language', 'zh-CN');
```

### ❌ 不适合的场景

- **Web 服务器**：多进程/集群环境会导致数据不一致
- **高并发应用**：没有锁机制，无法保证数据安全
- **分布式系统**：不支持跨机器共享缓存
- **需要事务的场景**：没有 ACID 保证
- **实时性要求高的场景**：同步 I/O 可能阻塞主线程

## TypeScript 支持

本库提供完整的 TypeScript 类型定义文件（`.d.ts`），无需额外安装 `@types` 包。

### 类型提示

在 TypeScript 或支持 JSDoc 的编辑器（如 VSCode）中，你将获得：

- 完整的方法参数提示
- 返回值类型推断
- 详细的文档注释
- 智能代码补全

### 泛型支持

```typescript
// 使用泛型指定值的类型
const user = cache.getItem<UserInfo>('user');
const count = cache.getItem<number>('count');
const tags = cache.getItem<string[]>('tags');
```

## 存储架构

本库采用 MD5 哈希分片存储策略，详细设计请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)。

**核心特点：**
- 前3位 MD5 字符分别作为3层嵌套文件夹（如 `a/b/c/`）
- 第4位 MD5 字符作为文件名（如 `d.json`）
- 文件内使用完整 MD5 作为 key，避免冲突
- 理论支持 65,536 个不同的文件分片

## 注意事项

### 数据类型限制
- 缓存数据以 JSON 格式存储，因此只支持可序列化的数据类型
- 不支持存储函数、Symbol 等不可序列化的类型

### 并发限制
- ⚠️ **不支持多进程并发访问**：多个进程同时读写可能导致数据损坏
- ⚠️ **不支持多线程并发访问**：没有文件锁机制，不保证线程安全
- ⚠️ **不支持集群环境**：不适合在 Node.js cluster 模式下使用
- 建议在单进程、单线程环境中使用

### 性能限制
- 适合小到中等规模的数据缓存（< 100万条记录）
- 文件操作是同步的，大量写入可能影响性能
- 每次读写都会进行文件 I/O 操作

### 使用场景
- ✅ 单进程应用的本地缓存
- ✅ 开发环境的临时数据存储
- ✅ 命令行工具的配置缓存
- ✅ 单机脚本的数据持久化
- ❌ 生产环境的高并发应用
- ❌ 多进程/集群部署的应用
- ❌ 需要事务支持的场景
- ❌ 浏览器环境

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

[Your Name]

## 更新日志

### v1.0.0
- 初始版本发布
- 实现基本的 localStorage 风格 API
- 支持 JSON 文件持久化存储
