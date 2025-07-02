import { Telegraf, Context } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "./config/tokens";
import { message } from "telegraf/filters";
import { UserManager } from "./handlers/registerUser";
import { LocalUserRepository } from "./repositories/userRepository";
import {bot, userManager, adminManager, notificationManager, viewerManager, dbManager, dbUserRepository} from "./di/ratProvider";
import {User} from "./models/user";

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
// bot.command("betting_registration", viewerManager.onRegister.bind(viewerManager));
bot.command('betting_registration', (ctx) => viewerManager.onRegister(ctx));
// bot.command("send_all", notificationManager.sendMessageToAll.bind("sdfsdf"));

// bot.on(message("text"), botTextHandler);

//ADMIN
bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));

async function botTextHandler(ctx: Context) {
  ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");
dbManager.createTables();
dbUserRepository.saveUnregUsers();

// TODO: Приветствие
async function onStart(ctx: Context) {
  ctx.reply("Добро пожаловать!");
}
