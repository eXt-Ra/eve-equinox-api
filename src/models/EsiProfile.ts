
// @ts-nocheck
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { DataTypes } from 'sequelize';
import { User } from "./User";

@Table
export class EsiProfile extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ unique: true })
  CharacterID: number;

  @Column
  CharacterName: string;

  @Column({ type: DataTypes.TEXT })
  accessToken: string;

  @Column({ type: DataTypes.TEXT })
  refreshToken: string;

  @Column
  ExpiresOn: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
