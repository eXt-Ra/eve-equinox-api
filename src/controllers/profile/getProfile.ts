import { Request, Response } from 'express';
import { EsiProfile } from '../../interfaces/EsiProfile';
import axios from 'axios';
import { CharacterProfile } from '../../interfaces/CharacterProfile';
import { PortraitUrls } from '../../interfaces/PortraitUrls';
import { Profile } from '../../interfaces/Profile';

export function getProfile() {
  return async (req: Request, res: Response) => {
    const user: EsiProfile | undefined = req.session.passport?.user;

    const [characterResponse, portraitResponse] = await Promise.all([
      axios.get<CharacterProfile>(
        `https://esi.evetech.net/latest/characters/${user?.CharacterID}?datasource=tranquility`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
      axios.get<PortraitUrls>(
        `https://esi.evetech.net/latest/characters/${user?.CharacterID}/portrait?datasource=tranquility`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
    ]);

    const profile: Profile = {
      characterProfile: characterResponse.data,
      portraitUrls: portraitResponse.data,
    };

    return res.json(profile);
  };
}
