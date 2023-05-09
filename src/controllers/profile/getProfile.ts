import { Request, Response } from 'express';
import axios from 'axios';
import { CharacterProfile } from '../../interfaces/CharacterProfile';
import { PortraitUrls } from '../../interfaces/PortraitUrls';
import { Profile } from '../../interfaces/Profile';
import { User } from '../../interfaces/User';
import { getCharacterESIProfile } from '../../utils/getCharacterESIProfile';
import { EsiProfile } from '../../interfaces/EsiProfile';

export const getProfile = async (req: Request, res: Response) => {
  const user: User | undefined = req.session.passport?.user;

  if (!user) return res.status(401).json({ message: "User not authenticated" });

  const esiProfile = getCharacterESIProfile(user.characters, user.mainCharacterId);

  const characterProfilesPromises = user.characters.map(async (character: EsiProfile) => {
    const characterProfilePromise = axios.get<CharacterProfile>(
      `https://esi.evetech.net/latest/characters/${character.CharacterID}?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    );

    const portraitPromise = axios.get<PortraitUrls>(
      `https://esi.evetech.net/latest/characters/${character.CharacterID}/portrait?datasource=tranquility`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    );

    const [characterProfileResponse, portraitResponse] = await Promise.all([characterProfilePromise, portraitPromise]);

    return {
      ...characterProfileResponse.data,
      id: character.CharacterID,
      portraitUrls: portraitResponse.data,
    };
  });

  const characterProfiles = await Promise.all(characterProfilesPromises);

  const profile: Profile = {
    characterProfiles: characterProfiles,
  };

  return res.json(profile);
};
