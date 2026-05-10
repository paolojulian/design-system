import { SVGAttributes } from 'react';
import { cn } from '../utils';

type Props = SVGAttributes<SVGElement>;

export default function CalendarIcon({ className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path d="M6 3v3" />
      <path d="M14 3v3" />
      <path d="M4 8h12" />
      <path d="M5 5h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
