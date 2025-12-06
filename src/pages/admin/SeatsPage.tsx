import React, { useState, useEffect } from 'react';
import { seatService } from '@/services/seat.service';
import { busService } from '@/services/bus.service';
import type { Seat, CreateSeatDto, Bus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const SeatsPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [formData, setFormData] = useState<CreateSeatDto>({
    busId: '',
    seatNumber: '',
    type: 'STANDARD',
    position: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    loadBuses();
  }, []);

  useEffect(() => {
    if (selectedBusId) {
      loadSeats(selectedBusId);
      setFormData((prev) => ({ ...prev, busId: selectedBusId }));
    }
  }, [selectedBusId]);

  const loadBuses = async () => {
    try {
      const data = await busService.getAll();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading buses:', error);
      setBuses([]);
    }
  };

  const loadSeats = async (busId: string) => {
    try {
      setIsLoading(true);
      const data = await seatService.getByBus(busId);
      setSeats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading seats:', error);
      setSeats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeat) {
        await seatService.update(editingSeat.id, formData);
      } else {
        await seatService.create(formData);
      }
      if (selectedBusId) {
        await loadSeats(selectedBusId);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving seat:', error);
    }
  };

  const handleEdit = (seat: Seat) => {
    setEditingSeat(seat);
    setFormData({
      busId: seat.busId,
      seatNumber: seat.seatNumber,
      type: seat.type,
      position: seat.position,
      status: seat.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this seat?')) {
      try {
        await seatService.delete(id);
        if (selectedBusId) {
          await loadSeats(selectedBusId);
        }
      } catch (error) {
        console.error('Error deleting seat:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSeat(null);
    setFormData({
      busId: selectedBusId,
      seatNumber: '',
      type: 'STANDARD',
      position: '',
      status: 'AVAILABLE',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seats</h1>
          <p className="mt-2 text-gray-600">Manage bus seats</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedBusId}>
          <Plus className="mr-2 h-4 w-4" />
          Add Seat
        </Button>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <Label htmlFor="busSelect">Select Bus</Label>
        <select
          id="busSelect"
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select a bus</option>
          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.busNumber} - {bus.type}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            {editingSeat ? 'Edit Seat' : 'Create Seat'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seatNumber">Seat Number</Label>
                <Input
                  id="seatNumber"
                  value={formData.seatNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, seatNumber: e.target.value })
                  }
                  placeholder="e.g., A1, B2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="e.g., Window, Aisle"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'STANDARD' | 'VIP' | 'SLEEPER',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="VIP">VIP</option>
                  <option value="SLEEPER">Sleeper</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'AVAILABLE' | 'UNAVAILABLE',
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingSeat ? 'Update' : 'Create'}
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
                  Seat Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
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
              {!selectedBusId ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Please select a bus to view seats
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : seats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No seats found for this bus
                  </td>
                </tr>
              ) : (
                seats.map((seat) => (
                  <tr key={seat.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {seat.seatNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {seat.position}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {seat.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          seat.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {seat.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(seat)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(seat.id)}
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
