import React, { useState, useEffect } from 'react';
import { busService } from '@/services/bus.service';
import type { Bus, CreateBusDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const BusesPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState<CreateBusDto>({
    plateNumber: '',
    busType: '',
    totalSeats: 0,
    amenities: '',
  });

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setIsLoading(true);
      const data = await busService.getAll();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading buses:', error);
      setBuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await busService.update(editingBus.id, formData);
      } else {
        await busService.create(formData);
      }
      await loadBuses();
      resetForm();
    } catch (error) {
      console.error('Error saving bus:', error);
    }
  };

  const handleEdit = (bus: Bus) => {
    setEditingBus(bus);
    setFormData({
      plateNumber: bus.plateNumber,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await busService.delete(id);
        await loadBuses();
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBus(null);
    setFormData({
      plateNumber: '',
      busType: '',
      totalSeats: 0,
      amenities: '',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
          <p className="mt-2 text-gray-600">Manage your bus fleet</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bus
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            {editingBus ? 'Edit Bus' : 'Create Bus'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, plateNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="busType">Bus Type</Label>
                <Input
                  id="busType"
                  value={formData.busType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      busType: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="totalSeats">Total Seats</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalSeats: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  value={formData.amenities ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  placeholder="Comma separated (e.g., WiFi, AC)"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingBus ? 'Update' : 'Create'}
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
                  Plate Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bus Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amenities
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : buses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No buses found
                  </td>
                </tr>
              ) : (
                buses.map((bus) => (
                  <tr key={bus.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {bus.plateNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {bus.busType}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {bus.totalSeats} seats
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {bus.amenities || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(bus)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bus.id)}
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
