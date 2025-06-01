/**
 * Маршруты для административной панели HimkaPlastic EcoTrack
 */

import { Router } from 'express';
// import { auth, requireRole } from '../middleware/auth'; // TODO: Create auth middleware
import {
  getAdminAnalytics,
  getPricingRules,
  getTariffSettings,
  updateKPITarget,
  updatePricingRule,
  getAllUsers,
  updateUserRole,
  getSystemSettings,
  updateSystemSettings,
  getSystemStats
} from '../controllers/adminController';

const router = Router();

// TODO: Все админские роуты требуют аутентификации и роль admin
// router.use(auth);
// router.use(requireRole(['admin']));

// Аналитика и обзор
router.get('/analytics', getAdminAnalytics);
router.get('/stats', getSystemStats);

// Управление KPI
router.put('/kpi/:id', updateKPITarget);

// Управление ценообразованием
router.get('/pricing/rules', getPricingRules);
router.put('/pricing/rules/:id', updatePricingRule);
router.get('/pricing/tariffs', getTariffSettings);

// Управление пользователями
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);

// Системные настройки
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
