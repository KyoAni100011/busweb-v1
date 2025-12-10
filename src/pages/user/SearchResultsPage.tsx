import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { publicTripService } from '@/services/publicTrip.service';
import { locationService } from '@/services/location.service';
import type { CitySuggestion, TripSearchFilters, TripSearchQuery, TripSearchResponse, TripSummary } from '@/types';
import { TripCard } from '@/components/user/TripCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBooking } from '@/contexts/BookingContext';

const SORT_OPTIONS: Array<{ label: string; sortBy: 'PRICE' | 'DEPARTURE' | 'DURATION'; sortOrder: 'ASC' | 'DESC' }> = [
  { label: 'Lowest price', sortBy: 'PRICE', sortOrder: 'ASC' },
  { label: 'Earliest departure', sortBy: 'DEPARTURE', sortOrder: 'ASC' },
  { label: 'Shortest duration', sortBy: 'DURATION', sortOrder: 'ASC' },
];

const parseQueryParams = (params: URLSearchParams): TripSearchQuery | null => {
  const originCityId = params.get('originCityId');
  const destinationCityId = params.get('destinationCityId');
  const travelDate = params.get('travelDate');

  if (!originCityId || !destinationCityId || !travelDate) {
    return null;
  }

  const passengersRaw = params.get('passengers');
  const passengers = passengersRaw ? Number(passengersRaw) : undefined;

  return {
    originCityId,
    destinationCityId,
    travelDate,
    passengers: passengers && !Number.isNaN(passengers) ? passengers : undefined,
  };
};

const useSearchFilters = () => {
  const [filters, setFilters] = useState<TripSearchFilters>({ page: 1, pageSize: 10 });

  const updateFilter = useCallback((partial: Partial<TripSearchFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };
      if (partial.page === undefined) {
        next.page = 1;
      }

      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ page: 1, pageSize: 10 });
  }, []);

  return { filters, updateFilter, resetFilters };
};

