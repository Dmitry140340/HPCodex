"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const api = __importStar(require("../api/api"));
const actions_1 = require("./actions");
const dotenv_1 = __importDefault(require("dotenv"));
// Import new route modules
const analytics_1 = __importDefault(require("../routes/analytics"));
const notifications_1 = __importDefault(require("../routes/notifications"));
// Load environment variables
dotenv_1.default.config();
// Create Express application
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Получаем токен из заголовка
        let token = req.headers.authorization;
        // Проверяем наличие заголовка
        if (!token) {
            console.error('Отсутствует заголовок Authorization');
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Если токен в формате "Bearer token", извлекаем сам токен
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }
        console.log('Получен токен авторизации:', token);
        const auth = await (0, actions_1.getAuth)(token);
        if (auth.status !== 'authenticated') {
            console.error('Токен не прошел проверку, статус:', auth.status);
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Attach user info to request
        req.auth = auth;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Authentication required' });
    }
};
// Admin middleware
const adminMiddleware = async (req, res, next) => {
    try {
        // Получаем токен из заголовка
        let token = req.headers.authorization;
        // Проверяем наличие заголовка
        if (!token) {
            console.error('Отсутствует заголовок Authorization');
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Если токен в формате "Bearer token", извлекаем сам токен
        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }
        console.log('Получен токен авторизации для admin:', token);
        const auth = await (0, actions_1.getAuth)(token);
        if (auth.status !== 'authenticated' || auth.role !== 'admin') {
            console.error('Токен не прошел проверку на права администратора, статус:', auth.status, 'роль:', auth.role);
            return res.status(403).json({ error: 'Admin privileges required' });
        }
        // Attach user info to request
        req.auth = auth;
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(403).json({ error: 'Admin privileges required' });
    }
};
// Base API health check route
app.get('/api', (req, res) => {
    res.json({
        message: 'EcoTrack API is working',
        version: '1.0.0',
        status: 'healthy',
        endpoints: {
            auth: '/api/auth/*',
            profile: '/api/profile',
            orders: '/api/orders',
            customers: '/api/customers',
            analytics: '/api/analytics/*',
            notifications: '/api/notifications/*',
            maps: '/api/maps/config'
        }
    });
});
// API Routes
// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await api.signIn(email, password);
        res.json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: error.message || 'Login failed' });
    }
});
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, companyName } = req.body;
        const result = await api.signUp({ email, password, name, companyName });
        res.json(result);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await api.signOut(token);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(400).json({ error: error.message || 'Logout failed' });
    }
});
// User profile
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const auth = req.auth;
        const user = await api.getCurrentUser(auth);
        res.json(user);
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(400).json({ error: error.message || 'Failed to get profile' });
    }
});
app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const userData = req.body;
        const updatedUser = await api.updateUserProfile(userData);
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
});
// User info (for frontend compatibility)
app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
        const auth = req.auth;
        const user = await api.getCurrentUser(auth);
        res.json(user);
    }
    catch (error) {
        console.error('User me error:', error);
        res.status(404).json({ error: error.message || 'User not found' });
    }
});
// Update user profile
app.put('/api/user/me', authMiddleware, async (req, res) => {
    try {
        const auth = req.auth;
        const profileData = req.body;
        const updatedUser = await api.updateUserProfile(profileData, auth);
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Update user profile error:', error);
        res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
});
// Market Rates
app.get('/api/market-rates', async (req, res) => {
    try {
        const rates = await api.getMarketRates();
        res.json(rates);
    }
    catch (error) {
        console.error('Market rates error:', error);
        res.status(400).json({ error: error.message || 'Failed to get market rates' });
    }
});
app.put('/api/market-rates', adminMiddleware, async (req, res) => {
    try {
        const { materialType, pricePerKg } = req.body;
        const updatedRate = await api.updateMarketRate({ materialType, pricePerKg });
        res.json(updatedRate);
    }
    catch (error) {
        console.error('Market rate update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update market rate' });
    }
});
// Order Management
app.post('/api/calculate-price', async (req, res) => {
    try {
        const orderData = req.body;
        const priceCalculation = await api.calculateOrderPrice(orderData);
        res.json(priceCalculation);
    }
    catch (error) {
        console.error('Price calculation error:', error);
        res.status(400).json({ error: error.message || 'Failed to calculate price' });
    }
});
app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const orderData = req.body;
        const auth = req.auth;
        const order = await api.createOrder(orderData, auth);
        res.json(order);
    }
    catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ error: error.message || 'Failed to create order' });
    }
});
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const auth = req.auth;
        const orders = await api.getUserOrders(auth);
        res.json(orders);
    }
    catch (error) {
        console.error('Orders fetch error:', error);
        res.status(400).json({ error: error.message || 'Failed to fetch orders' });
    }
});
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
    try {
        const auth = req.auth;
        const order = await api.getOrderById({ id: req.params.id }, auth);
        res.json(order);
    }
    catch (error) {
        console.error('Order fetch error:', error);
        res.status(400).json({ error: error.message || 'Failed to fetch order' });
    }
});
app.put('/api/orders/:id/status', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await api.updateOrderStatus({ id: req.params.id, status });
        res.json(order);
    }
    catch (error) {
        console.error('Order status update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update order status' });
    }
});
app.put('/api/orders/:id/payment', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await api.updatePaymentStatus({ orderId: req.params.id, status }, req.auth);
        res.json(order);
    }
    catch (error) {
        console.error('Payment status update error:', error);
        res.status(400).json({ error: error.message || 'Failed to update payment status' });
    }
});
// Analytics
app.get('/api/analytics', authMiddleware, async (req, res) => {
    try {
        const analytics = await api.getUserAnalytics(req.auth);
        res.json(analytics);
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(400).json({ error: error.message || 'Failed to get analytics' });
    }
});
// Financial Reports
app.get('/api/financial-reports/yearly/:year', authMiddleware, async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const reports = await api.getYearlyFinancialReports({ year }, req.auth);
        res.json(reports);
    }
    catch (error) {
        console.error('Yearly reports error:', error);
        res.status(400).json({ error: error.message || 'Failed to get yearly reports' });
    }
});
app.get('/api/financial-reports/monthly/:year/:month', authMiddleware, async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const report = await api.getMonthlyFinancialReport({ year, month }, req.auth);
        res.json(report);
    }
    catch (error) {
        console.error('Monthly report error:', error);
        res.status(400).json({ error: error.message || 'Failed to get monthly report' });
    }
});
// Admin routes
app.get('/api/admin/orders', adminMiddleware, async (req, res) => {
    try {
        const orders = await api.getAllOrders(req.auth);
        res.json(orders);
    }
    catch (error) {
        console.error('Admin orders error:', error);
        res.status(400).json({ error: error.message || 'Failed to get all orders' });
    }
});
// Административная аналитика
app.get('/api/admin/analytics', adminMiddleware, async (req, res) => {
    try {
        const { getAdminAnalytics } = require('../controllers/adminController');
        await getAdminAnalytics(req, res);
    }
    catch (error) {
        console.error('Admin analytics error:', error);
        res.status(400).json({ error: error.message || 'Failed to get admin analytics' });
    }
});
// Расширенная аналитика и BI
app.get('/api/analytics/advanced', authMiddleware, async (req, res) => {
    try {
        const analytics = await api.getAdvancedAnalytics(req.auth);
        res.json(analytics);
    }
    catch (error) {
        console.error('Advanced analytics error:', error);
        res.status(400).json({ error: error.message || 'Failed to get advanced analytics' });
    }
});
// Управление правилами ценообразования
app.get('/api/admin/pricing/rules', adminMiddleware, async (req, res) => {
    try {
        const { getPricingRules } = require('../controllers/adminController');
        await getPricingRules(req, res);
    }
    catch (error) {
        console.error('Pricing rules error:', error);
        res.status(400).json({ error: error.message || 'Failed to get pricing rules' });
    }
});
app.put('/api/admin/pricing/rules/:id', adminMiddleware, async (req, res) => {
    try {
        const { updatePricingRule } = require('../controllers/adminController');
        await updatePricingRule(req, res);
    }
    catch (error) {
        console.error('Update pricing rule error:', error);
        res.status(400).json({ error: error.message || 'Failed to update pricing rule' });
    }
});
// Управление тарифными настройками
app.get('/api/admin/pricing/tariffs', adminMiddleware, async (req, res) => {
    try {
        const { getTariffSettings } = require('../controllers/adminController');
        await getTariffSettings(req, res);
    }
    catch (error) {
        console.error('Tariff settings error:', error);
        res.status(400).json({ error: error.message || 'Failed to get tariff settings' });
    }
});
// Управление KPI
app.put('/api/admin/kpi/:id', adminMiddleware, async (req, res) => {
    try {
        const { updateKPITarget } = require('../controllers/adminController');
        await updateKPITarget(req, res);
    }
    catch (error) {
        console.error('Update KPI error:', error);
        res.status(400).json({ error: error.message || 'Failed to update KPI target' });
    }
});
// Управление пользователями
app.put('/api/admin/users/:userId/role', adminMiddleware, async (req, res) => {
    try {
        const { updateUserRole } = require('../controllers/adminController');
        await updateUserRole(req, res);
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(400).json({ error: error.message || 'Failed to update user role' });
    }
});
// Warehouse Management Routes
app.get('/api/warehouse/inventory', authMiddleware, async (req, res) => {
    try {
        const inventory = await api.getInventoryItems(req.auth);
        res.json(inventory);
    }
    catch (error) {
        console.error('Get inventory error:', error);
        res.status(400).json({ error: error.message || 'Failed to get inventory' });
    }
});
app.post('/api/warehouse/inventory', authMiddleware, async (req, res) => {
    try {
        const inventoryItem = await api.createInventoryItem(req.body, req.auth);
        res.json(inventoryItem);
    }
    catch (error) {
        console.error('Create inventory item error:', error);
        res.status(400).json({ error: error.message || 'Failed to create inventory item' });
    }
});
app.put('/api/warehouse/inventory/:id', authMiddleware, async (req, res) => {
    try {
        const inventoryItem = await api.updateInventoryItem({ ...req.body, id: req.params.id }, req.auth);
        res.json(inventoryItem);
    }
    catch (error) {
        console.error('Update inventory item error:', error);
        res.status(400).json({ error: error.message || 'Failed to update inventory item' });
    }
});
app.get('/api/warehouse/check-availability', authMiddleware, async (req, res) => {
    try {
        const { materialType, quantity } = req.query;
        const available = await api.checkInventoryAvailability(materialType, Number(quantity));
        res.json({ available });
    }
    catch (error) {
        console.error('Check availability error:', error);
        res.status(400).json({ error: error.message || 'Failed to check availability' });
    }
});
app.post('/api/warehouse/reserve', authMiddleware, async (req, res) => {
    try {
        const { materialType, volume } = req.body;
        const orderId = req.body.orderId || 'temp-' + Date.now();
        const result = await api.reserveMaterial({
            materialType,
            quantity: volume,
            orderId
        });
        res.json(result);
    }
    catch (error) {
        console.error('Reserve material error:', error);
        res.status(400).json({ error: error.message || 'Failed to reserve material' });
    }
});
// Logistics Routes Management
app.get('/api/logistics/routes', authMiddleware, async (req, res) => {
    try {
        const routes = await api.getLogisticRoutes(req.auth);
        res.json(routes);
    }
    catch (error) {
        console.error('Get logistics routes error:', error);
        res.status(400).json({ error: error.message || 'Failed to get logistics routes' });
    }
});
app.post('/api/logistics/routes', authMiddleware, async (req, res) => {
    try {
        const route = await api.createLogisticRoute(req.body, req.auth);
        res.json(route);
    }
    catch (error) {
        console.error('Create logistics route error:', error);
        res.status(400).json({ error: error.message || 'Failed to create logistics route' });
    }
});
app.put('/api/logistics/routes/:id/select', authMiddleware, async (req, res) => {
    try {
        const { selectedOptionId } = req.body;
        const route = await api.selectRoute({ routeId: req.params.id, selectedOptionId }, req.auth);
        res.json(route);
    }
    catch (error) {
        console.error('Select route error:', error);
        res.status(400).json({ error: error.message || 'Failed to select route' });
    }
});
// Order Documents
app.get('/api/orders/:orderId/documents', authMiddleware, async (req, res) => {
    try {
        const documents = await api.getOrderDocuments(req.params.orderId);
        res.json(documents);
    }
    catch (error) {
        console.error('Get order documents error:', error);
        res.status(400).json({ error: error.message || 'Failed to get order documents' });
    }
});
// Yandex Maps API
app.get('/api/maps/config', (req, res) => {
    const apiKey = process.env.YANDEX_MAPS_API_KEY || '8cd50efd-1a88-46d3-821a-643cbfcc250a';
    res.json({
        apiKey,
        scriptUrl: `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
    });
});
// Advanced Analytics Routes
app.use('/api/analytics', authMiddleware, analytics_1.default);
// Notification Management Routes
app.use('/api/notifications', authMiddleware, notifications_1.default);
// DEV ONLY: List all sessions (for debugging auth issues)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/sessions', (req, res) => {
        res.json(actions_1.sessions);
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API: http://localhost:${PORT}/api`);
    });
}
exports.default = app;
