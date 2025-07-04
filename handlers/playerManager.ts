import {Context, Markup, Telegraf} from "telegraf";
import {IPlayerRepository} from "../repositories/playerRepository";
import {seriesRepository, userRepository} from "../di/ratProvider";
import {chunk, formatInColumns} from "../utils/util";

const NUMBER_OF_COLUMNS = 3;

export class PlayerManager {

    bot: Telegraf;

    constructor(
        private playerRepository: IPlayerRepository,
        bot: Telegraf
    ) {
        this.bot = bot;
    }

    async registerToSeria(ctx: Context) {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const currentUser = userRepository.getRegUser(chatId);
      const currentSeries = seriesRepository.getCurrentTourSeries();

      if (currentSeries) {
        const buttons = chunk(
            currentSeries
                .map((seria) => Markup.button.callback(seria.date, `register_to_series:${seria.date}`))
                .toArray(), // <-- ключ!
            NUMBER_OF_COLUMNS
        );

        await ctx.reply("Выбери серию для регистрации", {
          parse_mode: "HTML",
          reply_markup: Markup.inlineKeyboard(buttons).reply_markup,
        });

        this.bot.action(/^register_to_series:(.*)$/, async (ctx) => {
          const chatId = ctx.chat?.id as number;
          const messageId = ctx.callbackQuery?.message?.message_id as number;
          await ctx.telegram.deleteMessage(chatId, messageId);
          const seriaDate = ctx.match[1];

          const selectSeria = currentSeries.find((s) => s.date === seriaDate);
          if(currentUser && selectSeria) {

            if (selectSeria.regNicknames.contains(currentUser.nickname)) {

              await ctx.reply(`Вы уже были зарегистрированы на эту серию!`);
            } else {
              selectSeria.regNicknames = selectSeria.regNicknames.push(currentUser.nickname);
              seriesRepository.updateSeria(selectSeria);

              await ctx.reply(`Вы зарегистрировались на серию : ${seriaDate}`);
            }
          }
        });
      }
    }

    async getRegisterSeries(ctx: Context) {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

      const currentUser = userRepository.getRegUser(chatId);
      const currentSeries = seriesRepository.getCurrentTourSeries();
      if (currentSeries && currentUser) {
        const registeredDates = currentSeries
            .filter((seria) => seria.regNicknames.includes(currentUser.nickname))
            .map((seria) => seria.date);

        let text = formatInColumns(registeredDates, NUMBER_OF_COLUMNS);

        await ctx.reply("Вы зарегистрированы на:\n\n" + text, {
          parse_mode: "HTML",
        });
      }
    }

    async cancelRegistrationToSeria(ctx: Context) {
        const message = "Твоя регистрация отменена.";
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const currentUser = userRepository.getRegUser(chatId);
        const currentSeries = seriesRepository.getCurrentTourSeries();
        if (currentSeries && currentUser) {
            currentSeries.forEach((seria) => {
                if (seria.regNicknames.includes(currentUser.nickname)) {
                    seria.regNicknames = seria.regNicknames.filter(nick => nick !== currentUser.nickname);
                    seriesRepository.updateSeria(seria);
                }
            });
        }
        await ctx.reply(message, {
            parse_mode: "HTML",
        });
    }
}
