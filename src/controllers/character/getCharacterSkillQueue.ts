import axios from "axios";
import { Request, Response } from "express";
import { User } from "../../interfaces/User";
import { getCharacterESIProfile } from "../../utils/getCharacterESIProfile";
import { getCharacterIdWithName } from "../../utils/getCharacterIdWithName";

interface SkillQueueItem {
  finish_date: string;
  finished_level: number;
  level_end_sp: number;
  level_start_sp: number;
  queue_position: number;
  skill_id: number;
  start_date: string;
  training_start_sp: number;
}

export const getCharacterSkillQueue = async (req: Request, res: Response) => {
  let characterId = req.params.characterId;
  const characterName = req.params.characterName;

  const user: User | undefined = req.session.passport?.user;

  if (!user) return res.status(401).json({ message: "User not authenticated" });

  try {

    if (!characterId && characterName) {
      const mainEsiProfile = getCharacterESIProfile(user.characters, user.mainCharacterId);
      const id = await getCharacterIdWithName(characterName, mainEsiProfile);

      if (!id) return res.status(404).json({ message: "Character not found" });
      characterId = id.toString();
    }


    const esiProfile = getCharacterESIProfile(user.characters, Number(characterId));

    const response = await axios.get<SkillQueueItem[]>(
      `https://esi.evetech.net/latest/characters/${characterId}/skillqueue/`,
      {
        headers: {
          Authorization: `Bearer ${esiProfile?.accessToken}`,
        },
      }
    );

    const skillQueue = response.data.filter(item => {
      // only return not finished skills
      return new Date(item.finish_date) > new Date();
    }).map((item) => {
      const finishDate = new Date(item.finish_date);
      const startDate = new Date(item.start_date);
      const currentTime = new Date();

      const progress = Math.round(
        ((currentTime.getTime() - startDate.getTime()) / (finishDate.getTime() - startDate.getTime())) * 100
      );

      return {
        ...item,
        progress: progress < 0 ? 0 : progress,
        finish_date_formatted: finishDate.toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        }),
      };
    });

    return res.json(skillQueue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching character skill queue" });
  }
};
