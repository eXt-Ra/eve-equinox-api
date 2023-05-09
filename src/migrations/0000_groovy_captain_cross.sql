CREATE TABLE IF NOT EXISTS "EsiProfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"CharacterID" integer,
	"CharacterName" varchar(255),
	"accessToken" text,
	"refreshToken" text,
	"ExpiresOn" varchar(255),
	"userId" integer,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"registered" timestamp with time zone,
	"mainCharacterId" integer,
	"updatedAt" timestamp with time zone NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "EsiProfiles" ADD CONSTRAINT "EsiProfiles_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "esi_profiles__character_i_d" ON "EsiProfiles" ("CharacterID");
CREATE UNIQUE INDEX IF NOT EXISTS "users_name" ON "Users" ("name");