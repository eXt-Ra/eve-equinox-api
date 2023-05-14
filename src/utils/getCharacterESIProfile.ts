import { EsiProfile } from "../database/schema";

function getCharacterESIProfile(esiProfiles: EsiProfile[], characterId: number): EsiProfile | undefined {
  return esiProfiles.find(profile => profile.characterId === characterId);
}

export { getCharacterESIProfile }