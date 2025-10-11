-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromId" TEXT,
    "toId" TEXT,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "type" TEXT NOT NULL DEFAULT 'TRANSFER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "fromId", "id", "status", "toId", "type") SELECT "amount", "createdAt", "fromId", "id", "status", "toId", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
