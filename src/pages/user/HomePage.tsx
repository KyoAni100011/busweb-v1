import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CitySuggestion } from '@/types';
import { locationService } from '@/services/location.service';

const MIN_PASSENGERS = 1;
const MAX_PASSENGERS = 5;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<CitySuggestion | null>(null);
  const [destination, setDestination] = useState<CitySuggestion | null>(null);
  const [travelDate, setTravelDate] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [cityOptions, setCityOptions] = useState<CitySuggestion[]>([]);
  const [popularOrigins, setPopularOrigins] = useState<CitySuggestion[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setIsLoadingCities(true);
    locationService
      .getPopularCities(24)
      .then((cities) => {
        setCityOptions(cities);
        setPopularOrigins(cities.slice(0, 6));
      })
      .catch(() => {
        setCityOptions([]);
        setPopularOrigins([]);
      })
      .finally(() => setIsLoadingCities(false));
  }, []);

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const formattedCities = useMemo(
    () => cityOptions.map((city) => ({
      ...city,
      label: city.region ? `${city.name}, ${city.region}` : city.country ? `${city.name}, ${city.country}` : city.name,
    })),
    [cityOptions]
  );

  const destinationOptions = useMemo(() => {
    if (!origin) return formattedCities;
    return formattedCities.filter((city) => city.id !== origin.id);
  }, [formattedCities, origin]);

  const handleOriginChange = (cityId: string) => {
    const city = formattedCities.find((item) => item.id === cityId) || null;
    setOrigin(city);
    if (city && destination && destination.id === city.id) {
      setDestination(null);
    }
  };

  const handleDestinationChange = (cityId: string) => {
    const city = formattedCities.find((item) => item.id === cityId) || null;
    setDestination(city);
    if (city && origin && origin.id === city.id) {
      setOrigin(null);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!origin || !destination || !travelDate) {
      setError('Please select origin, destination, and travel date.');
      return;
    }

    if (origin.id === destination.id) {
      setError('Origin and destination must be different cities.');
      return;
    }

    setError('');
    navigate({
      pathname: '/search',
      search: new URLSearchParams({
        originCityId: origin.id,
        destinationCityId: destination.id,
        origin: origin.name,
        destination: destination.name,
        travelDate,
        passengers: String(passengers),
      }).toString(),
    });
  };

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 shadow-sm">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Plan your next journey</h1>
            <p className="text-lg text-muted-foreground">
              Find the best routes, compare amenities, and secure your seats in minutes.
            </p>
            <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground" htmlFor="origin-select">
                      From
                    </label>
                    <div className="relative">
                      <select
                        id="origin-select"
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={origin?.id || ''}
                        onChange={(event) => handleOriginChange(event.target.value)}
                        disabled={isLoadingCities}
                      >
                        <option value="" disabled>
                          {isLoadingCities ? 'Loading cities...' : 'Select origin city'}
                        </option>
                        {formattedCities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-muted-foreground" htmlFor="destination-select">
                      To
                    </label>
                    <div className="relative">
                      <select
                        id="destination-select"
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={destination?.id || ''}
                        onChange={(event) => handleDestinationChange(event.target.value)}
                        disabled={isLoadingCities}
                      >
                        <option value="" disabled>
                          {isLoadingCities ? 'Loading cities...' : 'Select destination city'}
                        </option>
                        {destinationOptions.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm text-muted-foreground" htmlFor="travelDate">
                        Travel Date
                      </label>
                      <Input
                        id="travelDate"
                        type="date"
                        value={travelDate}
                        onChange={(event) => setTravelDate(event.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-muted-foreground" htmlFor="passengers">
                        Passengers
                      </label>
                      <Input
                        id="passengers"
                        type="number"
                        value={passengers}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (Number.isNaN(next)) {
                            return;
                          }
                          setPassengers(Math.min(Math.max(next, MIN_PASSENGERS), MAX_PASSENGERS));
                        }}
                        min={MIN_PASSENGERS}
                        max={MAX_PASSENGERS}
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="button" variant="outline" onClick={swapLocations} className="w-full md:w-auto">
                      Swap
                    </Button>
                    <Button type="submit" className="w-full md:w-auto">
                      Search Trips
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            </div>
          </div>
          <div className="hidden flex-col justify-center space-y-6 rounded-2xl bg-white/70 p-6 shadow-sm md:flex">
            <h2 className="text-xl font-semibold text-gray-900">Popular destinations</h2>
            <div className="grid grid-cols-2 gap-4">
              {popularOrigins.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-left text-sm font-medium text-primary transition hover:bg-primary/10"
                  onClick={() => {
                    setOrigin(city);
                    if (!destination || destination.id === city.id) {
                      setDestination(null);
                    }
                  }}
                >
                  {city.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Pick an origin from the dropdown to get started. Destinations unlock once you choose a different city.
            </p>
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Flexible search',
            description: 'Compare trips across multiple operators with filters for time, price, and amenities.',
          },
          {
            title: 'Secure booking',
            description: 'Lock seats instantly and finish booking in a frictionless checkout experience.',
          },
          {
            title: 'Manage trips',
            description: 'Retrieve e-tickets, update passenger details, and view booking history anytime.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
