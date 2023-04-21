import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import refresh from 'passport-oauth2-refresh';
import axios from 'axios';
import { PassportStatic } from 'passport';
import { EsiProfile } from '../../interfaces/EsiProfile';

export function setupEveOnlineStrategy(passport: PassportStatic) {

  const eveonlineStrategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://login.eveonline.com/v2/oauth/authorize',
      tokenURL: 'https://login.eveonline.com/v2/oauth/token',
      clientID: process.env.EVE_CLIENT_ID || '',
      clientSecret: process.env.EVE_CLIENT_SECRET || '',
      callbackURL: process.env.EVE_CALLBACK_URL || '',
      scope: 'esi-markets.read_character_orders.v1 esi-wallet.read_character_wallet.v1 esi-wallet.read_corporation_wallet.v1 esi-wallet.read_corporation_wallets.v1 esi-search.search_structures.v1',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: null,
      done: (error: Error | null | unknown, user?: EsiProfile) => void,
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

        return done(null, esiProfile);
      } catch (error) {
        return done(error);
      }
    },
  )

  passport.use('eveonline', eveonlineStrategy);
  refresh.use('eveonline', eveonlineStrategy);

}
