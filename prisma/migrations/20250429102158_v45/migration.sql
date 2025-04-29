/*
  Warnings:

  - You are about to alter the column `selectedStat` on the `Round` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "player1Choice" INTEGER,
    "player2Choice" INTEGER,
    "winner" TEXT,
    "selectedStat" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Round" ("createdAt", "gameId", "id", "player1Choice", "player2Choice", "roundNumber", "selectedStat", "winner") SELECT "createdAt", "gameId", "id", "player1Choice", "player2Choice", "roundNumber", "selectedStat", "winner" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
CREATE UNIQUE INDEX "Round_gameId_roundNumber_key" ON "Round"("gameId", "roundNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
