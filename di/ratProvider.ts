import { LocalUserRepository } from "../repositories/userRepository";
import { LocalPlayerRepository } from "../repositories/playerRepository";
import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "../config/tokens";
import { UserManager } from "../handlers/registerUser";
import { PlayerManager } from "../handlers/playerManager";
import { NotificationManager } from "../handlers/notificationManager";
import {ViewerManager} from "../handlers/viewerManager";
import {LocalViewerRepository} from "../repositories/viewerRepository";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
export const userRepository = new LocalUserRepository();
export const playerRepository = new LocalPlayerRepository();
export const viewerRepository = new LocalViewerRepository();
export const playerManager = new PlayerManager(playerRepository, bot);
export const userManager = new UserManager(userRepository, bot);
export const viewerManager = new ViewerManager(viewerRepository, bot);
export const notificationManager = new NotificationManager(userRepository, playerRepository, bot);
