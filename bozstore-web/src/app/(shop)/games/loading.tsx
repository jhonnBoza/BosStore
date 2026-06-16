export default function GamesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div className="mb-10">
        <div className="h-14 w-72 animate-pulse bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse border border-white/5 bg-zinc-900">
            <div className="aspect-[3/4] bg-zinc-800" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 bg-zinc-800" />
              <div className="h-2 w-1/2 bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
