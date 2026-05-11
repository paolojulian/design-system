import { CSSProperties, FC, ReactNode } from 'react';
import cn from '../../../utils/cn';
import './Row.css';

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
      className={cn('p-row', className)}
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
