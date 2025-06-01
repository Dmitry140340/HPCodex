"use strict";
/**
 * Маршруты для административной панели HimkaPlastic EcoTrack
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { auth, requireRole } from '../middleware/auth'; // TODO: Create auth middleware
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// TODO: Все админские роуты требуют аутентификации и роль admin
// router.use(auth);
// router.use(requireRole(['admin']));
// Аналитика и обзор
router.get('/analytics', adminController_1.getAdminAnalytics);
router.get('/stats', adminController_1.getSystemStats);
// Управление KPI
router.put('/kpi/:id', adminController_1.updateKPITarget);
// Управление ценообразованием
router.get('/pricing/rules', adminController_1.getPricingRules);
router.put('/pricing/rules/:id', adminController_1.updatePricingRule);
router.get('/pricing/tariffs', adminController_1.getTariffSettings);
// Управление пользователями
router.get('/users', adminController_1.getAllUsers);
router.put('/users/:userId/role', adminController_1.updateUserRole);
// Системные настройки
router.get('/settings', adminController_1.getSystemSettings);
router.put('/settings', adminController_1.updateSystemSettings);
exports.default = router;
