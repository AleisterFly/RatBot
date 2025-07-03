import { Telegraf, Context } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "./config/tokens";
import { message } from "telegraf/filters";
import { UserManager } from "./handlers/registerUser";
import { LocalUserRepository } from "./repositories/userRepository";
import {
  bot,
  userManager,
  adminManager,
  notificationManager,
  viewerManager,
  dbManager,
  seriesDB, voteManager, userRepository, playerManager
} from "./di/ratProvider";
import {User} from "./models/user";

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
// bot.command("betting_registration", viewerManager.onRegister.bind(viewerManager));
bot.command('betting_registration', (ctx) => viewerManager.onRegister(ctx));
// bot.command("send_all", notificationManager.sendMessageToAll.bind("sdfsdf"));
bot.command('guess_rat', (ctx) => voteManager.onRatVote(ctx));

// bot.on(message("text"), botTextHandler);
//PLAYER
bot.command("reg_seria", playerManager.registerToSeria.bind(playerManager));



//ADMIN
bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));
bot.command("select_player", adminManager.onSelectPlayer.bind(adminManager));

async function botTextHandler(ctx: Context) {
  ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");
seriesDB.createTables();
dbManager.createTables();
userRepository.saveUnregUsers();
seriesDB.initSeries()

// TODO: Приветствие
async function onStart(ctx: Context) {
  ctx.reply("Добро пожаловать!");
}
