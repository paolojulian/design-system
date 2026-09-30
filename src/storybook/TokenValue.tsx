import { useEffect, useRef, useState } from 'react';

/**
 * Stories only. Reads a token's live computed value, so a documentation page
 * cannot drift from the stylesheet it documents.
 */
export function TokenValue({ token }: { token: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const read = () => {
      if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(token).trim());
    };
    read();
    // The theme toolbar changes attributes on <html> without remounting the story.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-design'] });
    return () => observer.disconnect();
  }, [token]);

  return (
    <span ref={ref} className="dl-doc__value">
      {value}
    </span>
  );
}
