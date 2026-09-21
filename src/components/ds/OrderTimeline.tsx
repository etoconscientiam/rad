import { cn } from '@/lib/cn';

/**
 * Таймлайн заказа: пройденное — --success, текущее — кольцо --accent
 * и жирная подпись, будущее — контур.
 */

export type TimelineStep = {
  label: string;
  /** Дата моноширинным — это техданные. */
  date?: string;
  state: 'done' | 'current' | 'future';
};

const DOT: Record<TimelineStep['state'], string> = {
  done: 'bg-success border-success',
  current: 'bg-surface border-accent',
  future: 'bg-surface border-border-strong',
};

export function OrderTimeline({ steps, className }: { steps: TimelineStep[]; className?: string }) {
  return (
    <ol className={cn('flex list-none flex-col', className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={step.label} className="flex gap-4">
            <div className="flex w-3.5 flex-col items-center">
              <span
                aria-hidden="true"
                className={cn('mt-[3px] size-3.5 shrink-0 rounded-full border-2', DOT[step.state])}
              />
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'min-h-6 w-0.5 flex-1',
                    step.state === 'done' ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className={last ? undefined : 'pb-5'}>
              <div
                className={cn(
                  'text-param',
                  step.state === 'current' ? 'font-bold' : 'font-medium',
                  step.state === 'future' ? 'text-ink-muted' : 'text-ink',
                )}
              >
                {step.label}
              </div>
              {step.date && (
                <div className="mt-0.5 font-mono text-small text-ink-muted">{step.date}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
