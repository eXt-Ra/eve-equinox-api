import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import { CharacterProfile } from "../../interfaces/CharacterProfile";
import { User } from "../../interfaces/User";
import { getCharacterESIProfile } from "../../utils/getCharacterESIProfile";
import { CharacterList } from "../../interfaces/CharacterList";

export const searchCharacter = async (req: Request, res: Response) => {
  const user: User | undefined = req.session.passport?.user;

  if (!user) return res.status(401).json({ message: "User not authenticated" });

  const esiProfile = getCharacterESIProfile(user.characters, user.mainCharacterId);

  const searchQuery = req.params.search?.trim(); // Trim whitespace from search query

  if (!searchQuery || searchQuery.length < 4) return res.status(400).json({ message: "Invalid search query" }); // Check if search query is null or under 4 characters

  try {
    const characterListResponse = await axios.get<CharacterList>(
      `https://esi.evetech.net/latest/characters/${esiProfile?.CharacterID}/search/?categories=character&datasource=tranquility&language=en&search=${searchQuery}&strict=false`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
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
                Authorization: `Bearer ${esiProfile?.accessToken}`,
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
