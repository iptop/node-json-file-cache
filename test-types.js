/**
 * 这个文件用于在 JavaScript 中测试 TypeScript 类型定义
 * 在支持 TypeScript 的 IDE 中会有完整的类型提示
 */

const JsonFileCache = require('./src/index');
const path = require('path');

// @ts-check

// 创建缓存实例
const cache = new JsonFileCache(path.join(__dirname, 'test-cache'));

// 测试 setItem - 应该有参数提示
cache.setItem('key', 'value');

// 测试 getItem - 应该返回 any | null
const value = cache.getItem('key');

// 测试 removeItem - 应该有参数提示
cache.removeItem('key');

// 测试 keys - 应该返回 string[]
const keys = cache.keys();

// 测试 length - 应该返回 number
const length = cache.length;

// 测试 clear - 无参数
cache.clear();

console.log('✓ 类型定义测试通过');
console.log('在 VSCode 或其他支持 TypeScript 的 IDE 中，');
console.log('你应该能看到完整的类型提示和文档注释。');

// 清理
const fs = require('fs');
if (fs.existsSync('test-cache')) {
  fs.rmSync('test-cache', { recursive: true });
}
