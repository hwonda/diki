'use client';
import Link from 'next/link';
import { forwardRef } from 'react';

interface TooltipButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  tooltip?: string;
  children: React.ReactNode;
  isLink?: boolean;
  href?: string;
  className?: string;
  ariaLabel?: string;
  newWindow?: boolean;
}

const TooltipButton = forwardRef<HTMLDivElement, TooltipButtonProps>(
  ({ onClick, tooltip, children, isLink = false, href, className, ariaLabel, newWindow = false }, ref) => {
    return (
      <div ref={ref} className="relative group flex items-end">
        {isLink ? (
          <Link href={href!} className={`${ className }`} aria-label={ariaLabel} target={newWindow ? '_blank' : '_self'} rel="noopener noreferrer">
            {children}
          </Link>
        ) : (
          <button onClick={onClick} className={`${ className }`} aria-label={ariaLabel}>
            {children}
          </button>
        )}
        {tooltip && (
          <div
            className="animate-slideDown absolute -bottom-8 hidden group-hover:block shadow-md
            bg-background-secondary text-main text-xs py-1 px-2 rounded whitespace-nowrap
            z-50 before:content-[''] before:absolute before:top-[-4px] before:left-[12px]
            before:size-0 before:border-x-4 before:border-x-transparent before:border-b-4
            before:border-b-background-secondary"
          >
            <span className='font-semibold'>{tooltip}</span>
          </div>
        )}
      </div>
    );
  }
);

TooltipButton.displayName = 'TooltipButton';

export default TooltipButton;