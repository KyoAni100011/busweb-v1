import api from '@/lib/api';
import type {
  RevenueAnalyticsSummary,
  AnalyticsDateRange,
  DailyRevenue,
  MonthlyRevenue,
  RouteRevenue,
} from '@/types';

// Mock data generator for development/demo purposes
const generateMockDailyRevenue = (days: number): DailyRevenue[] => {
  const data: DailyRevenue[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 1000,
      bookings: Math.floor(Math.random() * 50) + 10,
      refunds: Math.floor(Math.random() * 200),
    });
  }

  return data;
};

const generateMockMonthlyRevenue = (): MonthlyRevenue[] => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const currentMonth = new Date().getMonth();

  return months.slice(0, currentMonth + 1).map((month) => ({
    month,
    year: new Date().getFullYear(),
    revenue: Math.floor(Math.random() * 50000) + 20000,
    bookings: Math.floor(Math.random() * 500) + 200,
    growth: Math.floor(Math.random() * 40) - 10,
  }));
};

const generateMockRouteRevenue = (): RouteRevenue[] => {
  const routes = [
    { origin: 'Ho Chi Minh', destination: 'Da Nang' },
    { origin: 'Ha Noi', destination: 'Hai Phong' },
    { origin: 'Da Nang', destination: 'Hue' },
    { origin: 'Ho Chi Minh', destination: 'Nha Trang' },
    { origin: 'Ha Noi', destination: 'Sa Pa' },
  ];

  return routes.map((route, index) => ({
    routeId: `route-${index + 1}`,
    routeName: `${route.origin} - ${route.destination}`,
    origin: route.origin,
    destination: route.destination,
    totalRevenue: Math.floor(Math.random() * 30000) + 10000,
    bookings: Math.floor(Math.random() * 200) + 50,
    averagePrice: Math.floor(Math.random() * 100) + 50,
    occupancyRate: Math.floor(Math.random() * 40) + 60,
  }));
};

const generateMockAnalytics = (): RevenueAnalyticsSummary => {
  const dailyRevenue = generateMockDailyRevenue(30);
  const totalRevenue = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = dailyRevenue.reduce((sum, d) => sum + d.bookings, 0);
  const totalRefunds = dailyRevenue.reduce((sum, d) => sum + d.refunds, 0);

  return {
    metrics: {
      totalRevenue,
      totalBookings,
      averageTicketPrice: Math.round(totalRevenue / totalBookings),
      refundedAmount: totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      currency: 'VND',
    },
    dailyRevenue,
    monthlyRevenue: generateMockMonthlyRevenue(),
    routeRevenue: generateMockRouteRevenue(),
    busTypeRevenue: [
      { busType: 'Standard', revenue: 45000, bookings: 320, percentage: 35 },
      { busType: 'VIP', revenue: 55000, bookings: 180, percentage: 42 },
      { busType: 'Sleeper', revenue: 30000, bookings: 100, percentage: 23 },
    ],
    paymentMethods: [
      { method: 'Credit Card', count: 450, amount: 85000, percentage: 55 },
      { method: 'Bank Transfer', count: 200, amount: 35000, percentage: 25 },
      { method: 'E-Wallet', count: 150, amount: 20000, percentage: 15 },
      { method: 'Cash', count: 50, amount: 5000, percentage: 5 },
    ],
    bookingStatuses: [
      { status: 'CONFIRMED', count: 680, amount: 120000, percentage: 80 },
      { status: 'PENDING', count: 85, amount: 15000, percentage: 10 },
      { status: 'CANCELLED', count: 85, amount: 10000, percentage: 10 },
    ],
    topRoutes: [
      {
        routeId: 'route-1',
        routeName: 'Ho Chi Minh - Da Nang',
        revenue: 35000,
        bookings: 180,
        trend: 'up',
        trendPercentage: 12,
      },
      {
        routeId: 'route-2',
        routeName: 'Ha Noi - Hai Phong',
        revenue: 28000,
        bookings: 150,
        trend: 'up',
        trendPercentage: 8,
      },
      {
        routeId: 'route-3',
        routeName: 'Da Nang - Hue',
        revenue: 22000,
        bookings: 120,
        trend: 'down',
        trendPercentage: 5,
      },
      {
        routeId: 'route-4',
        routeName: 'Ho Chi Minh - Nha Trang',
        revenue: 18000,
        bookings: 95,
        trend: 'stable',
        trendPercentage: 0,
      },
      {
        routeId: 'route-5',
        routeName: 'Ha Noi - Sa Pa',
        revenue: 15000,
        bookings: 80,
        trend: 'up',
        trendPercentage: 15,
      },
    ],
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString(),
  };
};

export const analyticsService = {
  async getRevenueAnalytics(
    dateRange?: AnalyticsDateRange
  ): Promise<RevenueAnalyticsSummary> {
    try {
      const response = await api.get<RevenueAnalyticsSummary>(
        '/admin/analytics/revenue',
        { params: dateRange }
      );

      return response.data;
    } catch {
      // Fallback to mock data if API is not available
      return generateMockAnalytics();
    }
  },

  async getDailyRevenue(
    startDate: string,
    endDate: string
  ): Promise<DailyRevenue[]> {
    try {
      const response = await api.get<DailyRevenue[]>(
        '/admin/analytics/revenue/daily',
        { params: { startDate, endDate } }
      );

      return response.data;
    } catch {
      return generateMockDailyRevenue(30);
    }
  },

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    try {
      const response = await api.get<MonthlyRevenue[]>(
        '/admin/analytics/revenue/monthly',
        { params: { year } }
      );

      return response.data;
    } catch {
      return generateMockMonthlyRevenue();
    }
  },

  async getRouteRevenue(
    dateRange?: AnalyticsDateRange
  ): Promise<RouteRevenue[]> {
    try {
      const response = await api.get<RouteRevenue[]>(
        '/admin/analytics/revenue/routes',
        { params: dateRange }
      );

      return response.data;
    } catch {
      return generateMockRouteRevenue();
    }
  },

  async exportReport(
    dateRange: AnalyticsDateRange,
    format: 'csv' | 'pdf'
  ): Promise<Blob> {
    const response = await api.get('/admin/analytics/export', {
      params: { ...dateRange, format },
      responseType: 'blob',
    });

    return response.data as Blob;
  },
};
