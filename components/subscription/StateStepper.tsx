import React from 'react';
import { SubscriptionStatus } from '@/types/subscription';

interface StateStepperProps {
  currentStatus: SubscriptionStatus;
}

const steps: { label: string; key: SubscriptionStatus }[] = [
  { label: 'Draft', key: 'DRAFT' },
  { label: 'Quotation', key: 'QUOTATION' },
  { label: 'Confirmed', key: 'CONFIRMED' },
  { label: 'Active', key: 'ACTIVE' },
  { label: 'Closed', key: 'CLOSED' },
];

export const StateStepper: React.FC<StateStepperProps> = ({ currentStatus }) => {
  const statusOrder: Record<SubscriptionStatus, number> = {
    DRAFT: 0,
    QUOTATION: 1,
    CONFIRMED: 2,
    ACTIVE: 3,
    PAUSED: 3,
    CLOSED: 4,
    CANCELLED: 4,
  };

  const currentIndex = statusOrder[currentStatus] ?? 0;

  return (
    <div className="flex items-center gap-2 py-2">
      {steps.map((step, idx) => {
        const isPassed = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        let circleStyle = 'bg-[#eee9df] text-[#6e6a5f] border-[#d1c9b8]';
        let textStyle = 'text-[#6e6a5f]';

        if (isPassed) {
          circleStyle = 'bg-[#1e4d58] text-[#f4f1ea] border-[#1e4d58]';
          textStyle = 'text-[#2b2b2b] font-medium';
        } else if (isCurrent) {
          circleStyle = 'bg-[#f4f1ea] text-[#1e4d58] border-[#1e4d58] font-bold';
          textStyle = 'text-[#1e4d58] font-bold';
        }

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className={`w-5 h-5 flex items-center justify-center rounded-[2px] border font-mono text-[11px] ${circleStyle}`}>
                {idx + 1}
              </span>
              <span className={textStyle}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-[1px] w-6 ${idx < currentIndex ? 'bg-[#1e4d58]' : 'bg-[#d1c9b8]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
