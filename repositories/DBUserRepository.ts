import {IUserRepository} from "./userRepository";
import {User} from "../models/user";
import {dbManager} from "../di/ratProvider";
import {List} from "immutable";
import {UserType} from "../models/userType";

const unregUsers = [
    { nickname: "Малинити", telegramName: "@grubaya" },
    { nickname: "Певица", telegramName: "https://t.me/sdaria_s" },
    { nickname: "Bandera", telegramName: "@khakimov_andrew" },
    { nickname: "Логика", telegramName: "@veizgeim" },
    { nickname: "Тони", telegramName: "https://t.me/gn_t0ny" },
    { nickname: "Космічна", telegramName: "mary_kos" },
    { nickname: "Архи", telegramName: "@vadimmigalenko" },
    { nickname: "Кайфат", telegramName: "@spleanin" },
    { nickname: "Сокрушитель", telegramName: "@mit_zag" },
    { nickname: "f5", telegramName: "T.me/armasher" },
    { nickname: "Leklerk", telegramName: "@Leklerk_k" },
    { nickname: "Марта", telegramName: "https://t.me/mrs_marta" },
    { nickname: "Крис", telegramName: "baranovskayanastya" },
    { nickname: "Аврора", telegramName: "@aurosha" },
    { nickname: "Инженер", telegramName: "https://t.me/andrey_teslya" },
    { nickname: "Комар", telegramName: "@Smurfkomar" },
    { nickname: "Sirius", telegramName: "@aldoshyn" },
    { nickname: "Жирафа", telegramName: "@stmargarita" },
    { nickname: "Miracle", telegramName: "Miracleprg" },
    { nickname: "Абрам", telegramName: "@Mikhrutka" },
    { nickname: "Кукла", telegramName: "Kyklamarina" },
    { nickname: "Хирург", telegramName: "Highredrose" },
    { nickname: "Адлер", telegramName: "@adler_ua" },
    { nickname: "Шахматист", telegramName: "@platonich3" },
    { nickname: "Tommy", telegramName: "oldangrypirate" },
    { nickname: "filister", telegramName: "@F1l1STER" },
    { nickname: "Харюк", telegramName: "@ArturSayakhov" },
    { nickname: "walle", telegramName: "@nikita_pitalenko" },
    { nickname: "Блукач", telegramName: "@yurivynnyk" },
    { nickname: "Red", telegramName: "@chibirenny" },
    { nickname: "Негрони", telegramName: "@nazar_stt" },
    { nickname: "Сайфер", telegramName: "@XXRater" },
    { nickname: "Moriarty", telegramName: "t.me/maksimiliansm" },
    { nickname: "Бембі", telegramName: "Bembiiii" },
    { nickname: "Snoopy:)", telegramName: "snoopy_ua" }
];


export class DBUserRepository implements IUserRepository {

    deleteRegUser(nickname: string): void {
        dbManager.deleteUserByNickname(nickname);
    }

    getRegChatIds(): List<number> {
        return List<number>();
    }

    getRegUser(chatId: number | undefined): User | undefined {
        return dbManager.getUserByChatId(chatId ? chatId : -1);
    }

    getReservationNumber(nickname: string): number {
        return 0;
    }

    getUnregNicknames(): List<string> {
        return dbManager.getAllNicknames()
    }

    getUnregUser(nickname: string): User | undefined {
        return dbManager.getUserByNickname(nickname, UserType.UnregPlayer);
    }

    getUser(nickname: string): User | undefined {
        return dbManager.getUserByNickname(nickname);
    }

    saveUnregUsers(): void {
        for (const unregUser of unregUsers) {
            const exists = dbManager.getUserByNickname(unregUser.nickname);
            if (!exists) {
                dbManager.addUser(unregUser.nickname, unregUser.telegramName, -1, UserType.UnregPlayer);
            }
        }
    }

    updateUser(user: User): void {
        dbManager.updateUser(user);
    }

    registerUser(user: User): number {
        console.log(dbManager.getUserByChatId(user.chatId));
        if (dbManager.getUserByChatId(user.chatId)
            // || dbManager.getUserByNickname(user.nickname)?.userType != UserType.UnregPlayer
        )
        {
            return -1;
        } else {
            dbManager.addUser(user.nickname, user.telegramName, user.chatId, user.userType);
        }
        return 0;
    }
}