/* eslint-disable @typescript-eslint/no-use-before-define */
import { InferModel } from "drizzle-orm";
import { pgTable, pgEnum, pgSchema, AnyPgColumn, uniqueIndex, foreignKey, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const esiProfiles = pgTable("EsiProfiles", {
  id: serial('id').primaryKey(),
  characterId: integer("CharacterID"),
  characterName: varchar("CharacterName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresOn: varchar("ExpiresOn", { length: 255 }),
  userId: integer("userId").references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: 'string' }).notNull(),
},
  (table) => {
    return {
      esiProfilesCharacterID: uniqueIndex("esi_profiles__character_i_d").on(table.characterId),
    }
  });


export type NewEsiProfile = InferModel<typeof esiProfiles, 'insert'>;

export const users = pgTable("Users", {
  id: serial('id').primaryKey(),
  name: varchar("name", { length: 255 }),
  registered: timestamp("registered", { withTimezone: true, mode: 'string' }),
  mainCharacterId: integer("mainCharacterId"),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: 'string' }).notNull(),
},
  (table) => {
    return {
      usersName: uniqueIndex("users_name").on(table.name),
    }
  });

export type NewUser = InferModel<typeof users, 'insert'>;