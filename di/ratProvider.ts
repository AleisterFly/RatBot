import { LocalUserRepostory } from "../repositories/userRepository";
import { LocalPlayerRepostory } from "../repositories/playerRepository";
import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "../config/tokens";
import { UserManager } from "../handlers/registerUser";
import { PlayerManager } from "../handlers/playerManager";
import { NotificationManager } from "../handlers/notificationManager";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
export const userRepository = new LocalUserRepostory();
export const playerRepository = new LocalPlayerRepostory();
export const playerManager = new PlayerManager(playerRepository, bot);
export const userManager = new UserManager(userRepository, bot);
export const notificationManager = new NotificationManager(userRepository, bot);
