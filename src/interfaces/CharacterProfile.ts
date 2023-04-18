import { PortraitUrls } from "./PortraitUrls";

export interface CharacterProfile {
  birthday: string;
  bloodline_id: number;
  corporation_id: number;
  description: string;
  gender: 'male' | 'female';
  name: string;
  race_id: number;
  title: string;
  portraitUrls: PortraitUrls;
}
