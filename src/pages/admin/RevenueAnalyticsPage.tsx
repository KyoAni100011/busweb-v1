import React, { useEffect, useState, useMemo } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, PieChart, ProgressBar, Sparkline } from '@/components/ui/charts';
import type { RevenueAnalyticsSummary, AnalyticsDateRange } from '@/types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Ticket,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
} from 'lucide-react';

type DatePreset = 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear';

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
];

const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const formatCurrency = (value: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toString();
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
  trendLabel,
  sparklineData,
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : trend < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-sm text-gray-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`rounded-lg p-3 ${iconColor}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {sparklineData && sparklineData.length > 1 && (
            <div className="h-8 w-20">
              <Sparkline
                data={sparklineData}
                color={trend && trend > 0 ? CHART_COLORS.success : CHART_COLORS.danger}
              />
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const getDateRange = (preset: DatePreset): AnalyticsDateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'last7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: today.toISOString(),
        preset,
      };
    case 'last30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: today.toISOString(),
        preset,
      };
    case 'thisMonth':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: today.toISOString(),
        preset,
      };
    case 'lastMonth':
      return {
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth(), 0).toISOString(),
        preset,
      };
    case 'thisYear':
      return {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
        endDate: today.toISOString(),
        preset,
      };
    default:
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: today.toISOString(),
        preset: 'last30days',
      };
  }
};

export const RevenueAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<RevenueAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('last30days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (preset: DatePreset) => {
    try {
      setIsLoading(true);
      setError(null);
      const dateRange = getDateRange(preset);
      const data = await analyticsService.getRevenueAnalytics(dateRange);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPreset);
  }, [selectedPreset]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics(selectedPreset);
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const dateRange = getDateRange(selectedPreset);
      const blob = await analyticsService.exportReport(dateRange, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report-${selectedPreset}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const chartData = useMemo(() => {
    if (!analytics) {
      return { daily: [], monthly: [], busType: [], payment: [] };
    }

    return {
      daily: analytics.dailyRevenue.map((d) => ({
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.revenue,
      })),
      monthly: analytics.monthlyRevenue.map((d) => ({
        label: d.month,
        value: d.revenue,
      })),
      busType: analytics.busTypeRevenue.map((d, i) => ({
        label: d.busType,
        value: d.revenue,
        color: [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.purple][i] || CHART_COLORS.primary,
      })),
      payment: analytics.paymentMethods.map((d, i) => ({
        label: d.method,
        value: d.amount,
        color: [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.pink][i] || CHART_COLORS.primary,
      })),
    };
  }, [analytics]);

  const revenueSparkline = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.dailyRevenue.slice(-7).map((d) => d.revenue);
  }, [analytics]);

  if (isLoading && !analytics) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="mt-1 text-gray-600">
            Track your business performance and financial metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-white p-1">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedPreset(preset.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedPreset === preset.value
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {analytics && (
        <>
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(analytics.metrics.totalRevenue, analytics.metrics.currency)}
              icon={DollarSign}
              iconColor="bg-green-500"
              trend={12}
              trendLabel="vs last period"
              sparklineData={revenueSparkline}
            />
            <MetricCard
              title="Net Revenue"
              value={formatCurrency(analytics.metrics.netRevenue, analytics.metrics.currency)}
              subtitle={`After ${formatCurrency(analytics.metrics.refundedAmount)} refunds`}
              icon={TrendingUp}
              iconColor="bg-blue-500"
              trend={8}
              trendLabel="vs last period"
            />
            <MetricCard
              title="Total Bookings"
              value={formatNumber(analytics.metrics.totalBookings)}
              icon={Ticket}
              iconColor="bg-purple-500"
              trend={15}
              trendLabel="vs last period"
            />
            <MetricCard
              title="Avg. Ticket Price"
              value={formatCurrency(analytics.metrics.averageTicketPrice, analytics.metrics.currency)}
              icon={CreditCard}
              iconColor="bg-orange-500"
              trend={-3}
              trendLabel="vs last period"
            />
          </div>

          {/* Charts Row */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart
                    data={chartData.daily}
                    height={300}
                    lineColor={CHART_COLORS.primary}
                    formatValue={(v) => formatCompactNumber(v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue comparison by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <BarChart
                    data={chartData.monthly}
                    height={300}
                    barColor={CHART_COLORS.success}
                    formatValue={(v) => formatCompactNumber(v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue by Bus Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Bus Type</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={chartData.busType} />
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={chartData.payment} />
              </CardContent>
            </Card>

            {/* Booking Status */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.bookingStatuses.map((status) => (
                    <ProgressBar
                      key={status.status}
                      value={status.percentage}
                      max={100}
                      label={status.status}
                      color={
                        status.status === 'CONFIRMED'
                          ? CHART_COLORS.success
                          : status.status === 'PENDING'
                            ? CHART_COLORS.warning
                            : CHART_COLORS.danger
                      }
                    />
                  ))}
                </div>
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Bookings</span>
                    <span className="font-medium">
                      {analytics.bookingStatuses.reduce((sum, s) => sum + s.count, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Routes Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Routes</CardTitle>
                <CardDescription>Routes with highest revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="pb-3 font-medium">Route</th>
                        <th className="pb-3 text-right font-medium">Revenue</th>
                        <th className="pb-3 text-right font-medium">Bookings</th>
                        <th className="pb-3 text-right font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topRoutes.map((route, index) => (
                        <tr key={route.routeId} className="border-b last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-900">{route.routeName}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-medium">
                            {formatCurrency(route.revenue)}
                          </td>
                          <td className="py-3 text-right text-gray-600">{route.bookings}</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {route.trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : route.trend === 'down' ? (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              ) : (
                                <Minus className="h-4 w-4 text-gray-400" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  route.trend === 'up'
                                    ? 'text-green-500'
                                    : route.trend === 'down'
                                      ? 'text-red-500'
                                      : 'text-gray-400'
                                }`}
                              >
                                {route.trendPercentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Route Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Route Performance</CardTitle>
                <CardDescription>Occupancy rate by route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.routeRevenue.slice(0, 5).map((route) => (
                    <div key={route.routeId}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{route.routeName}</span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(route.totalRevenue)}
                        </span>
                      </div>
                      <ProgressBar
                        value={route.occupancyRate}
                        max={100}
                        color={
                          route.occupancyRate >= 80
                            ? CHART_COLORS.success
                            : route.occupancyRate >= 50
                              ? CHART_COLORS.warning
                              : CHART_COLORS.danger
                        }
                        showLabel={false}
                      />
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{route.bookings} bookings</span>
                        <span>{route.occupancyRate}% occupancy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>
                    Period: {new Date(analytics.periodStart).toLocaleDateString()} -{' '}
                    {new Date(analytics.periodEnd).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-600">Gross Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-green-700">
                    {formatCurrency(analytics.metrics.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-600">Refunds</p>
                  <p className="mt-1 text-2xl font-bold text-red-700">
                    {formatCurrency(analytics.metrics.refundedAmount)}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-600">Net Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {formatCurrency(analytics.metrics.netRevenue)}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="text-sm font-medium text-purple-600">Avg. Transaction</p>
                  <p className="mt-1 text-2xl font-bold text-purple-700">
                    {formatCurrency(analytics.metrics.averageTicketPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
