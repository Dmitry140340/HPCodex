-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "availableQuantity" DOUBLE PRECISION NOT NULL,
    "reservedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION NOT NULL,
    "maxCapacity" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticRoute" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "estimatedDistance" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedLogisticianId" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteOption" (
    "id" TEXT NOT NULL,
    "logisticRouteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "transportType" TEXT NOT NULL,
    "description" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDocument" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "customerInfo" JSONB NOT NULL,
    "orderDetails" JSONB NOT NULL,
    "logisticsInfo" JSONB,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_materialType_key" ON "InventoryItem"("materialType");

-- AddForeignKey
ALTER TABLE "LogisticRoute" ADD CONSTRAINT "LogisticRoute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticRoute" ADD CONSTRAINT "LogisticRoute_assignedLogisticianId_fkey" FOREIGN KEY ("assignedLogisticianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteOption" ADD CONSTRAINT "RouteOption_logisticRouteId_fkey" FOREIGN KEY ("logisticRouteId") REFERENCES "LogisticRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDocument" ADD CONSTRAINT "OrderDocument_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
