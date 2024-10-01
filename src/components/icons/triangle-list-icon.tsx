import { SVGAttributes } from 'react';
import { cn } from '../../utils';

type Props = SVGAttributes<SVGElement>;

export default function TriangleListIcon({ className, ...props }: Props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='11'
      height='12'
      viewBox='0 0 11 12'
      fill='none'
      className={cn('text-secondary', className)}
      {...props}
    >
      <path
        d='M-4.89749e-07 0.397423L10.9999 0.397422L10.9999 11.6016L-4.89749e-07 0.397423Z'
        fill='currentColor'
      />
    </svg>
  );
}
