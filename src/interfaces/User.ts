import { EsiProfile } from "./EsiProfile";

export interface User extends Express.User {
  id: number;
  name: string;
  registered: Date;
  mainCharacterId: number;
  characters: EsiProfile[];
}