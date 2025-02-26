export class DB {
  static dbName = 'twitterSearch';
  static version = 1;
  
  static async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create search history table - using contract address as primary key
        if (!db.objectStoreNames.contains('searchHistory')) {
          const store = db.createObjectStore('searchHistory', { keyPath: 'query' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          // Add index for avatar field
          store.createIndex('avatar', 'avatar', { unique: false });
        }
        
        // Create token information table
        if (!db.objectStoreNames.contains('tokenInfo')) {
          const store = db.createObjectStore('tokenInfo', { keyPath: 'address' });
          store.createIndex('name', 'name', { unique: false });
        }
      };
      
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  static async addSearchHistory(item) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('searchHistory', 'readwrite');
      const store = transaction.objectStore('searchHistory');
      
      // If it's contract mode, only update timestamp
      if (item.mode === 'contract') {
        const request = store.get(item.query);
        request.onsuccess = () => {
          const existingData = request.result;
          if (existingData) {
            // Only update timestamp
            store.put({
              ...existingData,
              timestamp: item.timestamp
            });
          } else {
            // Add new record
            store.put(item);
          }
          resolve();
        };
      } else {
        // User mode directly adds new record
        store.put(item);
        resolve();
      }
    });
  }
  
  static async getSearchHistory() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('searchHistory', 'readonly');
      const store = transaction.objectStore('searchHistory');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      const items = [];
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          items.push(cursor.value);
          if (items.length < 20) {
            cursor.continue();
          } else {
            resolve(items);
          }
        } else {
          resolve(items);
        }
      };
    });
  }
  
  static async clearSearchHistory() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('searchHistory', 'readwrite');
      const store = transaction.objectStore('searchHistory');
      
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  static async addTokenInfo(tokenInfo) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tokenInfo', 'readwrite');
      const store = transaction.objectStore('tokenInfo');
      
      const request = store.put(tokenInfo);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  static async getTokenInfo(address) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tokenInfo', 'readonly');
      const store = transaction.objectStore('tokenInfo');
      
      const request = store.get(address);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
} 