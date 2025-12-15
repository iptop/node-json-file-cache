const fs = require('fs');
const path = require('path');
const JsonFileCache = require('../src/index');

const TEST_CACHE_PATH = path.join(__dirname, '.test-cache');

describe('JsonFileCache', () => {
  let cache;

  beforeEach(() => {
    // 每个测试前创建新的缓存实例
    cache = new JsonFileCache(TEST_CACHE_PATH);
  });

  afterEach(() => {
    // 每个测试后清理缓存
    if (fs.existsSync(TEST_CACHE_PATH)) {
      cache.clear();
      if (fs.existsSync(TEST_CACHE_PATH)) {
        fs.rmdirSync(TEST_CACHE_PATH);
      }
    }
  });

  describe('初始化', () => {
    test('应该创建缓存目录', () => {
      expect(fs.existsSync(TEST_CACHE_PATH)).toBe(true);
    });

    test('应该接受自定义选项', () => {
      const customCache = new JsonFileCache(TEST_CACHE_PATH, { autoSave: false });
      expect(customCache.options.autoSave).toBe(false);
    });
  });

  describe('setItem 和 getItem', () => {
    test('应该能够设置和获取字符串值', () => {
      cache.setItem('username', 'zhangsan');
      expect(cache.getItem('username')).toBe('zhangsan');
    });

    test('应该能够设置和获取对象值', () => {
      const userInfo = { id: 1, name: 'zhangsan', age: 25 };
      cache.setItem('userInfo', userInfo);
      expect(cache.getItem('userInfo')).toEqual(userInfo);
    });

    test('应该能够设置和获取数组值', () => {
      const list = [1, 2, 3, 4, 5];
      cache.setItem('list', list);
      expect(cache.getItem('list')).toEqual(list);
    });

    test('应该能够设置和获取数字值', () => {
      cache.setItem('count', 100);
      expect(cache.getItem('count')).toBe(100);
    });

    test('应该能够设置和获取布尔值', () => {
      cache.setItem('isActive', true);
      expect(cache.getItem('isActive')).toBe(true);
    });

    test('应该能够设置和获取 null 值', () => {
      cache.setItem('nullValue', null);
      expect(cache.getItem('nullValue')).toBe(null);
    });

    test('获取不存在的键应该返回 null', () => {
      expect(cache.getItem('nonexistent')).toBe(null);
    });

    test('应该能够更新已存在的键', () => {
      cache.setItem('key', 'value1');
      cache.setItem('key', 'value2');
      expect(cache.getItem('key')).toBe('value2');
    });

    test('key 必须是字符串', () => {
      expect(() => cache.setItem(123, 'value')).toThrow(TypeError);
      expect(() => cache.getItem(123)).toThrow(TypeError);
    });
  });

  describe('removeItem', () => {
    test('应该能够删除缓存项', () => {
      cache.setItem('key', 'value');
      expect(cache.getItem('key')).toBe('value');
      
      cache.removeItem('key');
      expect(cache.getItem('key')).toBe(null);
    });

    test('删除不存在的键不应该报错', () => {
      expect(() => cache.removeItem('nonexistent')).not.toThrow();
    });

    test('key 必须是字符串', () => {
      expect(() => cache.removeItem(123)).toThrow(TypeError);
    });
  });

  describe('clear', () => {
    test('应该能够清空所有缓存', () => {
      cache.setItem('key1', 'value1');
      cache.setItem('key2', 'value2');
      cache.setItem('key3', 'value3');
      
      expect(cache.length).toBe(3);
      
      cache.clear();
      
      expect(cache.length).toBe(0);
      expect(cache.getItem('key1')).toBe(null);
      expect(cache.getItem('key2')).toBe(null);
      expect(cache.getItem('key3')).toBe(null);
    });

    test('清空空缓存不应该报错', () => {
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('keys', () => {
    test('应该返回所有缓存键名', () => {
      cache.setItem('key1', 'value1');
      cache.setItem('key2', 'value2');
      cache.setItem('key3', 'value3');
      
      const keys = cache.keys();
      
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    test('空缓存应该返回空数组', () => {
      expect(cache.keys()).toEqual([]);
    });
  });

  describe('length', () => {
    test('应该返回正确的缓存项数量', () => {
      expect(cache.length).toBe(0);
      
      cache.setItem('key1', 'value1');
      expect(cache.length).toBe(1);
      
      cache.setItem('key2', 'value2');
      expect(cache.length).toBe(2);
      
      cache.removeItem('key1');
      expect(cache.length).toBe(1);
      
      cache.clear();
      expect(cache.length).toBe(0);
    });
  });

  describe('MD5 分片存储', () => {
    test('应该根据 MD5 创建正确的3层嵌套文件夹结构', () => {
      cache.setItem('testKey', 'testValue');
      
      // 验证第一层文件夹
      const level1Folders = fs.readdirSync(TEST_CACHE_PATH);
      expect(level1Folders.length).toBeGreaterThan(0);
      
      level1Folders.forEach(level1 => {
        const level1Path = path.join(TEST_CACHE_PATH, level1);
        if (fs.statSync(level1Path).isDirectory()) {
          // 验证第一层文件夹名是1位
          expect(level1.length).toBe(1);
          expect(level1).toMatch(/^[0-9a-f]$/);
          
          // 验证第二层文件夹
          const level2Folders = fs.readdirSync(level1Path);
          level2Folders.forEach(level2 => {
            const level2Path = path.join(level1Path, level2);
            if (fs.statSync(level2Path).isDirectory()) {
              // 验证第二层文件夹名是1位
              expect(level2.length).toBe(1);
              expect(level2).toMatch(/^[0-9a-f]$/);
              
              // 验证第三层文件夹
              const level3Folders = fs.readdirSync(level2Path);
              level3Folders.forEach(level3 => {
                const level3Path = path.join(level2Path, level3);
                if (fs.statSync(level3Path).isDirectory()) {
                  // 验证第三层文件夹名是1位
                  expect(level3.length).toBe(1);
                  expect(level3).toMatch(/^[0-9a-f]$/);
                  
                  // 验证文件名是1位+.json
                  const files = fs.readdirSync(level3Path);
                  files.forEach(file => {
                    expect(file).toMatch(/^[0-9a-f]\.json$/);
                  });
                }
              });
            }
          });
        }
      });
    });

    test('相同 MD5 前缀的 key 应该存储在同一个文件中', () => {
      // 设置多个 key
      cache.setItem('key1', 'value1');
      cache.setItem('key2', 'value2');
      cache.setItem('key3', 'value3');
      
      // 验证可以正常读取
      expect(cache.getItem('key1')).toBe('value1');
      expect(cache.getItem('key2')).toBe('value2');
      expect(cache.getItem('key3')).toBe('value3');
    });

    test('应该在文件中存储完整的数据结构', () => {
      const testKey = 'testKey';
      const testValue = { data: 'test' };
      
      cache.setItem(testKey, testValue);
      
      const { filePath, md5 } = cache._getFilePath(testKey);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // 验证使用 MD5 作为存储的 key
      expect(fileContent[md5]).toBeDefined();
      expect(fileContent[md5].key).toBe(testKey);
      expect(fileContent[md5].value).toEqual(testValue);
      expect(fileContent[md5].timestamp).toBeDefined();
    });
  });

  describe('并发操作', () => {
    test('应该能够处理多个 key 的并发操作', () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key${i}`);
      
      // 批量设置
      keys.forEach((key, i) => {
        cache.setItem(key, `value${i}`);
      });
      
      // 验证所有值
      keys.forEach((key, i) => {
        expect(cache.getItem(key)).toBe(`value${i}`);
      });
      
      expect(cache.length).toBe(100);
    });
  });
});
