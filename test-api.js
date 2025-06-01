// Простая утилита для тестирования API
const baseUrl = 'http://localhost:3001/api';

async function testLogin(email, password) {
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function testCreateOrder(token, orderData) {
  try {
    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    console.log('Create order response:', data);
    return data;
  } catch (error) {
    console.error('Create order error:', error);
  }
}

// Экспорт для использования в Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testLogin, testCreateOrder };
}
