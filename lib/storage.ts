import { MMKV } from 'react-native-mmkv';

// We create a safe wrapper to prevent crashes if the native module is missing (e.g. in Expo Go or Web)
let storage: any;

try {
  storage = new MMKV();
} catch (e) {
  console.warn('MMKV could not be initialized. Falling back to in-memory storage.');
  // Simple in-memory fallback for development/web
  const mem = new Map();
  storage = {
    set: (key: string, value: any) => mem.set(key, value),
    getBoolean: (key: string) => mem.get(key),
    getString: (key: string) => mem.get(key),
    getNumber: (key: string) => mem.get(key),
    delete: (key: string) => mem.delete(key),
  };
}

export { storage };
