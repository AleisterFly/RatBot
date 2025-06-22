import { Telegraf, Context } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "./config/tokens";
import { message } from "telegraf/filters";
import { UserManager } from "./handlers/registerUser";
import { LocalUserRepository } from "./repositories/userRepository";
import { bot, userManager, notificationManager } from "./di/ratProvider";

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
bot.command("bet_registration", userManager.onRegister.bind(userManager));
// bot.command("send_all", notificationManager.sendMessageToAll.bind("sdfsdf"));

bot.on(message("text"), botTextHandler);

async function botTextHandler(ctx: Context) {
  ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");

// TODO: Приветствие
async function onStart(ctx: Context) {
  ctx.reply("Добро пожаловать!");
}
