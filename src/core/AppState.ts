import { IStorage } from '../lib/storage/IStorage';
import { LocalStorage } from '../lib/storage/LocalStorage';

/**
 * Simple state management for the application
 */
class AppState {
  private _currentPage: 'builder' | 'simulation' = 'builder';
  private _storage: IStorage = new LocalStorage();
  private _listeners: { [key: string]: Function[] } = {};
  private _selectedLayoutId: string | null = null;

  get currentPage() {
    return this._currentPage;
  }

  set currentPage(page: 'builder' | 'simulation') {
    const oldPage = this._currentPage;
    this._currentPage = page;
    this.emit('pageChanged', { oldPage, newPage: page });
  }

  get storage() {
    return this._storage;
  }

  setStorage(storage: IStorage) {
    this._storage = storage;
    this.emit('storageChanged', storage);
  }
  
  get selectedLayoutId() {
    return this._selectedLayoutId;
  }
  
  set selectedLayoutId(layoutId: string | null) {
    this._selectedLayoutId = layoutId;
    this.emit('selectedLayoutChanged', layoutId);
  }

  on(event: string, callback: Function) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => callback(data));
    }
  }
}

export const appState = new AppState();
