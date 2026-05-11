import { CSSProperties, FC, ReactNode } from 'react';
import cn from '../../../utils/cn';
import './Stack.css';

export type StackProps = {
  children: ReactNode;
  gap?: CSSProperties['gap'];
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  className?: string;
};

const Stack: FC<StackProps> = ({
  children,
  gap = undefined,
  alignItems = undefined,
  justifyContent = undefined,
  className = '',
}) => {
  return (
    <div
      className={cn('p-stack', className)}
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
