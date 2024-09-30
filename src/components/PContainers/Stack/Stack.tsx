import { CSSProperties, FC, ReactNode } from 'react';
import cn from '../../../utils/cn';

export type StackProps = {
  children: ReactNode;
  gap?: CSSProperties['gap'];
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  className?: string;
};

const Stack: FC<StackProps> = ({
  children,
  gap = 0,
  alignItems = undefined,
  justifyContent = undefined,
  className = '',
}) => {
  return (
    <div
      aria-label='Stack container'
      className={cn('flex flex-col', className)}
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

export default Stack;
