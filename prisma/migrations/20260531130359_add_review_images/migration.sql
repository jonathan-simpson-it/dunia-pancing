-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("createdAt", "id", "isApproved", "productId", "rating", "text", "userId") SELECT "createdAt", "id", "isApproved", "productId", "rating", "text", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
