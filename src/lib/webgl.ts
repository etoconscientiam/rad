/**
 * Есть ли в браузере рабочий WebGL. Проверяем один раз и кэшируем:
 * создание контекста не бесплатно, а ответ за время сессии не меняется.
 */
let cached: boolean | null = null;

export function hasWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cached = !!gl;
    // Контекст сразу отдаём назад: держать лишний незачем, их число ограничено.
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
