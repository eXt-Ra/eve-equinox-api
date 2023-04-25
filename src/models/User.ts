// @ts-nocheck
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  HasMany,
  Index
} from "sequelize-typescript";
import { EsiProfile } from "./EsiProfile"; // Import the EsiProfile model, which you'll create next

@Table
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Index({
    unique: true,
  })
  @Column()
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
