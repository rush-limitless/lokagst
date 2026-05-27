-- Index sur penalites
CREATE INDEX IF NOT EXISTS "penalites_bailId_idx" ON "penalites"("bailId");
CREATE INDEX IF NOT EXISTS "penalites_moisConcerne_idx" ON "penalites"("moisConcerne");

-- Index sur email_logs
CREATE INDEX IF NOT EXISTS "email_logs_locataireId_type_envoyeLe_idx" ON "email_logs"("locataireId", "type", "envoyeLe");
CREATE INDEX IF NOT EXISTS "email_logs_envoyeLe_idx" ON "email_logs"("envoyeLe");

-- Index sur maintenances
CREATE INDEX IF NOT EXISTS "maintenances_statut_idx" ON "maintenances"("statut");
CREATE INDEX IF NOT EXISTS "maintenances_locataireId_idx" ON "maintenances"("locataireId");

-- Index sur messages
CREATE INDEX IF NOT EXISTS "messages_locataireId_idx" ON "messages"("locataireId");

-- Index sur depenses
CREATE INDEX IF NOT EXISTS "depenses_immeubleId_idx" ON "depenses"("immeubleId");
CREATE INDEX IF NOT EXISTS "depenses_date_idx" ON "depenses"("date");

-- Index sur audit_logs
CREATE INDEX IF NOT EXISTS "audit_logs_creeLe_idx" ON "audit_logs"("creeLe");

-- Index sur etats_des_lieux
CREATE INDEX IF NOT EXISTS "etats_des_lieux_bailId_idx" ON "etats_des_lieux"("bailId");
