import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import refresh from 'passport-oauth2-refresh';
import axios from 'axios';
import { PassportStatic } from 'passport';
import { EsiProfile } from '../../interfaces/EsiProfile';
import { User } from '../../interfaces/User';
import db from "../../models";

export function setupEveOnlineStrategy(passport: PassportStatic) {

  const eveonlineStrategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://login.eveonline.com/v2/oauth/authorize',
      tokenURL: 'https://login.eveonline.com/v2/oauth/token',
      clientID: process.env.EVE_CLIENT_ID || '',
      clientSecret: process.env.EVE_CLIENT_SECRET || '',
      callbackURL: process.env.EVE_CALLBACK_URL || '',
      scope: 'esi-wallet.read_character_wallet.v1 esi-wallet.read_corporation_wallet.v1 esi-wallet.read_corporation_wallets.v1 esi-search.search_structures.v1 esi-skills.read_skillqueue.v1',
    },
    async (
      accessToken: string,
      refreshToken: string,
      _profile: null,
      done: (error: Error | null | unknown, user?: User) => void,
    ) => {
      try {
        const response = await axios.get<EsiProfile>(
          `https://esi.evetech.net/verify/?datasource=tranquility&token=${accessToken}`,
        );

        const { CharacterID, CharacterName, ExpiresOn } = response.data;

        const esiProfile: EsiProfile = {
          CharacterID,
          CharacterName,
          accessToken,
          refreshToken,
          ExpiresOn,
        };

        // Check if the user exists in the database
        let user = await db.User.findOne({ where: { id: CharacterID }, include: db.EsiProfile });

        try {
          if (!user) {
            // If the user doesn't exist, create a new one
            user = await db.User.create({
              id: CharacterID,
              name: CharacterName,
              registered: new Date(),
              mainCharacterId: CharacterID,
              characters: [esiProfile],
            }, {
              include: [db.EsiProfile] // Associate the EsiProfile with the User
            });
            return done(null, user);

          } else {
            // Find the matching ESI profile
            const esiProfiles = user.getEsiProfiles();
            const existingEsiProfile = esiProfiles.find((profile) => profile.CharacterID === CharacterID);

            // Update the ESI profile if it exists
            if (existingEsiProfile) {
              existingEsiProfile.accessToken = accessToken;
              existingEsiProfile.refreshToken = refreshToken;
              existingEsiProfile.ExpiresOn = ExpiresOn;
              await existingEsiProfile.save();
            }

            return done(null, user);
          }

        } catch (error) {
          console.error('Error:', (error as Error).message);
          return done(error);
        }

      } catch (error) {
        return done(error);
      }
    },
  )

  passport.use('eveonline', eveonlineStrategy);
  refresh.use('eveonline', eveonlineStrategy);

}
