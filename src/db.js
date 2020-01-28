import Dexie from 'dexie';

const db = new Dexie('GameDB');
db.version(1).stores({ games: 'gameId' });

export default db;