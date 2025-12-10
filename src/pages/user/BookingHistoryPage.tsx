import React from 'react';

export const BookingHistoryPage: React.FC = () => {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900">Booking history</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We are building a personalized area where you will be able to review and manage your bookings.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Check back soon for updates.</p>
    </div>
  );
};
