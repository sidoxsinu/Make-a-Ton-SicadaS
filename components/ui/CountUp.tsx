'use client';

import React, { useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  isCurrency?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({ value, isCurrency = false }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return (
      <span className="font-mono">
        {new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(displayValue)}
      </span>
    );
  }

  return <span className="font-mono">{Math.round(displayValue).toLocaleString('en-IN')}</span>;
};
