import { useState } from 'react';
import { useDebounce, useUpdateEffect } from 'react-use';

export const useQueryWithDelay = (
  defaultQuery: string = '',
  delay: number = 300,
  onQueryChange?: (query: string | number) => void
) => {
  const [query, setQuery] = useState<string>(defaultQuery);
  const [preQuery, setPreQuery] = useState<string>(defaultQuery);

  useUpdateEffect(() => {
    onQueryChange?.(query);
  }, [query]);

  useDebounce(
    () => {
      setQuery(preQuery);
    },
    delay,
    [preQuery]
  );

  return {
    query,
    setQuery,
    setPreQuery,
    preQuery,
  };
};
