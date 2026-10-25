import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | Kalinga Model Residential School, Umerkote`
      : 'Kalinga Model Residential School, Umerkote';
  }, [title]);
}