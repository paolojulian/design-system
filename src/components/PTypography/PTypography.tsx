import { FC, ReactNode } from 'react';

export type PTypographyProps = {
  children: ReactNode;
};

const PTypography: FC<PTypographyProps> = ({ children }) => {
  return <div className='test'>{children}</div>;
};

export default PTypography;
