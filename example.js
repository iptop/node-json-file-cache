const JsonFileCache = require('./src/index');
const path = require('path');

// 初始化缓存，指定缓存文件夹路径
const cache = new JsonFileCache(path.join(__dirname, 'cache'));

console.log('=== 基本使用示例 ===\n');

// 设置字符串
cache.setItem('username', 'zhangsan');
console.log('设置 username:', cache.getItem('username'));

// 设置对象
cache.setItem('userInfo', {
  id: 1,
  name: 'zhangsan',
  age: 25,
  email: 'zhangsan@example.com'
});
console.log('设置 userInfo:', cache.getItem('userInfo'));

// 设置数组
cache.setItem('tags', ['nodejs', 'javascript', 'cache']);
console.log('设置 tags:', cache.getItem('tags'));

// 设置数字
cache.setItem('count', 100);
console.log('设置 count:', cache.getItem('count'));

console.log('\n=== 缓存信息 ===\n');

// 获取所有键名
console.log('所有键名:', cache.keys());

// 获取缓存数量
console.log('缓存数量:', cache.length);

console.log('\n=== 删除操作 ===\n');

// 删除单个缓存
cache.removeItem('count');
console.log('删除 count 后的键名:', cache.keys());
console.log('缓存数量:', cache.length);

console.log('\n=== 批量操作 ===\n');

// 批量设置
for (let i = 0; i < 10; i++) {
  cache.setItem(`key${i}`, `value${i}`);
}
console.log('批量设置后的缓存数量:', cache.length);
console.log('部分键名:', cache.keys().slice(0, 5));

console.log('\n=== 清空缓存 ===\n');

// 清空所有缓存
cache.clear();
console.log('清空后的缓存数量:', cache.length);
console.log('清空后的键名:', cache.keys());
