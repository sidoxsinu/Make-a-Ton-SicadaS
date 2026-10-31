import React from 'react';
import { InvoiceStatus } from '@/types/invoice';

interface InvoiceStateStepperProps {
  currentStatus: InvoiceStatus;
}

const steps: { label: string; key: InvoiceStatus }[] = [
  { label: 'Draft', key: 'DRAFT' },
  { label: 'Confirmed', key: 'CONFIRMED' },
  { label: 'Paid', key: 'PAID' },
];

export const InvoiceStateStepper: React.FC<InvoiceStateStepperProps> = ({ currentStatus }) => {
  const statusOrder: Record<InvoiceStatus, number> = {
    DRAFT: 0,
    CONFIRMED: 1,
    OVERDUE: 1,
    PARTIAL: 1,
    PAID: 2,
    CANCELLED: 2,
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
