import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import refresh from 'passport-oauth2-refresh';
import axios from 'axios';
import { PassportStatic } from 'passport';
import { NewUser, NewEsiProfile } from '../../database/schema';
import { UserService } from '../../services/user.service';
import { EsiProfileService } from '../../services/esiprofile.service';
import { EVEApiEsiProfile } from '../../interfaces/EVEApiEsiProfile';
import { Account } from '../../interfaces/Account';

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
      done: (error: Error | null | unknown, user?: Account) => void,
    ) => {
      try {
        const response = await axios.get<EVEApiEsiProfile>(
          `https://esi.evetech.net/verify/?datasource=tranquility&token=${accessToken}`,
        );

        const { CharacterID, CharacterName, ExpiresOn } = response.data;
        const user = await UserService.getByCharacterId(CharacterID);

        try {
          if (!user) {
            const newUser: NewUser = {
              name: CharacterName,
              registered: new Date().toISOString(),
              mainCharacterId: CharacterID,
              updatedAt: new Date().toISOString(),
            };

            const insertedUser = await UserService.insertOrUpdate(newUser);

            const newEsiProfile: NewEsiProfile = {
              characterId: CharacterID,
              characterName: CharacterName,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresOn: ExpiresOn,
              userId: insertedUser.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const insertedEsiProfile = await EsiProfileService.insertOrUpdate(newEsiProfile);

            return done(null, {
              user: insertedUser,
              esiProfiles: [insertedEsiProfile],
            } satisfies Account);

          } else {
            const newEsiProfile: NewEsiProfile = {
              characterId: CharacterID,
              characterName: CharacterName,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresOn: ExpiresOn,
              userId: user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Update the ESI profile if it exists or insert a new one
            await EsiProfileService.insertOrUpdate(newEsiProfile);
            const esiProfiles = await EsiProfileService.getByCharacterId(CharacterID);

            if (!esiProfiles) {
              throw new Error('Unable to retrieve ESI profile');
            }

            return done(null, {
              user: user,
              esiProfiles: esiProfiles,
            } satisfies Account);
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
