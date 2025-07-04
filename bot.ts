import { Telegraf, Context } from "telegraf";
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
bot.command("show_reg_seria", playerManager.getRegisterSeries.bind(playerManager));
bot.command("cancel_reg_seria", playerManager.cancelRegistrationToSeria.bind(playerManager));




//ADMIN
bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));
bot.command("select_player", adminManager.onSelectPlayer.bind(adminManager));
bot.command("update_current", adminManager.updateCurrentSeria.bind(adminManager));


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
