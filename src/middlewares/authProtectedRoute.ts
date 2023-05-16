import { NextFunction, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import refresh from "passport-oauth2-refresh";
import { getCharacterESIProfile } from "../utils/getCharacterESIProfile";
import { NewEsiProfile } from "../database/schema";
import { Account } from "../interfaces/Account";
import { EVEApiEsiProfile } from "../interfaces/EVEApiEsiProfile";
import { EsiProfileService } from "../services/esiprofile.service";

const authProtectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  const account: Account | undefined = req.session?.passport?.user;

  if (!account) {
    console.info("🔒 User not found, return an error response");
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!account.esiProfiles) {
    console.info("🔒 esiProfile not found, return an error response");
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (!account.user.mainCharacterId) {
    console.info("🔒 mainCharacterId not found, return an error response");
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  const esiProfile = getCharacterESIProfile(account.esiProfiles, account.user.mainCharacterId);

  if (!esiProfile) return res.status(401).json({ message: "User not authenticated" });
  if (!esiProfile.accessToken) return res.status(401).json({ message: "accessToken not found in esiProfile" });
  if (!esiProfile.refreshToken) return res.status(401).json({ message: "refreshToken not found in esiProfile" });

  try {
    // Verify token by making a request to a protected endpoint
    const currentTimestamp = Date.now();
    const tokenExpiresOn = new Date(`${esiProfile.expiresOn}Z`).getTime();

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
            const response = await axios.get<EVEApiEsiProfile>(`https://esi.evetech.net/verify`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const { CharacterID, CharacterName, ExpiresOn } = response.data;

            // Update user's access token in session & database
            const newEsiProfile = {
              characterId: CharacterID,
              characterName: CharacterName,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresOn: ExpiresOn,
              userId: account.user.id,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            } as NewEsiProfile;

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const updatedEsiProfile = await EsiProfileService.insertOrUpdate(newEsiProfile);

            const userEsiProfiles = account.esiProfiles.map((eP) => {
              if (eP.characterId === updatedEsiProfile.characterId) {
                return updatedEsiProfile;
              } else {
                return eP;
              }
            });

            // Update session with new user object
            // @ts-ignore
            req.session.passport.user.characters = userEsiProfiles;
            req.session.save();

            // Token is valid after refresh, proceed to the next middleware or route
            next();
          } catch (error: unknown) {
            console.error('error: ', error);
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

    console.error('error: ', error);
    return res.status(500).json({ message: "Unknown error" });
  }
};

export default authProtectedRoute;
