import { Stack } from '../PContainers';
import { PTypography } from '../PTypography';

interface Props {
  title: string;
}

export default function SectionHeader({ title }: Props) {
  return (
    <Stack className='ui-pt-2 ui-border-t ui-border-white ui-text-white'>
      <PTypography className='ui-uppercase' variant='body-wide'>
        {title}
      </PTypography>
    </Stack>
  );
}
