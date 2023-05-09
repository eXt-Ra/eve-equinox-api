import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import refresh from 'passport-oauth2-refresh';
import axios from 'axios';
import { PassportStatic } from 'passport';
import { EsiProfile } from '../../interfaces/EsiProfile';
import { User } from '../../interfaces/User';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, esiProfiles, NewUser, NewEsiProfile } from '../../database/schema';
import { InferModel, eq } from 'drizzle-orm';
import { pool } from '../../database/pool';

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

        const db = drizzle(pool, { logger: true });

        const dbUser = await db.select().from(esiProfiles).where(eq(esiProfiles.characterId, CharacterID))
          .leftJoin(users, eq(users.id, esiProfiles.userId))
          .limit(1);

        try {
          if (!dbUser.length) {
            const newUser: NewUser = {
              name: CharacterName,
              registered: new Date().toISOString(),
              mainCharacterId: CharacterID,
              updatedAt: new Date().toISOString(),
            };

            const insertedUsers = await db.insert(users).values(newUser).returning();
            const user = insertedUsers[0];

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

            await db.insert(esiProfiles).values(newEsiProfile);

            return done(null, {
              id: user.id,
              name: user.name as string,
              registered: new Date(user.registered as string),
              mainCharacterId: user.mainCharacterId as number,
              characters: [{
                CharacterID: newEsiProfile.characterId as number,
                CharacterName: newEsiProfile.characterName as string,
                accessToken: newEsiProfile.accessToken as string,
                refreshToken: newEsiProfile.refreshToken as string,
                ExpiresOn: newEsiProfile.expiresOn as string,
              }]
            } satisfies User);

          } else {

            if (!dbUser[0].Users)
              throw new Error('User not found');
            // Find the matching ESI profile
            const esiProfile = dbUser[0].EsiProfiles;

            // Update the ESI profile if it exists
            if (esiProfile) {
              await db.update(esiProfiles)
                .set({
                  accessToken,
                  refreshToken,
                  expiresOn: ExpiresOn,
                  updatedAt: new Date().toISOString()
                })
                .where(eq(esiProfiles.id, CharacterID));
            }

            return done(null, {
              id: dbUser[0].Users.id as number,
              name: dbUser[0].Users.name as string,
              registered: new Date(dbUser[0].Users.registered as string),
              mainCharacterId: dbUser[0].Users.mainCharacterId as number,
              characters: [{
                CharacterID: esiProfile?.characterId as number,
                CharacterName: esiProfile?.characterName as string,
                accessToken: esiProfile?.accessToken as string,
                refreshToken: esiProfile?.refreshToken as string,
                ExpiresOn: esiProfile?.expiresOn as string,
              }]
            } satisfies User);
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
