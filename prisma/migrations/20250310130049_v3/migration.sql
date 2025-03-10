/*
  Warnings:

  - Added the required column `sprite` to the `UserPokemon` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pokemonName" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "sprite" TEXT NOT NULL,
    CONSTRAINT "UserPokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPokemon_pokemonName_fkey" FOREIGN KEY ("pokemonName") REFERENCES "Pokemon" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserPokemon" ("id", "isTeam", "pokemonName", "unlocked", "userId") SELECT "id", "isTeam", "pokemonName", "unlocked", "userId" FROM "UserPokemon";
DROP TABLE "UserPokemon";
ALTER TABLE "new_UserPokemon" RENAME TO "UserPokemon";
CREATE UNIQUE INDEX "UserPokemon_userId_pokemonName_key" ON "UserPokemon"("userId", "pokemonName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
