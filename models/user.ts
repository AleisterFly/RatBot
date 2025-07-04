import {UserType} from "./userType";

export class User {
  public nickname: string;
  public telegramName: string;
  public chatId: number;
  public userType: UserType = UserType.Default;

  constructor(nickname: string, telegramName: string, chatId: number, userType: UserType) {
    this.nickname = nickname;
    this.telegramName = telegramName;
    this.chatId = chatId;
    this.userType = userType;
  }

  static createUser(nickname: string, telegramName: string, chatId: number, userType: UserType): User {
    return new User(nickname, telegramName, chatId, userType);
  }
}
