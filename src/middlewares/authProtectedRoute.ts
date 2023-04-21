import { NextFunction, Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { EsiProfile } from "../interfaces/EsiProfile";
import refresh from "passport-oauth2-refresh";

const authProtectedRoute = async (req: Request, res: Response, next: NextFunction) => {
  const user: EsiProfile | undefined = req.session?.passport?.user;

  if (!user) {
    res.cookie('eve-equinox-isConnected', false);
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Verify token by making a request to a protected endpoint
    const currentTimestamp = new Date().getTime();
    const tokenExpiresOn = new Date(user.ExpiresOn).getTime();

    if (currentTimestamp < tokenExpiresOn) {
      // Token is valid, proceed to the next middleware or route
      next();
    } else {
      // Token is expired, attempt to refresh the token
      refresh.requestNewAccessToken(
        "eveonline",
        user.refreshToken,
        async (err, accessToken) => {
          if (err || !accessToken) {
            // Failed to refresh token, return an error response
            res.cookie('eve-equinox-isConnected', false);
            return res.status(401).json({ message: "Failed to refresh token" });
          }

          // Update user's access token in session
          // @ts-ignore
          req.session.passport.user.accessToken = accessToken;
          req.session.save();

          // Set the new access token in the request headers and retry the API request
          try {
            await axios.get(`https://esi.evetech.net/verify`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

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
