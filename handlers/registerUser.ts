import { Context, Markup, Telegraf } from "telegraf";
import { IUserRepository } from "../repositories/userRepository";
import {
  notificationManager,
  playerRepository,
  playerManager,
} from "../di/ratProvider";

enum ConfirmationType {
  YES = "Да",
  NO = "Нет",
}

const NUMBER_OF_COLUMNS = 5;

const selectConfirmation: string[] = [
  ConfirmationType.YES,
  ConfirmationType.NO,
];

export class UserManager {
  nicknames: string[];
  bot: Telegraf;

  constructor(private repository: IUserRepository, bot: Telegraf) {
    this.nicknames = repository.getUnregNicknames();
    this.bot = bot;
  }

  async onRegister(ctx: Context) {
    let regUser = this.repository.getRegUser(ctx.chat?.id);
    if (regUser != undefined) {
      await ctx.reply(`${regUser.nickname}, вы уже были зарегистрированы!`);
      return;
    }

    const buttons = this.chunk(
      this.nicknames.map((name) =>
        Markup.button.callback(name, `register_nickname:${name}`)
      ),
      NUMBER_OF_COLUMNS
    );

    await ctx.reply("Выбери свой ник из списка", {
      parse_mode: "HTML",
      reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
    });

    this.bot.action(/^register_nickname:(.*)$/, async (ctx) => {
      const chatId = ctx.chat?.id as number;
      const messageId = ctx.callbackQuery?.message?.message_id as number;
      await ctx.telegram.deleteMessage(chatId, messageId);

      const nickname = ctx.match[1];

      await ctx.answerCbQuery(`Вы выбрали ник: ${nickname}`);
      // await ctx.reply(`Ник <b>${nickname}</b> зарегистрирован.`, {
      //   parse_mode: "HTML",
      // });

      const buttons = this.chunk(
        selectConfirmation.map((select) =>
          Markup.button.callback(select, `on_confirm:${select}|${nickname}`)
        ),
        selectConfirmation.length
      );

      await ctx.reply(`Вы уверены, что ваш ник - ${nickname} ?`, {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
      });
    });

    this.bot.action(/^on_confirm:(.*)$/, async (ctx) => {
      const chatId = ctx.chat?.id as number;
      const messageId = ctx.callbackQuery?.message?.message_id as number;
      await ctx.telegram.deleteMessage(chatId, messageId);

      const data = ctx.match[1]; // пример: "Да|А"
      const [select, nickname] = data.split("|");

      switch (select) {
        case ConfirmationType.YES:
          let unregUser = this.repository.getUnregUser(nickname);
          let regUser = this.repository.getUser(nickname);
          if (unregUser == undefined) {
            throw Error();
          } else if (regUser != undefined) {
            await ctx.reply(
              `Участник с ником ${nickname} уже был зарегистрирован!`
            );
            await this.onRegister(ctx);
            return;
          } else {
            unregUser.chatId = chatId;
            let regNumber = this.repository.saveUser(unregUser);
            playerRepository.createPlayer(nickname);

            if (regNumber != 2) {
              playerRepository.updateIsRat(nickname, true);
            }

            playerManager.sendMessageToAllRats(
              `Участник номер ${regNumber} (${nickname}) успешно зарегистрирован!`
            );

            // await ctx.reply(
            //   `Участник номер ${regNumber} (${nickname}) успешно зарегистрирован!`
            // );
            return;
          }

        case ConfirmationType.NO:
          await this.onRegister(ctx);
          return;

        default:
          return;
      }
    });
  }

  chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
