import { EsiProfile } from "../interfaces/EsiProfile";

function getCharacterESIProfile(esiProfiles: EsiProfile[], characterId: number): EsiProfile | undefined {
  return esiProfiles.find(profile => profile.CharacterID === characterId);
}

export { getCharacterESIProfile }