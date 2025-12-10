import React, { useState, useEffect } from 'react';
import { tripService } from '@/services/trip.service';
import { routeService } from '@/services/route.service';
import { busService } from '@/services/bus.service';
import type { Trip, CreateTripDto, Route, Bus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<CreateTripDto>({
    routeId: '',
    busId: '',
    departureTime: '',
    arrivalTime: '',
    basePrice: 0,
    status: 'SCHEDULED',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tripsData, routesData, busesData] = await Promise.all([
        tripService.getAll().catch(() => []),
        routeService.getAll().catch(() => []),
        busService.getAll().catch(() => []),
      ]);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setBuses(Array.isArray(busesData) ? busesData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setTrips([]);
      setRoutes([]);
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await tripService.update(editingTrip.id, formData);
      } else {
        await tripService.create(formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      routeId: trip.routeId,
      busId: trip.busId,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      basePrice: trip.basePrice,
      status: trip.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting trip:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTrip(null);
    setFormData({
      routeId: '',
      busId: '',
      departureTime: '',
      arrivalTime: '',
      basePrice: 0,
      status: 'SCHEDULED',
    });
  };

  const getBusLabel = (busId: string) => {
    const bus = buses.find((item) => item.id === busId);

    if (bus) {
      return `${bus.plateNumber} · ${bus.busType}`;
    }

    const fallback = trips.find((trip) => trip.bus?.id === busId)?.bus;

    if (fallback) {
      return `${fallback.plateNumber} · ${fallback.busType}`;
    }

    return '—';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trips</h1>
          <p className="mt-2 text-gray-600">Schedule and manage trips</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Trip
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            {editingTrip ? 'Edit Trip' : 'Schedule Trip'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="routeId">Route</Label>
                <select
                  id="routeId"
                  value={formData.routeId}
                  onChange={(e) =>
                    setFormData({ ...formData, routeId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} ({route.origin} → {route.destination})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="busId">Bus</Label>
                <select
                  id="busId"
                  value={formData.busId}
                  onChange={(e) =>
                    setFormData({ ...formData, busId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.plateNumber} · {bus.busType} ({bus.totalSeats} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) =>
                    setFormData({ ...formData, departureTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, basePrice: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingTrip ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Departure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Arrival
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {routes.find((r) => r.id === trip.routeId)?.name || trip.route?.name || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {getBusLabel(trip.busId) !== '—'
                        ? getBusLabel(trip.busId)
                        : trip.bus
                          ? `${trip.bus.plateNumber} · ${trip.bus.busType}`
                          : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(trip.departureTime).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(trip.arrivalTime).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ${trip.basePrice}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          trip.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : trip.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : trip.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(trip)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
