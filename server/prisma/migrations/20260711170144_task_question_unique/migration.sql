-- CreateIndex
CREATE UNIQUE INDEX "TaskQuestion_cycleId_domainId_order_key" ON "TaskQuestion"("cycleId", "domainId", "order");
