import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import { EsiProfile } from "../../interfaces/EsiProfile";
import { CharacterProfile } from "../../interfaces/CharacterProfile";

interface CharacterList {
  character: number[];
}

export const searchCharacter = async (req: Request, res: Response) => {
  const user: EsiProfile | undefined = req.session.passport?.user;

  try {
    const characterListResponse = await axios.get<CharacterList>(
      `https://esi.evetech.net/latest/characters/${user?.CharacterID}/search/?categories=character&datasource=tranquility&language=en&search=${req.params.search}&strict=false`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }
    );

    if (characterListResponse.data.character && characterListResponse.data.character.length > 0) {
      const characterProfilesPromises = characterListResponse.data.character.slice(0, 5).map(
        async (characterID: number) => {
          return axios.get<CharacterProfile>(
            `https://esi.evetech.net/latest/characters/${characterID}?datasource=tranquility`,
            {
              headers: {
                Authorization: `Bearer ${user?.accessToken}`,
              },
            }
          );
        }
      );

      const characterProfiles = await Promise.all(characterProfilesPromises);
      const characterProfilesData = characterProfiles.map(
        (profileResponse, index) => ({ ...profileResponse.data, id: characterListResponse.data.character[index] })
      );

      return res.json(characterProfilesData);
    } else {
      // Return status 404 when no character is found
      return res.status(404).json({ message: "No characters found" });
    }
  } catch (error: unknown) {
    console.log('error: ', error);
    // Check if error is of type AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return res.status(axiosError.response.status).json({ message: axiosError.response.statusText });
      } else if (axiosError.request) {
        return res.status(500).json({ message: "Network error" });
      }
    }

    // Return unknown error response
    return res.status(500).json({ message: "Unknown error" });
  }
};