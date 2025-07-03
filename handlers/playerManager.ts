import {Context, Telegraf} from "telegraf";
import {IPlayerRepository} from "../repositories/playerRepository";
import {seriesRepository, userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";


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

        // Дальнейшая логика
    }

    async getRegisterSeries(ctx: Context) {
      const chatId = ctx.chat?.id;
      if (!chatId) return;

        const message = "Ты зарегистрирован!";
        const currentUser = userRepository.getRegUser(chatId);
      // Дальнейшая логика
    }

    async cancelRegistrationToSeria(ctx: Context) {
        const message = "Твоя регистрация отменена.";
      const chatId = ctx.chat?.id;
      if (!chatId) return;
      const currentUser = userRepository.getRegUser(chatId);
      // Дальнейшая логика
    }
}
