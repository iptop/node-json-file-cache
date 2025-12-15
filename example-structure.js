const JsonFileCache = require('./src/index');
const path = require('path');

// 初始化缓存
const cache = new JsonFileCache(path.join(__dirname, 'cache'));

// 设置一些测试数据
cache.setItem('testKey1', 'value1');
cache.setItem('testKey2', 'value2');
cache.setItem('user123', { name: 'zhangsan' });
cache.setItem('config', { theme: 'dark' });

console.log('已创建缓存文件，请查看 cache 文件夹结构');
console.log('缓存数量:', cache.length);
console.log('所有键名:', cache.keys());
