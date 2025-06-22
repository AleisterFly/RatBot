import { Context, Telegraf } from "telegraf"
import { IViewerRepository } from "../repositories/viewerRepository"
import {anyOf, message} from "telegraf/filters";

type RegisterStep = 'nickname' | 'firstName' | 'lastName'

type RegisterSession = {
    step: RegisterStep,
    nickname?: string,
    firstName?: string,
}

export class ViewerManager {
    private registerSessions = new Map<number, RegisterSession>()

    constructor(
        private viewerRepository: IViewerRepository,
        private bot: Telegraf,
    ) {

    }

    async onRegister(ctx: Context) {
        this.registerGlobalTextHandler()
        console.log(`[ask] Waiting for input:`)
        const chatId = ctx.chat?.id
        console.log(`[ask] Waiting for input: ${chatId}`)
        if (!chatId) return

        if (this.registerSessions.has(chatId)) {
            await ctx.reply("Вы уже проходите регистрацию. Завершите её.")
            return
        }

        this.registerSessions.set(chatId, { step: "nickname" })
        await ctx.reply("Введите ваш никнейм:")
    }

    private registerGlobalTextHandler() {
        // this.bot.on(message("text"), botTextHandler);
        this.bot.on(message("text"), async (ctx) => {


            const chatId = ctx.chat?.id
            if (!chatId) return

            const session = this.registerSessions.get(chatId)
            if (!session) return
            const text = ctx.message.text.trim()

            switch (session.step) {
                case "nickname": {
                    console.log(`nickname:`)
                    const exists = this.viewerRepository.getByNickname(text)
                    if (exists) {
                        await ctx.reply("Этот ник уже занят. Попробуйте другой или /register заново.")
                        this.registerSessions.delete(chatId)
                        return
                    }

                    session.nickname = text
                    session.step = "firstName"
                    await ctx.reply("Введите ваше имя:")
                    break
                }

                case "firstName": {
                    console.log(`firstName:`)
                    session.firstName = text
                    session.step = "lastName"
                    await ctx.reply("Введите вашу фамилию:")
                    break
                }

                case "lastName": {
                    const nickname = session.nickname!
                    const firstName = session.firstName!
                    const lastName = text

                    this.viewerRepository.createViewer(
                        nickname
                    )

                    await ctx.reply(
                        `Вы зарегистрированы как ${firstName} ${lastName} (${nickname})`,
                    )

                    this.registerSessions.delete(chatId)
                    break
                }
            }
        })
    }
}
