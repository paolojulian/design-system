import { SVGAttributes } from 'react';
import { cn } from '../utils';

type Props = SVGAttributes<SVGElement>;

export default function ChevronRightIcon({ className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
