/**
 * JsonFileCache 配置选项
 */
export interface JsonFileCacheOptions {
  /**
   * 是否自动保存，默认为 true
   */
  autoSave?: boolean;
}

/**
 * 缓存项的内部存储结构
 */
export interface CacheItem<T = any> {
  /**
   * 原始的缓存键名
   */
  key: string;
  
  /**
   * 缓存的值
   */
  value: T;
  
  /**
   * 缓存项创建或更新的时间戳
   */
  timestamp: number;
}

/**
 * 文件路径信息
 */
export interface FilePathInfo {
  /**
   * 文件所在的文件夹路径
   */
  folderPath: string;
  
  /**
   * 完整的文件路径
   */
  filePath: string;
  
  /**
   * key 的 MD5 哈希值
   */
  md5: string;
}

/**
 * 基于本地 JSON 文件的缓存类
 * 
 * 使用 MD5 哈希分片存储策略，将缓存数据分散到多个文件中，
 * 避免单个文件过大导致的性能问题。
 * 
 * @warning 这是一个简易的单进程缓存系统，不支持：
 * - 多进程并发访问
 * - 多线程并发访问
 * - Node.js cluster 集群模式
 * - 分布式环境
 * 
 * 仅适用于单进程、单线程的应用场景，如命令行工具、开发环境等。
 * 
 * @example
 * ```typescript
 * const cache = new JsonFileCache('./cache');
 * 
 * // 设置缓存
 * cache.setItem('username', 'zhangsan');
 * cache.setItem('userInfo', { id: 1, name: 'zhangsan' });
 * 
 * // 获取缓存
 * const username = cache.getItem('username');
 * const userInfo = cache.getItem<{ id: number; name: string }>('userInfo');
 * 
 * // 删除缓存
 * cache.removeItem('username');
 * 
 * // 清空所有缓存
 * cache.clear();
 * ```
 */
export default class JsonFileCache {
  /**
   * 缓存文件存储的根目录路径
   */
  readonly cachePath: string;
  
  /**
   * 缓存配置选项
   */
  readonly options: Required<JsonFileCacheOptions>;
  
  /**
   * 创建一个新的 JsonFileCache 实例
   * 
   * @param cachePath - 缓存文件存储的文件夹路径
   * @param options - 可选的配置选项
   * 
   * @example
   * ```typescript
   * // 使用默认配置
   * const cache = new JsonFileCache('./cache');
   * 
   * // 自定义配置
   * const cache = new JsonFileCache('./cache', { autoSave: false });
   * ```
   */
  constructor(cachePath: string, options?: JsonFileCacheOptions);
  
  /**
   * 设置缓存项
   * 
   * @param key - 缓存键名，必须是字符串
   * @param value - 缓存值，支持任意可序列化的 JavaScript 类型
   * @throws {TypeError} 如果 key 不是字符串
   * 
   * @example
   * ```typescript
   * cache.setItem('username', 'zhangsan');
   * cache.setItem('count', 100);
   * cache.setItem('user', { id: 1, name: 'zhangsan' });
   * cache.setItem('tags', ['nodejs', 'javascript']);
   * ```
   */
  setItem<T = any>(key: string, value: T): void;
  
  /**
   * 获取缓存项
   * 
   * @param key - 缓存键名，必须是字符串
   * @returns 缓存值，如果不存在则返回 null
   * @throws {TypeError} 如果 key 不是字符串
   * 
   * @example
   * ```typescript
   * const username = cache.getItem('username');
   * const user = cache.getItem<{ id: number; name: string }>('user');
   * const count = cache.getItem<number>('count');
   * ```
   */
  getItem<T = any>(key: string): T | null;
  
  /**
   * 删除指定的缓存项
   * 
   * @param key - 缓存键名，必须是字符串
   * @throws {TypeError} 如果 key 不是字符串
   * 
   * @example
   * ```typescript
   * cache.removeItem('username');
   * ```
   */
  removeItem(key: string): void;
  
  /**
   * 清空所有缓存
   * 
   * 此操作会删除所有缓存文件和文件夹
   * 
   * @example
   * ```typescript
   * cache.clear();
   * ```
   */
  clear(): void;
  
  /**
   * 获取所有缓存键名
   * 
   * @returns 所有缓存键名的数组
   * 
   * @example
   * ```typescript
   * const allKeys = cache.keys();
   * console.log(allKeys); // ['username', 'userInfo', 'count']
   * ```
   */
  keys(): string[];
  
  /**
   * 获取缓存项数量
   * 
   * @example
   * ```typescript
   * const count = cache.length;
   * console.log(count); // 3
   * ```
   */
  get length(): number;
  
  /**
   * 对 key 进行 MD5 加密
   * 
   * @internal
   * @param key - 要加密的键名
   * @returns MD5 哈希值
   */
  _getMd5(key: string): string;
  
  /**
   * 根据 key 获取文件路径信息
   * 
   * @internal
   * @param key - 缓存键名
   * @returns 文件路径信息对象
   */
  _getFilePath(key: string): FilePathInfo;
  
  /**
   * 确保目录存在，如果不存在则创建
   * 
   * @internal
   * @param dirPath - 目录路径
   */
  _ensureDir(dirPath: string): void;
  
  /**
   * 读取指定文件的 JSON 数据
   * 
   * @internal
   * @param filePath - 文件路径
   * @returns 解析后的 JSON 对象
   */
  _readFile(filePath: string): Record<string, CacheItem>;
  
  /**
   * 写入 JSON 数据到文件
   * 
   * @internal
   * @param filePath - 文件路径
   * @param data - 要写入的数据
   */
  _writeFile(filePath: string, data: Record<string, CacheItem>): void;
  
  /**
   * 递归删除目录
   * 
   * @internal
   * @param dirPath - 目录路径
   */
  _removeDir(dirPath: string): void;
  
  /**
   * 递归遍历目录获取所有 JSON 文件
   * 
   * @internal
   * @param dirPath - 目录路径
   * @param fileList - 文件列表（用于递归）
   * @returns JSON 文件路径数组
   */
  _getAllJsonFiles(dirPath: string, fileList?: string[]): string[];
}

/**
 * CommonJS 导出
 */
export = JsonFileCache;
