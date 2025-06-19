import Database from "better-sqlite3";
import { User } from "../models/user";

const db = new Database("db.sqlite");

type UserRow = {
  chat_id: number;
  name: string | null;
  gender: string | null;
  age: number | null;
  prompt: string;
  tokens: number;
  state: number;
  is_subscribed: number;
  free_messages: number;
  payment_data: string;
  history: string;
};

// Создание таблицы
export function createUserTable() {
  //   db.prepare("DROP TABLE IF EXISTS users").run();

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS users (
      chat_id INTEGER PRIMARY KEY,
      name TEXT,
      gender TEXT,
      age INTEGER,
      prompt TEXT,
      tokens INTEGER,
      state INTEGER,
      is_subscribed BOOLEAN,
      free_messages INTEGER,
      payment_data TEXT,
      history TEXT
    );
  `
  ).run();
}
