import { User } from "../interfaces/User";
import { CharacterList } from "../interfaces/CharacterList";
import axios from "axios";
import { EsiProfile } from "../interfaces/EsiProfile";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../database/pool";
import { esiProfiles, users } from "../database/schema";
import { eq } from "drizzle-orm";

export const getCharacterIdWithName = async (characterName: string, esiProfile: EsiProfile | undefined): Promise<number | null> => {
  // Search for characterId in the database
  const db = drizzle(pool, { logger: true })
  const dbUser = await db.select().from(users).where(eq(users.name, characterName))
    .leftJoin(esiProfiles, eq(users.id, esiProfiles.userId)).limit(1);

  if (dbUser && dbUser.length > 0 && dbUser[0].EsiProfiles)
    return dbUser[0].EsiProfiles.characterId;

  if (!esiProfile)
    return null;

  // Search for characterId in the ESI
  const characterListResponse = await axios.get<CharacterList>(
    `https://esi.evetech.net/latest/characters/${esiProfile?.CharacterID}/search/?categories=character&datasource=tranquility&language=en&search=${characterName}&strict=false`,
    {
      headers: {
        Authorization: `Bearer ${esiProfile.accessToken}`,
      },
    }
  );

  if (characterListResponse.data.character && characterListResponse.data.character.length > 0) {
    return characterListResponse.data.character[0];
  }

  return null;
}