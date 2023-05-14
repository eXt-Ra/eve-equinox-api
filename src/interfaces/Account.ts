import { EsiProfile } from "../database/schema";
import { User } from "../database/schema";

export interface Account {
  user: User;
  esiProfiles: EsiProfile[];
}