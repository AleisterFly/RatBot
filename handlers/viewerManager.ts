import { Context, Telegraf } from "telegraf"
import { IViewerRepository } from "../repositories/viewerRepository"
import {message} from "telegraf/filters";
import {userRepository} from "../di/ratProvider";
import {UserType} from "../models/userType";
import {User} from "../models/user";

type RegisterStep = 'nickname'

type RegisterSession = {
    step: RegisterStep,
    nickname?: string,
    telegramName?: string,
    twitchName?: string,
}

export class ViewerManager {
    private registerSessions = new Map<number, RegisterSession>()

    constructor(
        private viewerRepository: IViewerRepository,
        private bot: Telegraf,
    ) {

    }

    async onRegister(ctx: Context) {
        const foundUser = userRepository.getUserByChatId(ctx.chat?.id as number);
        if(foundUser){
            await ctx.reply("Вы уже зарегистрированы.");
            return;
        }

        this.registerGlobalTextHandler();
        console.log(`[ask] Waiting for input:`);
        const chatId = ctx.chat?.id;
        console.log(`[ask] Waiting for input: ${chatId}`);
        if (!chatId) return;

        if (this.registerSessions.has(chatId)) {
            await ctx.reply("Вы уже проходите регистрацию. Завершите её.");
            return;
        }

        this.registerSessions.set(chatId, { step: "nickname" });
        await ctx.reply("Введите ваш никнейм на Twitch");
    }

    private registerGlobalTextHandler() {
        this.bot.on(message("text"), async (ctx) => {

            const chatId = ctx.chat?.id;
            if (!chatId) return;

            const session = this.registerSessions.get(chatId);
            if (!session) return;
            const text = ctx.message.text.trim();

            switch (session.step) {
                case "nickname": {
                    const nickname = text;
                    const chatId = ctx.chat?.id!;
                    const telegramName = ctx.from?.username ?? 'no_username';

                    const foundExistedViewer = this.viewerRepository.getByNickname(nickname);

                    if (foundExistedViewer) {
                        await ctx.reply("Этот ник уже занят. Попробуйте другой или /betting_registration заново.");
                        this.registerSessions.delete(ctx.chat?.id);
                        return;
                    }

                    const user = User.createUser(nickname, telegramName, chatId, UserType.Viewer);
                    userRepository.createUser(user);

                    this.viewerRepository.createViewer(
                        nickname
                    )

                    await ctx.reply(
                        `Вы зарегистрированы как ${nickname}`,
                    )

                    this.registerSessions.delete(chatId)
                    break
                }
            }
        })
    }
}
