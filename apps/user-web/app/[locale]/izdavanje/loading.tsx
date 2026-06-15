import { CardsSkeleton } from '@/app/components/Loader';

export default function IzdavanjeLoading() {
  return (
    <main className="min-h-screen overflow-visible">
      <section className="py-6 bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex items-center justify-start mb-3">
            <div className="h-9 w-48 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="mb-4">
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <CardsSkeleton count={8} />
        </div>
      </section>
    </main>
  );
}
