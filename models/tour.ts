import { List } from "immutable";
import {Seria} from "./player/series";
import {StageType} from "./player/stageType";

export class Tour {
  readonly series: List<Seria>;
  readonly type: StageType;

  constructor() {}
}
