import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export function createDatabase(dbPath: string): DatabaseSync {
  const absolutePath = resolve(process.cwd(), dbPath);
  mkdirSync(dirname(absolutePath), { recursive: true });

  const db = new DatabaseSync(absolutePath);
  db.exec('PRAGMA journal_mode = WAL;');

  return db;
}
