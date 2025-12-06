import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bus,
  Route,
  MapPin,
  Armchair,
  Calendar,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Routes',
      value: '12',
      icon: Route,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Buses',
      value: '24',
      icon: Bus,
      color: 'bg-green-500',
    },
    {
      name: 'Total Stops',
      value: '48',
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      name: 'Available Seats',
      value: '320',
      icon: Armchair,
      color: 'bg-orange-500',
    },
    {
      name: 'Scheduled Trips',
      value: '18',
      icon: Calendar,
      color: 'bg-pink-500',
    },
    {
      name: 'Revenue (Today)',
      value: '$2,450',
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your bus system today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
