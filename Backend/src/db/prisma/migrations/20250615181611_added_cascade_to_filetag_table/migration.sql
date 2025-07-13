-- DropForeignKey
ALTER TABLE "FileTag" DROP CONSTRAINT "FileTag_fileId_fkey";

-- DropForeignKey
ALTER TABLE "FileTag" DROP CONSTRAINT "FileTag_tagId_fkey";

-- AddForeignKey
ALTER TABLE "FileTag" ADD CONSTRAINT "FileTag_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileTag" ADD CONSTRAINT "FileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
