import axios from "axios";
import { Request, Response } from "express";
import { EVEApiCharacterProfile } from "../../interfaces/EVEApiCharacterProfile";
import { EVEApiPortraitUrls } from "../../interfaces/EVEApiPortraitUrls";
import { getCharacterESIProfile } from "../../utils/getCharacterESIProfile";
import { Account } from "../../interfaces/Account";

export const getCharacter = async (req: Request, res: Response) => {
  const characterId = req.params.id;
  const account: Account | undefined = req.session.passport?.user;

  if (!account) return res.status(401).json({ message: "User not authenticated" });
  if (!account.esiProfiles) return res.status(401).json({ message: "esiProfiles not found in account" });
  if (!account.user.mainCharacterId) return res.status(401).json({ message: "mainCharacterId not found in account" });

  const esiProfile = getCharacterESIProfile(account.esiProfiles, account?.user.mainCharacterId);

  const [characterResponse, portraitResponse] = await Promise.all([
    axios.get<EVEApiCharacterProfile>(
      `https://esi.evetech.net/latest/characters/${characterId}?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    ),
    axios.get<EVEApiPortraitUrls>(
      `https://esi.evetech.net/latest/characters/${characterId}/portrait?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    ),
  ]);

  return res.json({ ...characterResponse.data, id: characterId, portraitUrls: portraitResponse.data });
};
