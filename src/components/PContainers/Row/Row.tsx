import { FC, ReactNode } from 'react';

export type RowProps = {
  children: ReactNode;
};

const Row: FC<RowProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Row;
