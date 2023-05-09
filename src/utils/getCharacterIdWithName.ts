import { User } from "../interfaces/User";
import { CharacterList } from "../interfaces/CharacterList";
import db from "../models";
import axios from "axios";
import { EsiProfile } from "../interfaces/EsiProfile";

export const getCharacterIdWithName = async (characterName: string, esiProfile: EsiProfile | undefined): Promise<number | null> => {
  // Search for characterId in the database
  const dbUser: User | null = await db.User.findOne({ where: { name: characterName } });

  if (dbUser)
    return dbUser.id;

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