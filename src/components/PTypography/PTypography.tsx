import { VariantProps } from 'class-variance-authority';
import { HTMLAttributes } from 'react';
import '../../index.css';
import cn from '../../utils/cn';
import { PTypographyVariants } from './PTypography.constants';

export interface PTypographyProps
  extends VariantProps<typeof PTypographyVariants>,
    HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  children: React.ReactNode;
}

export default function PTypography({
  as: Element = 'p',
  children,
  className = '',
  variant,
  ...props
}: PTypographyProps) {
  return (
    <Element
      className={cn(PTypographyVariants({ variant, className }))}
      {...props}
    >
      {children}
    </Element>
  );
}
