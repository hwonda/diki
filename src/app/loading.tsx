import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex min-h-96 animate-fadeIn items-center justify-center">
      <LoadingSpinner fixed={false} text="불러오는 중" />
    </div>
  );
}
