import React from 'react';

export const GuestLookupPage: React.FC = () => {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-white p-10 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-900">Guest booking lookup</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Soon you will be able to retrieve tickets using your reference code, phone number, or email address.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">For now, please contact support for assistance.</p>
    </div>
  );
};
