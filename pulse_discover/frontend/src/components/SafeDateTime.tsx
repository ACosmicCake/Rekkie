"use client";

import { useState, useEffect } from 'react';

interface SafeDateTimeProps {
  dateTime: string;
  options: Intl.DateTimeFormatOptions;
}

export function SafeDateTime({ dateTime, options }: SafeDateTimeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formattedDate = new Date(dateTime).toLocaleDateString(undefined, options);

  return (
    <>
      {isClient ? formattedDate : null}
    </>
  );
}
