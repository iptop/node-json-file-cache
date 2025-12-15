const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class JsonFileCache {
  constructor(cachePath, options = {}) {
    this.cachePath = cachePath;
    this.options = {
      autoSave: true,
      ...options
    };
    
    // 确保缓存目录存在
    this._ensureDir(this.cachePath);
  }

  /**
   * 对 key 进行 MD5 加密
   */
  _getMd5(key) {
    return crypto.createHash('md5').update(String(key)).digest('hex');
  }

  /**
   * 根据 key 获取文件路径信息
   * 前3位分别作为3层嵌套文件夹，第4位作为文件名
   * 例如: MD5 为 abc123... 则路径为 a/b/c/1.json
   */
  _getFilePath(key) {
    const md5 = this._getMd5(key);
    const level1 = md5.charAt(0);
    const level2 = md5.charAt(1);
    const level3 = md5.charAt(2);
    const fileName = md5.charAt(3) + '.json';
    const folderPath = path.join(this.cachePath, level1, level2, level3);
    const filePath = path.join(folderPath, fileName);
    
    return { folderPath, filePath, md5 };
  }

  /**
   * 确保目录存在
   */
  _ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 读取指定文件的 JSON 数据
   */
  _readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.error(`读取文件失败: ${filePath}`, error);
    }
    return {};
  }

  /**
   * 写入 JSON 数据到文件
   */
  _writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`写入文件失败: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * 设置缓存项
   */
  setItem(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }

    const { folderPath, filePath, md5 } = this._getFilePath(key);
    
    // 确保文件夹存在
    this._ensureDir(folderPath);
    
    // 读取现有数据
    const data = this._readFile(filePath);
    
    // 使用 MD5 作为存储的 key
    data[md5] = {
      key,
      value,
      timestamp: Date.now()
    };
    
    // 写入文件
    this._writeFile(filePath, data);
  }

  /**
   * 获取缓存项
   */
  getItem(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }

    const { filePath, md5 } = this._getFilePath(key);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = this._readFile(filePath);
    
    if (data[md5]) {
      return data[md5].value;
    }
    
    return null;
  }

  /**
   * 删除缓存项
   */
  removeItem(key) {
    if (typeof key !== 'string') {
      throw new TypeError('Key must be a string');
    }

    const { filePath, md5 } = this._getFilePath(key);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const data = this._readFile(filePath);
    
    if (data[md5]) {
      delete data[md5];
      
      // 如果文件为空，删除文件
      if (Object.keys(data).length === 0) {
        fs.unlinkSync(filePath);
      } else {
        this._writeFile(filePath, data);
      }
    }
  }

  /**
   * 递归删除目录
   */
  _removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
      fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
          this._removeDir(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    if (fs.existsSync(this.cachePath)) {
      const folders = fs.readdirSync(this.cachePath);
      
      folders.forEach(folder => {
        const folderPath = path.join(this.cachePath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          this._removeDir(folderPath);
        }
      });
    }
  }

  /**
   * 递归遍历目录获取所有 JSON 文件
   */
  _getAllJsonFiles(dirPath, fileList = []) {
    if (!fs.existsSync(dirPath)) {
      return fileList;
    }
    
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this._getAllJsonFiles(filePath, fileList);
      } else if (file.endsWith('.json')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  /**
   * 获取所有缓存键名
   */
  keys() {
    const allKeys = [];
    const jsonFiles = this._getAllJsonFiles(this.cachePath);
    
    jsonFiles.forEach(filePath => {
      const data = this._readFile(filePath);
      // 从存储的数据中提取原始 key
      Object.values(data).forEach(item => {
        if (item && item.key) {
          allKeys.push(item.key);
        }
      });
    });
    
    return allKeys;
  }

  /**
   * 获取缓存项数量
   */
  get length() {
    return this.keys().length;
  }
}

module.exports = JsonFileCache;
