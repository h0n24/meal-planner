-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "GrocerySection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrocerySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "groceryItemId" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "unit" TEXT,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekPlanEntry" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" "MealType" NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "WeekPlanEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItemCheck" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "groceryItemId" TEXT NOT NULL,
    "unit" TEXT,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "ShoppingItemCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrocerySection_sortOrder_idx" ON "GrocerySection"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GrocerySection_name_key" ON "GrocerySection"("name");

-- CreateIndex
CREATE INDEX "GroceryItem_sectionId_idx" ON "GroceryItem"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "GroceryItem_normalizedName_key" ON "GroceryItem"("normalizedName");

-- CreateIndex
CREATE INDEX "Recipe_updatedAt_idx" ON "Recipe"("updatedAt");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_groceryItemId_idx" ON "RecipeIngredient"("groceryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlan_weekStartDate_key" ON "WeekPlan"("weekStartDate");

-- CreateIndex
CREATE INDEX "WeekPlanEntry_weekPlanId_idx" ON "WeekPlanEntry"("weekPlanId");

-- CreateIndex
CREATE INDEX "WeekPlanEntry_recipeId_idx" ON "WeekPlanEntry"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekPlanEntry_weekPlanId_date_mealType_key" ON "WeekPlanEntry"("weekPlanId", "date", "mealType");

-- CreateIndex
CREATE INDEX "ShoppingItemCheck_weekPlanId_idx" ON "ShoppingItemCheck"("weekPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingItemCheck_weekPlanId_groceryItemId_unit_key" ON "ShoppingItemCheck"("weekPlanId", "groceryItemId", "unit");

-- AddForeignKey
ALTER TABLE "GroceryItem" ADD CONSTRAINT "GroceryItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "GrocerySection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_groceryItemId_fkey" FOREIGN KEY ("groceryItemId") REFERENCES "GroceryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanEntry" ADD CONSTRAINT "WeekPlanEntry_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekPlanEntry" ADD CONSTRAINT "WeekPlanEntry_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItemCheck" ADD CONSTRAINT "ShoppingItemCheck_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeekPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItemCheck" ADD CONSTRAINT "ShoppingItemCheck_groceryItemId_fkey" FOREIGN KEY ("groceryItemId") REFERENCES "GroceryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

