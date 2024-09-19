import { VariantProps } from 'class-variance-authority';
import '../../index.css';
import cn from '../../utils/cn';
import { PTypographyVariants } from './PTypography.constants';

export interface PTypographyProps
  extends VariantProps<typeof PTypographyVariants> {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function PTypography({
  as: Element = 'p',
  onClick,
  children,
  className = '',
  variant,
}: PTypographyProps) {
  return (
    <Element
      className={cn(PTypographyVariants({ variant, className }))}
      onClick={onClick}
    >
      {children}
    </Element>
  );
}
