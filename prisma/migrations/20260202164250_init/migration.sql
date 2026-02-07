-- CreateTable
CREATE TABLE "Greeting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Greeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Greeting_name_idx" ON "Greeting"("name");
