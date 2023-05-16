import { Request, Response } from 'express';
import axios from 'axios';
import { EVEApiCharacterProfile } from '../../interfaces/EVEApiCharacterProfile';
import { EVEApiPortraitUrls } from '../../interfaces/EVEApiPortraitUrls';
import { Profile } from '../../interfaces/Profile';
import { Account } from '../../interfaces/Account';
import { EsiProfile } from '../../database/schema';
import { getAccountFromSession } from '../../utils/getAccountFromSession';

export const getProfile = async (req: Request, res: Response) => {
  const account: Account | undefined = getAccountFromSession(req);

  if (!account) return res.status(401).json({ message: "User not authenticated" });
  if (!account.esiProfiles) return res.status(401).json({ message: "esiProfiles not found in account" });
  if (!account.user.mainCharacterId) return res.status(401).json({ message: "mainCharacterId not found in account" });

  const characterProfilesPromises = account.esiProfiles.map(async (esiProfile: EsiProfile) => {
    const characterProfilePromise = axios.get<EVEApiCharacterProfile>(
      `https://esi.evetech.net/latest/characters/${esiProfile.characterId}?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    );

    const portraitPromise = axios.get<EVEApiPortraitUrls>(
      `https://esi.evetech.net/latest/characters/${esiProfile.characterId}/portrait?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    );

    const [characterProfileResponse, portraitResponse] = await Promise.all([characterProfilePromise, portraitPromise]);

    return {
      ...characterProfileResponse.data,
      id: esiProfile.characterId as number,
      portraitUrls: portraitResponse.data,
    };
  });

  const characterProfiles = await Promise.all(characterProfilesPromises);

  const profile: Profile = {
    characterProfiles: characterProfiles,
  };

  return res.json(profile);
};