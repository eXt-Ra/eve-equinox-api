import axios from "axios";
import { Request, Response } from "express";
import { CharacterProfile } from "../../interfaces/CharacterProfile";
import { EsiProfile } from "../../interfaces/EsiProfile";
import { PortraitUrls } from "../../interfaces/PortraitUrls";

export const getCharacter = async (req: Request, res: Response) => {
  const characterId = req.params.id;
  const user: EsiProfile | undefined = req.session.passport?.user;

  const [characterResponse, portraitResponse] = await Promise.all([
    axios.get<CharacterProfile>(
      `https://esi.evetech.net/latest/characters/${characterId}?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    ),
    axios.get<PortraitUrls>(
      `https://esi.evetech.net/latest/characters/${characterId}/portrait?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    ),
  ]);

  return res.json({ ...characterResponse.data, id: characterId, portraitUrls: portraitResponse.data });
};