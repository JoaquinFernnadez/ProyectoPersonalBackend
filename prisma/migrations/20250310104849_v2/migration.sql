/*
  Warnings:

  - You are about to drop the column `evolution` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Pokemon` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sprite" TEXT
);
INSERT INTO "new_Pokemon" ("id", "name", "sprite") SELECT "id", "name", "sprite" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
