import { Seria } from "./seria";
import { List } from "immutable";

enum TourType {
  SELECT_TOUR,
  FIRST_TOUR,
  SECOND_TOUR,
  FINAL_TOUR,
}

export class Tour {
  readonly series: List<Seria>;
  readonly type: TourType;

  constructor() {}
}
