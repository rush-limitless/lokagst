-- Index sur paiements
CREATE INDEX IF NOT EXISTS "paiements_bailId_idx" ON "paiements"("bailId");
CREATE INDEX IF NOT EXISTS "paiements_moisConcerne_idx" ON "paiements"("moisConcerne");
CREATE INDEX IF NOT EXISTS "paiements_bailId_moisConcerne_idx" ON "paiements"("bailId", "moisConcerne");

-- Index sur baux
CREATE INDEX IF NOT EXISTS "baux_locataireId_idx" ON "baux"("locataireId");
CREATE INDEX IF NOT EXISTS "baux_appartementId_idx" ON "baux"("appartementId");
CREATE INDEX IF NOT EXISTS "baux_statut_idx" ON "baux"("statut");
CREATE INDEX IF NOT EXISTS "baux_locataireId_statut_idx" ON "baux"("locataireId", "statut");
