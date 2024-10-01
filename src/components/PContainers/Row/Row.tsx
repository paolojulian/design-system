import { CSSProperties, FC, ReactNode } from 'react';
import cn from '../../../utils/cn';

export type RowProps = {
  children: ReactNode;
  gap?: CSSProperties['gap'];
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  className?: string;
};

const Row: FC<RowProps> = ({
  children,
  gap = undefined,
  alignItems = undefined,
  justifyContent = undefined,
  className = '',
}) => {
  return (
    <div
      aria-label='Row container'
      className={cn('flex flex-row', className)}
      style={{
        gap,
        alignItems,
        justifyContent,
      }}
    >
      {children}
    </div>
  );
};

export default Row;
