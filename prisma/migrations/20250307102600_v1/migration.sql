-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "sprite" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "evolution" JSONB
);

-- CreateTable
CREATE TABLE "UserPokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pokemonName" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserPokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserPokemon_pokemonName_fkey" FOREIGN KEY ("pokemonName") REFERENCES "Pokemon" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserPokemon_userId_pokemonName_key" ON "UserPokemon"("userId", "pokemonName");
