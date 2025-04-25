/*
  Warnings:

  - Added the required column `pokemonDeseadoSprite` to the `IntercambioGTS` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IntercambioGTS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "userPokemonId" INTEGER NOT NULL,
    "pokemonSprite" TEXT NOT NULL,
    "pokemonDeseadoId" INTEGER NOT NULL,
    "pokemonDeseadoSprite" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntercambioGTS_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntercambioGTS_userPokemonId_fkey" FOREIGN KEY ("userPokemonId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntercambioGTS_pokemonDeseadoId_fkey" FOREIGN KEY ("pokemonDeseadoId") REFERENCES "Pokemon" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IntercambioGTS" ("estado", "fechaCreacion", "id", "pokemonDeseadoId", "pokemonSprite", "userPokemonId", "usuarioId") SELECT "estado", "fechaCreacion", "id", "pokemonDeseadoId", "pokemonSprite", "userPokemonId", "usuarioId" FROM "IntercambioGTS";
DROP TABLE "IntercambioGTS";
ALTER TABLE "new_IntercambioGTS" RENAME TO "IntercambioGTS";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
