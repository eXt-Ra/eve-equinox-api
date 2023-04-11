export interface EsiProfile extends Express.User {
  CharacterID: number;
  CharacterName: string;
  accessToken: string;
  refreshToken: string;
  ExpiresOn: number;
}
