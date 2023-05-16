import { db } from "../database/pool";
import { NewUser, User, esiProfiles, users } from "../database/schema";
import { eq } from 'drizzle-orm';


export class UserService {
  static async getById(userId: number): Promise<User | null> {
    const dbUser = await db.select().from(users).where(eq(users.id, userId))
      .leftJoin(esiProfiles, eq(users.id, esiProfiles.userId));

    if (!dbUser.length)
      return null;

    if (!dbUser[0].Users)
      return null;

    const user = dbUser[0].Users;

    return user;
  }

  static async getByName(name: string): Promise<User | null> {
    const dbUser = await db.select().from(users).where(eq(users.name, name))

    if (!dbUser.length)
      return null;

    return dbUser[0];
  }


  static async insertOrUpdate(user: NewUser): Promise<User> {
    const dbUser = await db.insert(users).values(user).onConflictDoUpdate({
      target: users.id,
      set: {
        name: user.name,
        mainCharacterId: user.mainCharacterId,
        updatedAt: new Date().toISOString(),
      },
    }).returning();

    return dbUser[0];
  }

  static async getByCharacterId(characterID: number): Promise<User | null> {
    const dbUser = await db.select().from(esiProfiles).where(eq(esiProfiles.characterId, characterID))
      .leftJoin(users, eq(users.id, esiProfiles.userId))
      .limit(1);

    if (!dbUser.length)
      return null;

    if (!dbUser[0].Users)
      return null;

    return dbUser[0].Users;
  }

  static async deleteAll(): Promise<void> {
    await db.delete(users)
  }

}
