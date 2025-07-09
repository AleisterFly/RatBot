import { Context, Markup, Telegraf } from "telegraf";
import { IViewerRepository } from "../../repositories/viewerRepository";
import {GuessRat} from "./guessRat";
import {GuessRatTour} from "./guessRatTour";

export class VoteManager {
    private guessRat: GuessRat
    private guessRatTour: GuessRatTour

    constructor(
        private bot: Telegraf,
    ) {
        this.guessRat = new GuessRat(this.bot);
        this.guessRatTour = new GuessRatTour(this.bot);
    }

    async guessRatVote(ctx: Context){
        await this.guessRat.onRatVote(ctx);
    }

    async guessRatTourVote(ctx: Context){
        await this.guessRatTour.onRatVote(ctx);
    }
}
