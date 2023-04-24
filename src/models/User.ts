// @ts-nocheck

import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { EsiProfile } from "./EsiProfile"; // Import the EsiProfile model, which you'll create next

@Table
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ unique: true })
  name: string;

  @CreatedAt
  @Column
  registered: Date;

  @Column
  mainCharacterId: number;

  @HasMany(() => EsiProfile)
  characters: EsiProfile[];

  getEsiProfiles(): EsiProfile[] {
    return this.characters;
  }
}
