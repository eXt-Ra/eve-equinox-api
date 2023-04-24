import axios from "axios";
import { Request, Response } from "express";
import { CharacterProfile } from "../../interfaces/CharacterProfile";
import { PortraitUrls } from "../../interfaces/PortraitUrls";
import { User } from "../../interfaces/User";
import { getMainCharacterProfile } from "../../utils/getMainCharacterProfile";

export const getCharacter = async (req: Request, res: Response) => {
  const characterId = req.params.id;
  const user: User | undefined = req.session.passport?.user;

  if (!user) return res.status(401).json({ message: "User not authenticated" });

  const mCharProfile = getMainCharacterProfile(user.characters, user.mainCharacterId);

  const [characterResponse, portraitResponse] = await Promise.all([
    axios.get<CharacterProfile>(
      `https://esi.evetech.net/latest/characters/${characterId}?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${mCharProfile?.accessToken}`,
        },
      }
    ),
    axios.get<PortraitUrls>(
      `https://esi.evetech.net/latest/characters/${characterId}/portrait?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${mCharProfile?.accessToken}`,
        },
      }
    ),
  ]);

  return res.json({ ...characterResponse.data, id: characterId, portraitUrls: portraitResponse.data });
};
