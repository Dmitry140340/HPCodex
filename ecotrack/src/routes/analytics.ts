/**
 * Маршруты для расширенной аналитики HimkaPlastic EcoTrack
 */

import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';

const router = Router();

// Получение расширенной аналитики
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'month', region = 'all' } = req.query;
    
    const analytics = await analyticsService.getAdvancedAnalytics({
      period: period as string,
      region: region as string
    });
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Получение данных для графиков
router.get('/charts/waste-trends', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const wasteData = await analyticsService.getWasteTrends(period as string);
    res.json(wasteData);
  } catch (error) {
    console.error('Error fetching waste trends:', error);
    res.status(500).json({ error: 'Failed to fetch waste trends' });
  }
});

// Региональная прибыльность
router.get('/charts/regional-profitability', async (req, res) => {
  try {
    const regionalData = await analyticsService.getRegionalProfitability();
    res.json(regionalData);
  } catch (error) {
    console.error('Error fetching regional profitability:', error);
    res.status(500).json({ error: 'Failed to fetch regional profitability' });
  }
});

// Прогнозирование спроса
router.get('/forecast/demand', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    const forecast = await analyticsService.getDemandForecast(Number(months));
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    res.status(500).json({ error: 'Failed to fetch demand forecast' });
  }
});

// KPI в реальном времени
router.get('/kpi/realtime', async (req, res) => {
  try {
    const kpiData = await analyticsService.getRealTimeKPIs();
    res.json(kpiData);
  } catch (error) {
    console.error('Error fetching real-time KPI:', error);
    res.status(500).json({ error: 'Failed to fetch real-time KPI' });
  }
});

// Распределение материалов
router.get('/charts/material-distribution', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const materialData = await analyticsService.getMaterialDistribution(period as string);
    res.json(materialData);
  } catch (error) {
    console.error('Error fetching material distribution:', error);
    res.status(500).json({ error: 'Failed to fetch material distribution' });
  }
});

// Экспорт отчетов
router.post('/export/report', async (req, res) => {
  try {
    const { format = 'pdf', data, reportType } = req.body;
    
    const exportResult = await analyticsService.exportReport({
      format,
      data,
      reportType
    });
    
    res.json(exportResult);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// Настройка оповещений для KPI
router.post('/kpi/alerts', async (req, res) => {
  try {
    const { kpiId, threshold, condition, recipients } = req.body;
    
    const alert = await analyticsService.createKPIAlert({
      kpiId,
      threshold,
      condition,
      recipients
    });
    
    res.json(alert);
  } catch (error) {
    console.error('Error creating KPI alert:', error);
    res.status(500).json({ error: 'Failed to create KPI alert' });
  }
});

// Получение истории KPI
router.get('/kpi/:kpiId/history', async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { period = 'month' } = req.query;
    
    const history = await analyticsService.getKPIHistory(kpiId, period as string);
    res.json(history);
  } catch (error) {
    console.error('Error fetching KPI history:', error);
    res.status(500).json({ error: 'Failed to fetch KPI history' });
  }
});

export default router;
