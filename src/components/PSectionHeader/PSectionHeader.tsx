import { Stack } from '../PContainers';
import { PTypography } from '../PTypography';

interface Props {
  title: string;
}

export default function SectionHeader({ title }: Props) {
  return (
    <Stack className='pt-2 border-t border-white text-white'>
      <PTypography className='uppercase' variant='body-wide'>
        {title}
      </PTypography>
    </Stack>
  );
}
