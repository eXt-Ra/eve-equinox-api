import { EsiProfile } from "../interfaces/EsiProfile";

function getMainCharacterProfile(esiProfiles: EsiProfile[], mainCharacterId: number): EsiProfile | undefined {
  return esiProfiles.find(profile => profile.CharacterID === mainCharacterId);
}

export { getMainCharacterProfile }