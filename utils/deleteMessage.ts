import {Context} from "telegraf";

export async function deleteMessage(ctx: Context) {
    const chatId = ctx.chat?.id as number;
    const messageId = ctx.callbackQuery?.message?.message_id as number;
    if (chatId && messageId) {
        await ctx.telegram.deleteMessage(chatId, messageId);
    }
}