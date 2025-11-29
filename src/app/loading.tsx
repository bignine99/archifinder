import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <Card>
            <CardContent className="relative flex items-center justify-center p-6 min-h-[140px]">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Skeleton className="h-12 w-[200px]" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-96 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                 <Skeleton className="h-9 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filter Panel Skeleton */}
          <aside className="md:col-span-1 space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </aside>

          {/* Project Grid Skeleton */}
          <section className="md:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="border bg-card p-4 rounded-lg">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
       <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <Skeleton className="h-6 w-48" />
        </div>
      </footer>
    </div>
  );
}
