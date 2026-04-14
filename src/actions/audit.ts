"use server";

import { prisma } from "@/lib/prisma";

export async function getAuditLogs(limit: number = 100, filters?: { action?: string; entite?: string; utilisateur?: string }) {
  const where: any = {};
  if (filters?.action) where.action = filters.action;
  if (filters?.entite) where.entite = filters.entite;
  if (filters?.utilisateur) where.utilisateur = filters.utilisateur;

  return prisma.auditLog.findMany({ where, orderBy: { creeLe: "desc" }, take: limit });
}

export async function getAuditStats(utilisateur?: string) {
  const where: any = utilisateur ? { utilisateur } : {};
  const total = await prisma.auditLog.count({ where });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayCount = await prisma.auditLog.count({ where: { ...where, creeLe: { gte: today } } });
  const actions = await prisma.auditLog.groupBy({ by: ["action"], where, _count: true, orderBy: { _count: { action: "desc" } } });
  const entites = await prisma.auditLog.groupBy({ by: ["entite"], where, _count: true, orderBy: { _count: { entite: "desc" } } });
  return { total, todayCount, actions, entites };
}
