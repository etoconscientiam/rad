import Image from 'next/image';
import { useTranslations } from 'next-intl';

/**
 * Фото работ. Разрешение исходников невысокое (560 px по длинной стороне),
 * оригиналы нужно запросить у владельца — docs/03-assets.md.
 */
const WORKS = [1, 2, 3, 4] as const;

export function Works() {
  const t = useTranslations();

  return (
    <section id="works" className="w-full pb-14">
      <div className="mx-auto max-w-page px-4 md:px-6">
      <h2 className="text-h2">{t('works.title')}</h2>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        {WORKS.map((n) => (
          <div
            key={n}
            className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-sunken"
          >
            <Image
              src={`/works/work-${n}.webp`}
              alt={`${t('works.photo')} ${n}`}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              className="object-cover"
            />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
