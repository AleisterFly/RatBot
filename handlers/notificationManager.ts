import { Context, Markup, Telegraf } from "telegraf";
import { IUserRepostory } from "../repositories/userRepository";
import { User } from "../models/user";

export interface INotificationManager {
  sendMessageToAll(message: string): void;
}

export class NotificationManager {
  bot: Telegraf;

  constructor(private repository: IUserRepostory, bot: Telegraf) {
    this.bot = bot;
  }

  async sendMessageToAll(message: string) {
    let regChatIds = this.repository.getRegChatIds();

    for (const id of regChatIds) {
      await this.bot.telegram.sendMessage(id, message);
    }
  }
}
