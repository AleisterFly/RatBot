import {Context} from "telegraf";
import {
    bot,
    userManager,
    commandManager,
    dbManager,
    seriesDB, userRepository, viewerDB, teamDB, phaseDB, viewerManager, messageCommandManager, adminManager
} from "./di/ratProvider";
import {message} from "telegraf/filters";
import fs from 'fs';

// Logging commands
const originalReply = Context.prototype.reply;

Context.prototype.reply = function (...args: Parameters<Context["reply"]>) {
    const chatId = this.chat?.id;
    const username = this.from?.username;
    const text = args[0];

    if (typeof text === 'string') {
        fs.appendFileSync(
            'bot-log.txt',
            `[${new Date().toISOString()}] bot to ${chatId} - ${username}: ${text}\n`
        );
    }

    return originalReply.call(this, ...args);
};

bot.command("show_commands", commandManager.onShowCommands.bind(commandManager));

bot.command("start", onStart);
bot.command("register", userManager.onRegister.bind(userManager));
// bot.command('betting_registration', (ctx) => viewerManager.onRegister(ctx));
// bot.command('guess_rat', (ctx) => voteManager.guessRatVote(ctx));
// bot.command('guess_rat_tour', (ctx) => voteManager.guessRatTourVote(ctx));
//
// //PLAYER
// bot.command("reg_seria", playerManager.registerToSeria.bind(playerManager));
// bot.command("show_reg_seria", playerManager.getRegisterSeries.bind(playerManager));
// bot.command("cancel_reg_seria", playerManager.cancelRegistrationToSeria.bind(playerManager));
//
// //ADMIN
// bot.command("show_players", adminManager.onShowPlayers.bind(adminManager));
// bot.command("select_player", adminManager.onSelectPlayer.bind(adminManager));
// bot.command("update_current", adminManager.updateCurrentSeria.bind(adminManager));
// bot.command("get_current", adminManager.sendCurrentSeria.bind(adminManager));
//
// //SUPER ADMIN
// bot.command("show_players_SUPER", adminManager.onSuperShowPlayers.bind(adminManager));
// // bot.command("create_team", adminManager.sendCurrentSeria.bind(adminManager));
//


async function botTextHandler(ctx: Context) {
    ctx.reply("ПРИВЕТ!");
}

bot.launch();
console.log("Bot is started!");
seriesDB.createTables();
viewerDB.createTables();
teamDB.createTables();
phaseDB.createTables();
dbManager.createTables();
userRepository.saveUnregUsers();
// userRepository.saveAdmins();
seriesDB.initSeries();

bot.on(message("text"), async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    // Logging messages
    const user = `${ctx.from?.id} - ${ctx.from?.username}`;
    const text = ctx.message.text;
    fs.appendFileSync('bot-log.txt', `[${new Date().toISOString()}] ${user}: ${text}\n`);

    if (viewerManager.isInSession(chatId)) {
        await viewerManager.handleText(ctx);
        return;
    }

    if (messageCommandManager.isInSession(chatId)) {
        await messageCommandManager.handleText(ctx);
        return;
    }

    if (adminManager.isInAddTeamSession(chatId)) {
        await adminManager.handleText(ctx);
        return;
    }
});

// Logging buttons
bot.on("callback_query", async (ctx) => {
    const user = `${ctx.from?.id} - ${ctx.from?.username}`;

    if ('data' in ctx.callbackQuery) {
        const data = ctx.callbackQuery.data;
        fs.appendFileSync(
            'bot-log.txt',
            `[${new Date().toISOString()}] ${user}: нажал кнопку "${data}"\n`
        );
    }

    await ctx.answerCbQuery();
});

// TODO: Приветствие
async function onStart(ctx: Context) {
    await ctx.reply("Добро пожаловать!\nЧтобы зарегистрироваться, воспользуйтесь командой /register");
}

function log(entry: string) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('bot-log.txt', `[${timestamp}] ${entry}\n`);
}
