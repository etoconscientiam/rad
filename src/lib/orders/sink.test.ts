import { afterEach, describe, expect, it } from 'vitest';
import { resolveSink } from './sink';
import type { Order } from './types';

const original = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  secretKey: process.env.SUPABASE_SECRET_KEY,
  legacyKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

afterEach(() => {
  if (original.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = original.url;
  if (original.secretKey === undefined) delete process.env.SUPABASE_SECRET_KEY;
  else process.env.SUPABASE_SECRET_KEY = original.secretKey;
  if (original.legacyKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = original.legacyKey;
});

describe('выбор приёмника заявок', () => {
  it('без серверного подключения заявка не уходит в никуда, а падает с ошибкой', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sink = resolveSink();
    expect(sink.name).toBe('не настроен');
    await expect(sink.submit({} as Order)).rejects.toThrow(/Supabase/);
  });

  it('с современным серверным ключом берётся Supabase', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'sb_secret_test';
    expect(resolveSink().name).toBe('supabase');
  });

  it('при обновлении окружения принимает прежний серверный ключ', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-service-role';
    expect(resolveSink().name).toBe('supabase');
  });
});
