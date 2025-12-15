const JsonFileCache = require('./src/index');
const path = require('path');
const fs = require('fs');

// 初始化缓存
const cache = new JsonFileCache(path.join(__dirname, 'demo-cache'));

// 设置一些测试数据
cache.setItem('username', 'zhangsan');
cache.setItem('email', 'test@example.com');
cache.setItem('age', 25);

console.log('=== 缓存数据 ===');
console.log('username:', cache.getItem('username'));
console.log('email:', cache.getItem('email'));
console.log('age:', cache.getItem('age'));

console.log('\n=== 文件结构 ===');

// 递归查找所有 JSON 文件
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const jsonFiles = findJsonFiles('./demo-cache');
jsonFiles.forEach(file => {
  const relativePath = file.replace('./demo-cache/', '');
  console.log(`\n文件路径: ${relativePath}`);
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log('文件内容:', JSON.stringify(content, null, 2));
});

// 清理
cache.clear();
