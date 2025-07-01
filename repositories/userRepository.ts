import { User } from "../models/user";
import {UserType} from "../models/userType";
import {List} from "immutable";

export interface IUserRepository {
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

const unregUserMap: Map<string, User> = new Map([
  ["Абрам", { nickname: "Абрам", telegramName: "@Mikhrutka", chatId: -1, userType: UserType.Default }],
  ["Адлер", { nickname: "Адлер", telegramName: "@adler_ua", chatId: -1, userType: UserType.Default }],
  ["Аврора", { nickname: "Аврора", telegramName: "@aurosha", chatId: -1, userType: UserType.Default }],
  ["Архи", { nickname: "Архи", telegramName: "@vadimmigalenko", chatId: -1, userType: UserType.Default }],
  ["Bandera", { nickname: "Bandera", telegramName: "@khakimov_andrew", chatId: -1, userType: UserType.Default }],
  ["Блукач", { nickname: "Блукач", telegramName: "@yurivynnyk", chatId: -1, userType: UserType.Default }],
  ["f5", { nickname: "f5", telegramName: "T.me/armasher", chatId: -1, userType: UserType.Default }],
  ["filister", { nickname: "filister", telegramName: "@F1l1STER", chatId: -1, userType: UserType.Default }],
  ["Franklin", { nickname: "Franklin", telegramName: "https://t.me/frankl1n3", chatId: -1, userType: UserType.Default }],
  ["Грильяж", { nickname: "Грильяж", telegramName: "@grilllage", chatId: -1, userType: UserType.Default }],
  ["Жирафа", { nickname: "Жирафа", telegramName: "@stmargarita", chatId: -1, userType: UserType.Default }],
  ["Инженер", { nickname: "Инженер", telegramName: "https://t.me/andrey_teslya", chatId: -1, userType: UserType.Default }],
  ["Кайфат", { nickname: "Кайфат", telegramName: "@spleanin", chatId: -1, userType: UserType.Default }],
  ["Космічна", { nickname: "Космічна", telegramName: "mary_kos", chatId: -1, userType: UserType.Default }],
  ["Комар", { nickname: "Комар", telegramName: "@Smurfkomar", chatId: -1, userType: UserType.Default }],
  ["Крис", { nickname: "Крис", telegramName: "baranovskayanastya", chatId: -1, userType: UserType.Default }],
  ["Кукла", { nickname: "Кукла", telegramName: "Kyklamarina", chatId: -1, userType: UserType.Default }],
  ["Leklerk", { nickname: "Leklerk", telegramName: "@Leklerk_k", chatId: -1, userType: UserType.Default }],
  ["Логика", { nickname: "Логика", telegramName: "@veizgeim", chatId: -1, userType: UserType.Default }],
  ["Малинити", { nickname: "Малинити", telegramName: "@grubaya", chatId: -1, userType: UserType.Default }],
  ["Марта", { nickname: "Марта", telegramName: "https://t.me/mrs_marta", chatId: -1, userType: UserType.Default }],
  ["Miracle", { nickname: "Miracle", telegramName: "Miracleprg", chatId: -1, userType: UserType.Default }],
  ["Moriarty", { nickname: "Moriarty", telegramName: "t.me/maksimiliansm", chatId: -1, userType: UserType.Default }],
  ["Негрони", { nickname: "Негрони", telegramName: "@nazar_stt", chatId: -1, userType: UserType.Default }],
  ["Певица", { nickname: "Певица", telegramName: "https://t.me/sdaria_s", chatId: -1, userType: UserType.Default }],
  ["Red", { nickname: "Red", telegramName: "@chibirenny", chatId: -1, userType: UserType.Default }],
  ["Sirius", { nickname: "Sirius", telegramName: "@aldoshyn", chatId: -1, userType: UserType.Default }],
  ["Сайфер", { nickname: "Сайфер", telegramName: "@XXRater", chatId: -1, userType: UserType.Default }],
  ["Сокрушитель", { nickname: "Сокрушитель", telegramName: "@mit_zag", chatId: -1, userType: UserType.Default }],
  ["Тони", { nickname: "Тони", telegramName: "https://t.me/gn_t0ny", chatId: -1, userType: UserType.Default }],
  ["Tommy", { nickname: "Tommy", telegramName: "oldangrypirate", chatId: -1, userType: UserType.Default }],
  ["walle", { nickname: "walle", telegramName: "@nikita_pitalenko", chatId: -1, userType: UserType.Default }],
  ["Харюк", { nickname: "Харюк", telegramName: "@ArturSayakhov", chatId: -1, userType: UserType.Default }],
  ["Хирург", { nickname: "Хирург", telegramName: "Highredrose", chatId: -1, userType: UserType.Default }],
  ["Шахматист", { nickname: "Шахматист", telegramName: "@platonich3", chatId: -1, userType: UserType.Default }],
]);
