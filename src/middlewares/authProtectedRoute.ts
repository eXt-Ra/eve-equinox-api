import { NextFunction, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import refresh from "passport-oauth2-refresh";
import { User } from "../interfaces/User";
import { getCharacterESIProfile } from "../utils/getCharacterESIProfile";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../database/pool";
import { eq } from 'drizzle-orm';
import { esiProfiles } from "../database/schema";

const authProtectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  const user: User | undefined = req.session?.passport?.user;

  if (!user) {
    console.info("🔒 User not found, return an error response");
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  const esiProfile = getCharacterESIProfile(user.characters, user.mainCharacterId);

  if (!esiProfile) return res.status(401).json({ message: "User not authenticated" });

  try {
    // Verify token by making a request to a protected endpoint
    const currentTimestamp = Date.now();
    const tokenExpiresOn = new Date(`${esiProfile.ExpiresOn}Z`).getTime();

    if (currentTimestamp < tokenExpiresOn) {
      // Token is valid, proceed to the next middleware or route
      console.info("🔒 Token is valid, proceed to the next middleware or route");
      next();
    } else {
      // Token is expired, attempt to refresh the token
      console.info("🔒 Token is expired, attempt to refresh the token");
      refresh.requestNewAccessToken(
        "eveonline",
        esiProfile.refreshToken,
        async (err, accessToken, refreshToken, params) => {
          if (err || !accessToken || !refreshToken || !params) {
            // Failed to refresh token, return an error response
            res.cookie('eve-equinox-isConnected', false);
            return res.status(401).json({ message: "Failed to refresh token" });
          }

          // Set the new access token in the request headers and retry the API request
          try {
            const response = await axios.get(`https://esi.evetech.net/verify`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const { CharacterID, CharacterName, ExpiresOn } = response.data;

            // Update user's access token in session & database
            const newEsiProfile = {
              CharacterID,
              CharacterName,
              accessToken,
              refreshToken,
              ExpiresOn
            };

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const userEsiProfiles = user.characters.map((esiProfile) => {
              if (esiProfile.CharacterID === newEsiProfile.CharacterID) {
                return newEsiProfile;
              } else {
                return esiProfile;
              }
            });

            const db = drizzle(pool, { logger: true });
            const dbEsiProfile = await db.select().from(esiProfiles).where(eq(esiProfiles.id, CharacterID));

            // Update the ESI profile if it exists
            if (dbEsiProfile) {
              await db.update(esiProfiles)
                .set({
                  accessToken,
                  refreshToken,
                  expiresOn: ExpiresOn,
                  updatedAt: new Date().toISOString()
                })
                .where(eq(esiProfiles.id, CharacterID));
            }

            // Update session with new user object
            // @ts-ignore
            req.session.passport.user.characters = userEsiProfiles;
            req.session.save();

            // Token is valid after refresh, proceed to the next middleware or route
            next();
          } catch (error: unknown) {
            // Return unknown error response after refreshing token
            res.cookie('eve-equinox-isConnected', false);
            return res.status(500).json({ message: "Unknown error after refreshing token" });
          }
        }
      );
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('axiosError: ', axiosError);
      // Return unknown error response
      res.cookie('eve-equinox-isConnected', false);
      return res.status(500).json({ message: "Unknown error" });
    }
  }
};

export default authProtectedRoute;
