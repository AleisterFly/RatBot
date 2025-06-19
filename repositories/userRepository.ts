import { User } from "../models/user";

export interface IUserRepostory {
  getReservationNumber(nickname: string): number;
  getRegChatIds(): number[];
  getRegUser(chatId: number | undefined): User | undefined;
  getUser(nickname: string): User | undefined;
  saveUser(user: User): number;

  getUnregUser(nickname: string): User | undefined;
  getUnregNicknames(): string[];
  deleteRegUser(nickname: string): void;
}

export class LocalUserRepostory implements IUserRepostory {
  readonly regUsers: Map<string, User> = new Map();

  constructor() {}

  getReservationNumber(nickname: string): number {
    return this.getUser(nickname)?.regNumber ?? -1;
  }

  getRegChatIds(): number[] {
    let regChatIds: number[] = [];
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

  saveUser(user: User): number {
    if (this.regUsers.get(user.nickname) != undefined) {
      return -1;
    } else {
      let count = this.regUsers.size;
      user.regNumber = count + 1;
      this.regUsers.set(user.nickname, user);
      return this.regUsers.size;
    }
  }

  getUnregUser(nickname: string): User | undefined {
    return unregUserMap.get(nickname);
  }

  getUnregNicknames(): string[] {
    return Array.from(unregUserMap.keys());
  }

  deleteRegUser(nickname: string): void {
    this.regUsers.delete(nickname);
  }
}

const unregUserMap: Map<string, User> = new Map([
  [
    "Абрам",
    {
      nickname: "Абрам",
      telegramName: "@Mikhrutka",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Адлер",
    { nickname: "Адлер", telegramName: "@adler_ua", chatId: -1, regNumber: -1 },
  ],
  [
    "Аврора",
    { nickname: "Аврора", telegramName: "@aurosha", chatId: -1, regNumber: -1 },
  ],
  [
    "Архи",
    {
      nickname: "Архи",
      telegramName: "@vadimmigalenko",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Bandera",
    {
      nickname: "Bandera",
      telegramName: "@khakimov_andrew",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Блукач",
    {
      nickname: "Блукач",
      telegramName: "@yurivynnyk",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "f5",
    {
      nickname: "f5",
      telegramName: "T.me/armasher",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "filister",
    {
      nickname: "filister",
      telegramName: "@F1l1STER",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Franklin",
    {
      nickname: "Franklin",
      telegramName: "https://t.me/frankl1n3",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Грильяж",
    {
      nickname: "Грильяж",
      telegramName: "@grilllage",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Жирафа",
    {
      nickname: "Жирафа",
      telegramName: "@stmargarita",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Инженер",
    {
      nickname: "Инженер",
      telegramName: "https://t.me/andrey_teslya",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Кайфат",
    {
      nickname: "Кайфат",
      telegramName: "@spleanin",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Космічна",
    {
      nickname: "Космічна",
      telegramName: "mary_kos",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Комар",
    {
      nickname: "Комар",
      telegramName: "@Smurfkomar",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Крис",
    {
      nickname: "Крис",
      telegramName: "baranovskayanastya",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Кукла",
    {
      nickname: "Кукла",
      telegramName: "Kyklamarina",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Leklerk",
    {
      nickname: "Leklerk",
      telegramName: "@Leklerk_k",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Логика",
    {
      nickname: "Логика",
      telegramName: "@veizgeim",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Малинити",
    {
      nickname: "Малинити",
      telegramName: "@grubaya",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Марта",
    {
      nickname: "Марта",
      telegramName: "https://t.me/mrs_marta",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Miracle",
    {
      nickname: "Miracle",
      telegramName: "Miracleprg",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Moriarty",
    {
      nickname: "Moriarty",
      telegramName: "t.me/maksimiliansm",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Негрони",
    {
      nickname: "Негрони",
      telegramName: "@nazar_stt",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Певица",
    {
      nickname: "Певица",
      telegramName: "https://t.me/sdaria_s",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Red",
    { nickname: "Red", telegramName: "@chibirenny", chatId: -1, regNumber: -1 },
  ],
  [
    "Sirius",
    {
      nickname: "Sirius",
      telegramName: "@aldoshyn",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Сайфер",
    { nickname: "Сайфер", telegramName: "@XXRater", chatId: -1, regNumber: -1 },
  ],
  [
    "Сокрушитель",
    {
      nickname: "Сокрушитель",
      telegramName: "@mit_zag",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Тони",
    {
      nickname: "Тони",
      telegramName: "https://t.me/gn_t0ny",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Tommy",
    {
      nickname: "Tommy",
      telegramName: "oldangrypirate",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "walle",
    {
      nickname: "walle",
      telegramName: "@nikita_pitalenko",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Харюк",
    {
      nickname: "Харюк",
      telegramName: "@ArturSayakhov",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Хирург",
    {
      nickname: "Хирург",
      telegramName: "Highredrose",
      chatId: -1,
      regNumber: -1,
    },
  ],
  [
    "Шахматист",
    {
      nickname: "Шахматист",
      telegramName: "@platonich3",
      chatId: -1,
      regNumber: -1,
    },
  ],
]);