export const SearchResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setTrip } = useBooking();
  const [searchParams] = useSearchParams();
  const query = useMemo(() => parseQueryParams(searchParams), [searchParams]);
  const { filters, updateFilter, resetFilters } = useSearchFilters();
  const [results, setResults] = useState<TripSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableBusTypes, setAvailableBusTypes] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  const [originCity, setOriginCity] = useState<CitySuggestion | null>(null);
  const [destinationCity, setDestinationCity] = useState<CitySuggestion | null>(null);
  const fallbackTrip = results?.trips?.[0];

  const fetchTrips = useCallback(async () => {
    if (!query) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await publicTripService.searchTrips(query, filters);
      setResults(response);
      setAvailableBusTypes(response.facets?.busTypes ?? []);
      setAvailableAmenities(response.facets?.amenities ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load search results');
    } finally {
      setIsLoading(false);
    }
  }, [filters, query]);

  useEffect(() => {
    if (!query) {
      return;
    }

    fetchTrips();
  }, [fetchTrips, query]);

  useEffect(() => {
    let isMounted = true;

    const loadCities = async () => {
      if (!query) {
        setOriginCity(null);
        setDestinationCity(null);

        return;
      }

      try {
        const [originResponse, destinationResponse] = await Promise.all([
          locationService.getCityById(query.originCityId),
          locationService.getCityById(query.destinationCityId),
        ]);

        if (!isMounted) {
          return;
        }

        setOriginCity(originResponse);
        setDestinationCity(destinationResponse);
      } catch {
        if (!isMounted) {
          return;
        }

        setOriginCity(null);
        setDestinationCity(null);
      }
    };

    loadCities();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const travelSummary = useMemo(() => {
    if (!query) {
      return '';
    }

    const details: string[] = [];
    const originLabel = originCity?.name ?? fallbackTrip?.originCity;
    const destinationLabel = destinationCity?.name ?? fallbackTrip?.destinationCity;

    if (originLabel && destinationLabel) {
      details.push(`${originLabel} → ${destinationLabel}`);
    }

    const dateValue = new Date(query.travelDate);
    if (!Number.isNaN(dateValue.getTime())) {
      details.push(dateValue.toLocaleDateString());
    }

    return details.join(' · ');
  }, [destinationCity?.name, fallbackTrip?.destinationCity, fallbackTrip?.originCity, originCity?.name, query?.travelDate]);

  const handleViewDetails = (trip: TripSummary) => {
    setTrip(trip);
    navigate(`/trip/${trip.id}`);
  };

  const handleSelectSeats = (trip: TripSummary) => {
    setTrip(trip);
    navigate(`/trip/${trip.id}/select-seats`);
  };

  if (!query) {
    return (
      <div className="rounded-xl border border-dashed border-primary/40 bg-white p-10 text-center">
        <h2 className="text-xl font-semibold text-primary">Ready to search?</h2>
        <p className="mt-2 text-muted-foreground">Start from the homepage to choose your route and travel date.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>Back to homepage</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          <div className="mt-4 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Price range</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={(event) => updateFilter({ minPrice: event.target.value ? Number(event.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={(event) => updateFilter({ maxPrice: event.target.value ? Number(event.target.value) : undefined })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Departure time</p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={filters.departureStart ?? ''}
                  onChange={(event) => updateFilter({ departureStart: event.target.value || undefined })}
                />
                <Input
                  type="time"
                  value={filters.departureEnd ?? ''}
                  onChange={(event) => updateFilter({ departureEnd: event.target.value || undefined })}
                />
              </div>
            </div>
            {availableBusTypes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Bus type</p>
                <div className="space-y-1 text-sm">
                  {availableBusTypes.map((busType) => {
                    const isSelected = filters.busTypes?.includes(busType);
                    return (
                      <label key={busType} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => {
                            updateFilter({
                              busTypes: event.target.checked
                                ? [...(filters.busTypes ?? []), busType]
                                : (filters.busTypes ?? []).filter((value) => value !== busType),
                            });
                          }}
                        />
                        {busType}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {availableAmenities.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Amenities</p>
                <div className="space-y-1 text-sm">
                  {availableAmenities.map((amenity) => {
                    const isSelected = filters.amenities?.includes(amenity);
                    return (
                      <label key={amenity} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) => {
                            updateFilter({
                              amenities: event.target.checked
                                ? [...(filters.amenities ?? []), amenity]
                                : (filters.amenities ?? []).filter((value) => value !== amenity),
                            });
                          }}
                        />
                        {amenity}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
      <section className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing {results?.trips.length ?? 0} of {results?.totalItems ?? 0} trips
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">Available trips</h1>
            {travelSummary && (
              <p className="mt-1 text-sm text-muted-foreground">{travelSummary}</p>
            )}
          </div>
          <div className="flex gap-3">
            {SORT_OPTIONS.map((option) => {
              const isActive = filters.sortBy === option.sortBy && filters.sortOrder === option.sortOrder;
              return (
                <Button
                  key={option.label}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter({ sortBy: option.sortBy, sortOrder: option.sortOrder })}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
        {isLoading && (
          <div className="rounded-xl border bg-white p-6 text-center text-muted-foreground">Loading trips...</div>
        )}
        {error && (
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {!isLoading && !error && results && (results.trips?.length ?? 0) === 0 && (
          <div className="rounded-xl border border-dashed border-primary/40 bg-white p-10 text-center text-muted-foreground">
            We could not find any trips matching your filters. Try adjusting your search criteria.
          </div>
        )}
        <div className="space-y-4">
          {results?.trips?.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onViewDetails={handleViewDetails}
              onSelectSeats={handleSelectSeats}
            />
          ))}
        </div>
        {results && results.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: results.totalPages }).map((_, index) => {
              const page = index + 1;
              const isActive = filters.page === page;
              return (
                <Button
                  key={page}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter({ page })}
                >
                  {page}
                </Button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
