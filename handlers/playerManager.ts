import {Telegraf} from "telegraf";
import {IUserRepository} from "../repositories/userRepository";
import {IPlayerRepository} from "../repositories/playerRepository";
import {playerRepository, userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";

export class PlayerManager {
  // nicknames: List<string>;
  bot: Telegraf;
  userRepository: IUserRepository = userRepository;

  constructor(private playerRepository: IPlayerRepository, bot: Telegraf) {
    // this.nicknames = playerRepository.getAllNicknames();
    this.bot = bot;
  }

  async sendMessageToAllRats(message: string) {
    let nicknames = playerRepository.getAllPlayersNicknames(UserType.Rat);

    for (const nickname of nicknames) {
      let user = userRepository.getUser(nickname);

      if (user) {
        await this.bot.telegram.sendMessage(user.chatId, message);
      }
    }
  }

}
