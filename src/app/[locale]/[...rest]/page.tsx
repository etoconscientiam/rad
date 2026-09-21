import { notFound } from 'next/navigation';

/**
 * Ловит всё, что не совпало с настоящими маршрутами внутри локали, и уводит
 * на оформленную страницу 404. Без этого Next отдаёт свою встроенную —
 * без шрифтов, токенов и пути обратно.
 */
export default function CatchAll(): never {
  notFound();
}
