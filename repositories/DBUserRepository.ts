import {IUserRepository} from "./userRepository";
import {User} from "../models/user";
import {dbManager} from "../di/ratProvider";
import {List} from "immutable";
import {UserType} from "../models/userType";
import {unregUsers} from "./unregUserMap";

export class DBUserRepository implements IUserRepository {
    createUser(user: User): User {
        dbManager.addUser(user.nickname, user.telegramName, user.chatId, user.userType);
        return user;
    }

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
        return dbManager.getAllNicknames(UserType.UnregPlayer)
    }

    getUnregUser(nickname: string): User | undefined {
        return dbManager.getUserByNickname(nickname, UserType.UnregPlayer);
    }

    getUser(nickname: string): User | undefined {
        return dbManager.getUserByNickname(nickname);
    }

    getUserByChatId(chatId: number): User | undefined {
        return dbManager.getUserByChatId(chatId);
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