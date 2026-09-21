/**
 * Текст задачи, которая падает мастеру.
 *
 * Язык здесь русский и в словари не выносится намеренно: это не интерфейс
 * клиента, а внутренний наряд, его читает один человек. Локаль, на которой
 * пришла заявка, передаётся отдельным полем — чтобы знали, на каком языке
 * перезванивать.
 */

import type { Order } from './types';

const DELIVERY_LABEL = { pickup: 'Самовывоз', delivery: 'Доставка по Тбилиси' } as const;

const ESTIMATE_NOTE =
  'ВНИМАНИЕ: цена ориентировочная, подтверждается при приёме заказа. ' +
  'Тарифы на сайте пока не подтверждены письменно.';

export type OrderTask = { title: string; description: string };

export function formatOrderTask(order: Order): OrderTask {
  const { price, customer, delivery } = order;
  const model = order.model.charAt(0).toUpperCase() + order.model.slice(1);
  const size = `${order.h}×${order.w}×${order.l}`;

  const title = `${model} ${size} мм · ${order.qty} шт · ${customer.phone}`;

  const lines = [
    `Модель: ${model}`,
    `Размеры (В×Ш×Д): ${size} мм`,
    `Количество: ${order.qty} шт`,
    `Профиль: ${order.profile}×${order.profile} мм`,
    `Цвет металла: ${order.metalColor}`,
    order.ldspColor ? `ЛДСП: ${order.ldspColor}` : null,
    '',
    `Метраж профиля: ${price.profileMeters.toFixed(2)} м`,
    `Вес: ${price.weightKg.toFixed(1)} кг`,
    `Срок: ${price.leadTime.fromDays}–${price.leadTime.toDays} дней`,
    '',
    `Цена за штуку: ${price.unitPrice} ₾`,
    `Позиция: ${price.total} ₾`,
    `${DELIVERY_LABEL[delivery.method]}: ${price.deliveryFee} ₾`,
    delivery.address ? `Адрес: ${delivery.address}` : null,
    `Итого: ${price.grandTotal} ₾`,
    price.isEstimate ? '' : null,
    price.isEstimate ? ESTIMATE_NOTE : null,
    '',
    `Клиент: ${customer.name?.trim() || 'без имени'}`,
    `Телефон: ${customer.phone}`,
    customer.email ? `Почта: ${customer.email}` : null,
    customer.comment ? `Комментарий: ${customer.comment}` : null,
    `Язык заявки: ${order.locale}`,
  ];

  return { title, description: lines.filter((l) => l !== null).join('\n') };
}
