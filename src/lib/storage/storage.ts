type StorageKey = string;

const canUseStorage = () => typeof window !== "undefined" && window.localStorage !== undefined;

export const storage = {
  get<T>(key: StorageKey, fallback: T): T {
    if (!canUseStorage()) return fallback;

    const value = window.localStorage.getItem(key);
    if (!value) return fallback;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Unable to read local storage key "${key}".`, error);
      return fallback;
    }
  },

  set<T>(key: StorageKey, value: T): void {
    if (canUseStorage()) window.localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: StorageKey): void {
    if (canUseStorage()) window.localStorage.removeItem(key);
  },

  update<T>(key: StorageKey, updater: (current: T) => T, fallback: T): T {
    const nextValue = updater(this.get(key, fallback));
    this.set(key, nextValue);
    return nextValue;
  },
};
