
import { db } from "../database/pool";
import { NewEsiProfile, esiProfiles, EsiProfile } from "../database/schema";
import { eq } from 'drizzle-orm';

export class EsiProfileService {
  static async insertOrUpdate(newEsiProfile: NewEsiProfile): Promise<EsiProfile> {
    const insertedEsiProfile = await db.insert(esiProfiles)
      .values(newEsiProfile)
      .onConflictDoUpdate({
        target: esiProfiles.characterId,
        set: {
          accessToken: newEsiProfile.accessToken,
          refreshToken: newEsiProfile.refreshToken,
          expiresOn: newEsiProfile.expiresOn,
          updatedAt: new Date().toISOString(),
        },
      }).returning();

    if (!insertedEsiProfile) {
      throw new Error('Unable to insert or update ESI profile');
    }

    return insertedEsiProfile[0];
  }

  static async getByCharacterId(characterId: number): Promise<EsiProfile[] | null> {
    const dbEsiProfile = await db.select().from(esiProfiles).where(eq(esiProfiles.characterId, characterId));

    if (!dbEsiProfile.length)
      return null;

    return dbEsiProfile;
  }

  static async deleteAll(): Promise<void> {
    await db.delete(esiProfiles)
  }
}