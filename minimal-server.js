// Минимальный тестовый сервер для проверки функциональности
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Простое хранилище пользователей в памяти для тестирования
const users = [];
const orders = [];

// Создаем тестового админа
const createTestAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = {
    id: 'admin-1',
    email: 'admin@himkaplastic.ru',
    name: 'Administrator',
    password: hashedPassword,
    isAdmin: true,
    role: 'admin',
    companyName: 'HimkaPlastic LLC'
  };
  users.push(adminUser);
  console.log('✅ Тестовый админ создан:', adminUser.email);
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, companyName } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Определяем, является ли пользователь администратором
    const isAdminUser = email === 'admin@himkaplastic.ru' || email.endsWith('@admin.com');
    
    const newUser = {
      id: `user-${users.length + 1}`,
      email,
      name,
      password: hashedPassword,
      isAdmin: isAdminUser,
      role: isAdminUser ? 'admin' : 'client',
      companyName
    };

    users.push(newUser);
    
    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'Пользователь создан успешно',
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Находим пользователя
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Создаем простой токен (в реальном приложении используйте JWT)
    const token = `token-${user.id}-${Date.now()}`;
    
    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Вход выполнен успешно',
      token,
      user: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

app.get('/api/admin/analytics', (req, res) => {
  const analytics = {
    totalUsers: users.length,
    totalOrders: orders.length,
    adminUsers: users.filter(u => u.isAdmin).length,
    clientUsers: users.filter(u => !u.isAdmin).length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.price || 0), 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.price || 0), 0) / orders.length : 0
  };
  res.json(analytics);
});

app.get('/api/admin/stats', (req, res) => {
  const stats = {
    users: {
      total: users.length,
      admins: users.filter(u => u.isAdmin).length,
      clients: users.filter(u => !u.isAdmin).length
    },
    orders: {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    }
  };
  res.json(stats);
});

app.get('/api/market-rates', (req, res) => {
  const rates = [
    { material: 'ПЭТ бутылки', price: 15.50, unit: 'кг', trend: 'up' },
    { material: 'Полиэтилен', price: 12.30, unit: 'кг', trend: 'stable' },
    { material: 'Полипропилен', price: 18.75, unit: 'кг', trend: 'down' },
    { material: 'ПВХ', price: 8.90, unit: 'кг', trend: 'up' }
  ];
  res.json(rates);
});

// Создаем тестового админа при запуске
createTestAdmin();

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`🚀 HimkaPlastic EcoTrack Test Server запущен на порту ${PORT}`);
  console.log(`📡 API доступно по адресу: http://localhost:${PORT}/api`);
  console.log(`👤 Тестовый админ: admin@himkaplastic.ru / admin123`);
  console.log(`🔍 Проверка здоровья: http://localhost:${PORT}/api/health`);
});