import { User } from "../models/user";
import {List} from "immutable";
import {unregUserMap} from "../config/unregUserMap";
import {dbManager} from "../di/ratProvider";

export interface IUserRepository {
  createUser(user: User): User;

  getRegChatIds(): List<number>;
  getRegUser(chatId: number | undefined): User | undefined;
  getUser(nickname: string): User | undefined;
  registerUser(user: User): number;
  updateUser(user: User): void;

  getUnregUser(nickname: string): User | undefined;
  getUnregNicknames(): List<string>;
  deleteRegUser(nickname: string): void;
}

export class LocalUserRepository implements IUserRepository {
  readonly regUsers: Map<string, User> = new Map();

  constructor() {}

  createUser(user: User): User {
    dbManager.addUser(user.nickname, user.telegramName, user.chatId, user.userType);
    return user;
  }

  updateUser(user: User): void {
        throw new Error("Method not implemented.");
    }

  getRegChatIds(): List<number> {
    let regChatIds: List<number> = List<number>();
    for (const user of this.regUsers.values()) {
      if (user.chatId != -1) {
        regChatIds.push(user.chatId);
      }
    }
    return regChatIds;
  }

  getRegUser(chatId: number | undefined): User | undefined {
    if (chatId == undefined) {
      return undefined;
    }

    for (const user of this.regUsers.values()) {
      if (user.chatId === chatId) {
        return user;
      }
    }
    return undefined;
  }

  getUser(nickname: string): User | undefined {
    return this.regUsers.get(nickname);
  }

  registerUser(user: User): number {
    if (this.regUsers.get(user.nickname) != undefined) {
      return -1;
    } else {
      let count = this.regUsers.size;
      this.regUsers.set(user.nickname, user);
      return this.regUsers.size;
    }
  }

  getUnregUser(nickname: string): User | undefined {
    return unregUserMap.get(nickname);
  }

  getUnregNicknames(): List<string> {
    return List(Array.from(unregUserMap.keys()));
  }

  deleteRegUser(nickname: string): void {
    this.regUsers.delete(nickname);
  }
}
