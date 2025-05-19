import { dikiMetadata } from '@/constants';

const CanonicalTag = () => {
  return (
    <link rel="canonical" href={dikiMetadata.url} />
  );
};

export default CanonicalTag;