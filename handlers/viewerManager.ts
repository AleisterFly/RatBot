import { Context, Telegraf } from "telegraf";
import { IViewerRepository } from "../repositories/viewerRepository";
import { userRepository } from "../di/ratProvider";
import { UserType } from "../models/userType";
import { User } from "../models/user";

type RegisterStep = 'nickname';

type RegisterSession = {
    step: RegisterStep;
    nickname?: string;
    telegramName?: string;
    twitchName?: string;
};

export class ViewerManager {
    private registerSessions = new Map<number, RegisterSession>();

    constructor(
        private viewerRepository: IViewerRepository,
        private bot: Telegraf
    ) {}

    async onRegister(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const foundUser = userRepository.getUserByChatId(chatId);
        if (foundUser) {
            await ctx.reply("Вы уже зарегистрированы.");
            return;
        }

        if (this.registerSessions.has(chatId)) {
            await ctx.reply("Вы уже проходите регистрацию. Завершите её.");
            return;
        }

        this.registerSessions.set(chatId, { step: "nickname" });
        await ctx.reply("Введите ваш никнейм на Twitch");
    }

    isInSession(chatId: number): boolean {
        return this.registerSessions.has(chatId);
    }

    async handleText(ctx: Context) {
        const chatId = ctx.chat?.id;
        if (!chatId) return;

        const session = this.registerSessions.get(chatId);
        if (!session) return;

        if (!ctx.message || typeof ctx.message !== 'object' || !('text' in ctx.message)) return;
        const text = (ctx.message as { text: string }).text.trim();

        switch (session.step) {
            case "nickname": {
                const nickname = text;
                const telegramName = ctx.from?.username ?? 'no_username';

                if(nickname.length > 12) {
                    await ctx.reply("Этот ник слишком длинный. Зарегистрируйтесь заново.");
                    this.registerSessions.delete(chatId);
                    return;
                }

                const foundExistedViewer = this.viewerRepository.getByNickname(nickname);
                if (foundExistedViewer) {
                    await ctx.reply("Этот ник уже занят. Попробуйте зарегистрироваться заново с другим ником.");
                    this.registerSessions.delete(chatId);
                    return;
                }

                const user = User.createUser(nickname, telegramName, chatId, UserType.Viewer);
                userRepository.createUser(user);
                this.viewerRepository.createViewer(nickname);

                await ctx.reply(`Вы зарегистрированы как ${nickname}`);
                this.registerSessions.delete(chatId);
                break;
            }
        }
    }
}
