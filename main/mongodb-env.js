const Store = require('electron-store');
const store = new Store();
// Store configuration
store.set('mongoUri', 'mongodb://localhost:27017/farm');