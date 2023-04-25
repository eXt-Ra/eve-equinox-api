import { NextFunction, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import refresh from "passport-oauth2-refresh";
import { User } from "../interfaces/User";
import { getMainCharacterProfile } from "../utils/getMainCharacterProfile";
import db from "../models";

const authProtectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  const user: User | undefined = req.session?.passport?.user;

  if (!user) {
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  const mCharProfile = getMainCharacterProfile(user.characters, user.mainCharacterId);

  if (!mCharProfile) return res.status(401).json({ message: "User not authenticated" });

  try {
    // Verify token by making a request to a protected endpoint
    const currentTimestamp = Date.now();
    const tokenExpiresOn = new Date(`${mCharProfile.ExpiresOn}Z`).getTime();

    if (currentTimestamp < tokenExpiresOn) {
      // Token is valid, proceed to the next middleware or route
      console.log("🔒 Token is valid, proceed to the next middleware or route");
      next();
    } else {
      // Token is expired, attempt to refresh the token
      console.log("🔒 Token is expired, attempt to refresh the token");
      refresh.requestNewAccessToken(
        "eveonline",
        mCharProfile.refreshToken,
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

            const userEsiProfiles = user.characters.map((esiProfile) => {
              if (esiProfile.CharacterID === newEsiProfile.CharacterID) {
                return newEsiProfile;
              } else {
                return esiProfile;
              }
            });

            const [esiProfile] = await db.EsiProfile.findOrCreate({ where: { CharacterID } });

            // Update the ESI profile if it exists
            if (esiProfile) {
              esiProfile.accessToken = accessToken;
              esiProfile.refreshToken = refreshToken;
              esiProfile.ExpiresOn = ExpiresOn;
              await esiProfile.save();
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
      // Return unknown error response
      res.cookie('eve-equinox-isConnected', false);
      return res.status(500).json({ message: "Unknown error" });
    }
  }
};

export default authProtectedRoute;
