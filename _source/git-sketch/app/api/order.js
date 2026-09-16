const REQUIRED_FIELDS = ['type', 'width', 'depth', 'height', 'qty', 'profile', 'metalColor', 'client'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Только POST' });
    return;
  }

  const { TODOIST_TOKEN, TODOIST_PROJECT_ID, TODOIST_SECTION_ID } = process.env;
  if (!TODOIST_TOKEN || !TODOIST_PROJECT_ID) {
    res.status(500).json({ error: 'На сервере не настроены переменные Todoist' });
    return;
  }

  const order = req.body;
  const missing = REQUIRED_FIELDS.filter((f) => !order?.[f]);
  if (missing.length) {
    res.status(400).json({ error: `Не заполнены поля: ${missing.join(', ')}` });
    return;
  }

  const content = `${order.type} ${order.width}×${order.depth}×${order.height} мм × ${order.qty} — ${order.client}`;

  const description = [
    `**Тип:** ${order.type}`,
    `**Размеры:** ${order.width}×${order.depth}×${order.height} мм`,
    `**Количество:** ${order.qty}`,
    `**Профиль:** ${order.profile}`,
    `**Цвет металла:** ${order.metalColor}`,
    order.ldspColor ? `**Цвет ЛДСП:** ${order.ldspColor}` : null,
    `**Клиент:** ${order.client}`,
    order.comment ? `**Комментарий:** ${order.comment}` : null,
    '',
    `_Заказ создан с сайта ${new Date().toLocaleString('ru-RU')}_`,
  ].filter(Boolean).join('\n');

  const todoistRes = await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TODOIST_TOKEN}`,
    },
    body: JSON.stringify({
      content,
      description,
      project_id: TODOIST_PROJECT_ID,
      ...(TODOIST_SECTION_ID ? { section_id: TODOIST_SECTION_ID } : {}),
    }),
  });

  if (!todoistRes.ok) {
    const text = await todoistRes.text();
    res.status(502).json({ error: `Todoist отказал: ${text}` });
    return;
  }

  const task = await todoistRes.json();
  res.status(200).json({ ok: true, taskUrl: task.url });
}
