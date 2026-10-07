export type HeaderProps = Record<string, never>;

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              AM
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
