/* @ds-bundle: {"format":4,"namespace":"KarkasSteelDesignSystem_81c78a","components":[{"name":"OrdersTable","sourcePath":"components/admin/OrdersTable.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Price","sourcePath":"components/display/Price.jsx"},{"name":"StatusChip","sourcePath":"components/display/StatusChip.jsx"},{"name":"OrderTimeline","sourcePath":"components/feedback/OrderTimeline.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ColorSwatches","sourcePath":"components/forms/ColorSwatches.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentControl","sourcePath":"components/forms/SegmentControl.jsx"},{"name":"SizeSlider","sourcePath":"components/forms/SizeSlider.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"}],"sourceHashes":{"components/admin/OrdersTable.jsx":"c81070cb0fe5","components/buttons/Button.jsx":"f2c40330bbed","components/buttons/IconButton.jsx":"28d215a57a24","components/display/Card.jsx":"c99016b25ead","components/display/Price.jsx":"cf380e016fb7","components/display/StatusChip.jsx":"31dfc7ca329f","components/feedback/OrderTimeline.jsx":"0a5ff52282e9","components/feedback/Toast.jsx":"bd9489159191","components/forms/ColorSwatches.jsx":"de0c4827332d","components/forms/Input.jsx":"3b056484a99a","components/forms/SegmentControl.jsx":"a342e9687bb6","components/forms/SizeSlider.jsx":"36a60372baa6","components/icons/Icon.jsx":"504f70b90b43"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KarkasSteelDesignSystem_81c78a = window.KarkasSteelDesignSystem_81c78a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
/** Кнопка. Primary — единственный красный элемент зоны; с ценой: «Заказать · 420 ₾». */
function Button({
  variant = "primary",
  size = "md",
  children,
  price,
  disabled,
  fullWidth,
  onClick,
  type = "button",
  style
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const h = size === "sm" ? 40 : 48;
  const styles = {
    primary: {
      background: disabled ? "var(--surface-sunken)" : press ? "var(--accent-hover)" : hover ? "var(--accent-hover)" : "var(--accent)",
      color: disabled ? "var(--ink-muted)" : "var(--accent-on)",
      border: "1px solid transparent"
    },
    secondary: {
      background: hover && !disabled ? "var(--surface-sunken)" : "transparent",
      color: disabled ? "var(--ink-muted)" : "var(--ink)",
      border: `1px solid ${disabled ? "var(--border)" : "var(--border-strong)"}`
    },
    ghost: {
      background: hover && !disabled ? "var(--surface-sunken)" : "transparent",
      color: disabled ? "var(--ink-muted)" : "var(--ink-secondary)",
      border: "1px solid transparent"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      fontFamily: "var(--font-ui)",
      fontWeight: 600,
      fontSize: size === "sm" ? 14 : 16,
      height: h,
      padding: "0 24px",
      borderRadius: "var(--radius-control)",
      cursor: disabled ? "default" : "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "background 150ms ease-out,border-color 150ms ease-out",
      width: fullWidth ? "100%" : undefined,
      ...styles,
      ...style
    }
  }, children, price != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: 600
    }
  }, "\xB7 ", price, " \u20BE"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
/** Карточка: фон --surface, бордер 1px, радиус 12px. Фото без рамок (заполняет верх). */
function Card({
  children,
  padding = 24,
  image,
  imageHeight = 160,
  hoverable,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: "var(--surface)",
      border: `1px solid ${hoverable && hover ? "var(--border-strong)" : "var(--border)"}`,
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
      cursor: onClick ? "pointer" : undefined,
      transition: "border-color 150ms ease-out",
      ...style
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      display: "block",
      width: "100%",
      height: imageHeight,
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Price.jsx
try { (() => {
/** Цена: JetBrains Mono 600 --accent, 28px в конфигураторе. */
function Price({
  value,
  currency = "₾",
  size = 28,
  muted,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.1,
      color: muted ? "var(--ink)" : "var(--accent)",
      whiteSpace: "nowrap",
      ...style
    }
  }, typeof value === "number" ? value.toLocaleString("ru-RU") : value, " ", currency);
}
Object.assign(__ds_scope, { Price });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Price.jsx", error: String((e && e.message) || e) }); }

// components/display/StatusChip.jsx
try { (() => {
const STYLES = {
  "awaiting-payment": {
    label: "Ожидает оплаты",
    border: "var(--warning)",
    color: "var(--warning)"
  },
  "received": {
    label: "Заказ получен",
    bg: "var(--accent-subtle)",
    color: "var(--accent)"
  },
  "production": {
    label: "В производстве",
    border: "var(--ink-secondary)",
    color: "var(--ink-secondary)"
  },
  "ready": {
    label: "Готов",
    bg: "var(--success-subtle)",
    color: "var(--success)"
  },
  "delivery": {
    label: "Доставка",
    border: "var(--border-strong)",
    color: "var(--ink-secondary)"
  },
  "pickup": {
    label: "Самовывоз",
    border: "var(--border-strong)",
    color: "var(--ink-secondary)"
  },
  "done": {
    label: "Завершён",
    border: "var(--border)",
    color: "var(--ink-muted)"
  },
  "cancelled": {
    label: "Отменён",
    color: "var(--danger)"
  }
};
/** Чип статуса заказа. Статус = цвет + текст, mono 12px. */
function StatusChip({
  status,
  children,
  style
}) {
  const s = STYLES[status] || {
    label: status,
    border: "var(--border-strong)",
    color: "var(--ink-secondary)"
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 28,
      padding: "0 12px",
      borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
      background: s.bg || "transparent",
      color: s.color,
      border: `1px solid ${s.border || "transparent"}`,
      ...style
    }
  }, children || s.label);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/admin/OrdersTable.jsx
try { (() => {
/** Таблица заказов админки: строки 48px, hover --surface-sunken, номера и суммы mono. */
function OrdersTable({
  orders,
  onRowClick,
  style
}) {
  const [hover, setHover] = React.useState(-1);
  const th = {
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--ink-muted)",
    padding: "0 16px",
    height: 40,
    borderBottom: "1px solid var(--border)"
  };
  const td = {
    padding: "0 16px",
    height: 48,
    borderBottom: "1px solid var(--border)",
    fontSize: 14,
    color: "var(--ink)",
    whiteSpace: "nowrap"
  };
  const mono = {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fontWeight: 500
  };
  return /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: "collapse",
      width: "100%",
      background: "var(--surface)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u2116"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u041A\u043B\u0438\u0435\u043D\u0442"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0418\u0437\u0434\u0435\u043B\u0438\u0435"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0421\u0443\u043C\u043C\u0430"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0421\u0442\u0430\u0442\u0443\u0441"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "\u0414\u0430\u0442\u0430"))), /*#__PURE__*/React.createElement("tbody", null, orders.map((o, i) => /*#__PURE__*/React.createElement("tr", {
    key: o.id,
    onClick: () => onRowClick && onRowClick(o),
    onMouseEnter: () => setHover(i),
    onMouseLeave: () => setHover(-1),
    style: {
      background: hover === i ? "var(--surface-sunken)" : "transparent",
      cursor: onRowClick ? "pointer" : undefined,
      transition: "background 100ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: "var(--ink-secondary)"
    }
  }, o.status === "cancelled" ? /*#__PURE__*/React.createElement("s", null, o.id) : o.id), /*#__PURE__*/React.createElement("td", {
    style: td
  }, o.customer), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: "var(--ink-secondary)"
    }
  }, o.item), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono
    }
  }, o.total, " \u20BE"), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusChip, {
    status: o.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      ...mono,
      color: "var(--ink-muted)"
    }
  }, o.date)))));
}
Object.assign(__ds_scope, { OrdersTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/admin/OrdersTable.jsx", error: String((e && e.message) || e) }); }

// components/feedback/OrderTimeline.jsx
try { (() => {
/** Трекинг-таймлайн заказа: вертикальная линия; пройдено — --success, текущий — кольцо --accent + жирная подпись, будущее — контур. */
function OrderTimeline({
  steps,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, steps.map((s, i) => {
    const last = i === steps.length - 1;
    const dot = s.state === "done" ? {
      background: "var(--success)",
      border: "2px solid var(--success)"
    } : s.state === "current" ? {
      background: "var(--surface)",
      border: "2px solid var(--accent)"
    } : {
      background: "var(--surface)",
      border: "2px solid var(--border-strong)"
    };
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 14,
        borderRadius: "50%",
        boxSizing: "border-box",
        flexShrink: 0,
        marginTop: 3,
        ...dot
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 24,
        background: s.state === "done" ? "var(--success)" : "var(--border)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: s.state === "current" ? 700 : 500,
        color: s.state === "future" ? "var(--ink-muted)" : "var(--ink)"
      }
    }, s.label), s.date && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        color: "var(--ink-muted)",
        marginTop: 2
      }
    }, s.date)));
  }));
}
Object.assign(__ds_scope, { OrderTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/OrderTimeline.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/** Toast: тёмная плашка --graphite, белый текст, без иконок-мультяшек. */
function Toast({
  children,
  action,
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 20,
      background: "var(--graphite)",
      color: "var(--dark-text)",
      padding: "14px 20px",
      borderRadius: "var(--radius-card)",
      fontSize: 14,
      lineHeight: 1.4,
      maxWidth: 420,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, children), action && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--accent-on-dark)",
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 14,
      padding: 0,
      whiteSpace: "nowrap"
    }
  }, action));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/ColorSwatches.jsx
try { (() => {
/** Свотчи цвета изделия: круги 40px, активный — кольцо 2px --accent с отступом 2px, подпись снизу. */
function ColorSwatches({
  options,
  value,
  onChange,
  ringOffsetColor = "var(--surface)",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20,
      ...style
    },
    role: "radiogroup",
    "aria-label": "\u0426\u0432\u0435\u0442"
  }, options.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "radio",
      "aria-checked": active,
      onClick: () => onChange && onChange(o.value),
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 2,
        minWidth: 44
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: o.hex,
        border: "1px solid var(--border)",
        boxShadow: active ? `0 0 0 2px ${ringOffsetColor}, 0 0 0 4px var(--accent)` : "none",
        transition: "box-shadow 150ms ease-out"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: active ? "var(--ink)" : "var(--ink-secondary)",
        fontWeight: active ? 600 : 400
      }
    }, o.name));
  }));
}
Object.assign(__ds_scope, { ColorSwatches });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ColorSwatches.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
/** Поле ввода: фон --surface-sunken, лейбл сверху 13px, фокус 2px --accent, ошибка под полем. */
function Input({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  mono,
  error,
  type = "text",
  id,
  style,
  inputStyle
}) {
  const [focus, setFocus] = React.useState(false);
  const autoId = React.useId();
  const fieldId = id || autoId;
  const bc = error ? "var(--danger)" : focus ? "var(--accent)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontSize: 13,
      lineHeight: 1.4,
      color: "var(--ink-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: "var(--control-h)",
      background: "var(--surface-sunken)",
      border: `1px solid ${bc}`,
      boxShadow: focus || error ? `inset 0 0 0 1px ${bc}` : "none",
      borderRadius: "var(--radius-control)",
      padding: "0 14px",
      transition: "border-color 150ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
      fontSize: mono ? 15 : 16,
      fontWeight: mono ? 500 : 400,
      color: "var(--ink)",
      ...inputStyle
    }
  }), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--ink-muted)",
      marginLeft: 8
    }
  }, suffix)), error && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.4,
      color: "var(--danger)"
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentControl.jsx
try { (() => {
/** Сегмент-контрол (сечение профиля): активный — заливка --ink, не красная (это выбор, а не действие). */
function SegmentControl({
  options,
  value,
  onChange,
  mono = true,
  label,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ink-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-label": label,
    style: {
      display: "flex",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-control)",
      overflow: "hidden",
      background: "var(--surface)"
    }
  }, options.map((o, i) => {
    const active = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      role: "radio",
      "aria-checked": active,
      onClick: () => onChange && onChange(o),
      style: {
        flex: 1,
        height: 44,
        border: "none",
        borderLeft: i ? "1px solid var(--border)" : "none",
        cursor: "pointer",
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#fff" : "var(--ink-secondary)",
        fontFamily: mono ? "var(--font-mono)" : "var(--font-ui)",
        fontSize: mono ? 14 : 15,
        fontWeight: mono ? 500 : 600,
        transition: "background 150ms ease-out,color 150ms ease-out"
      }
    }, o);
  })));
}
Object.assign(__ds_scope, { SegmentControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/SizeSlider.jsx
try { (() => {
/** Слайдер размеров: трек 4px, заполнение --accent, ручка 24px; лимиты mono под треком. Дублируется числовым вводом. */
function SizeSlider({
  label,
  min = 200,
  max = 2000,
  step = 10,
  value,
  onChange,
  unit = "мм",
  style
}) {
  const ref = React.useRef(null);
  const [drag, setDrag] = React.useState(false);
  const [text, setText] = React.useState(null);
  const clamp = v => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const pct = (value - min) / (max - min) * 100;
  const setFromX = x => {
    const r = ref.current.getBoundingClientRect();
    onChange && onChange(clamp(min + (x - r.left) / r.width * (max - min)));
  };
  const down = e => {
    e.preventDefault();
    setDrag(true);
    setFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ink-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      height: 36,
      padding: "0 10px",
      background: "var(--surface-sunken)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-control)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: text !== null ? text : value,
    inputMode: "numeric",
    "aria-label": label,
    onChange: e => setText(e.target.value),
    onBlur: () => {
      const n = parseInt(text, 10);
      if (!isNaN(n)) onChange && onChange(clamp(n));
      setText(null);
    },
    onKeyDown: e => e.key === "Enter" && e.currentTarget.blur(),
    style: {
      width: 48,
      background: "transparent",
      border: "none",
      outline: "none",
      textAlign: "right",
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      fontWeight: 500,
      color: "var(--ink)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--ink-muted)"
    }
  }, unit))), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    onPointerDown: down,
    onPointerMove: e => drag && setFromX(e.clientX),
    onPointerUp: () => setDrag(false),
    role: "slider",
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-label": label,
    tabIndex: 0,
    onKeyDown: e => {
      if (e.key === "ArrowLeft") onChange && onChange(clamp(value - step));
      if (e.key === "ArrowRight") onChange && onChange(clamp(value + step));
    },
    style: {
      position: "relative",
      height: 32,
      cursor: "pointer",
      touchAction: "none",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 4,
      borderRadius: 2,
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      width: `${pct}%`,
      height: 4,
      borderRadius: 2,
      background: "var(--accent)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: `${pct}%`,
      transform: "translateX(-50%)",
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#fff",
      border: `2px solid ${drag ? "var(--accent)" : "var(--border-strong)"}`,
      boxSizing: "border-box",
      transition: drag ? "none" : "border-color 150ms ease-out"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, min), /*#__PURE__*/React.createElement("span", null, max)));
}
Object.assign(__ds_scope, { SizeSlider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SizeSlider.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
const _cache = {};
/** Линейная иконка Lucide (CDN lucide-static), stroke 1.5px по умолчанию. */
function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  color = "currentColor",
  style
}) {
  const [svg, setSvg] = React.useState(_cache[name] || "");
  React.useEffect(() => {
    let on = true;
    if (_cache[name]) {
      setSvg(_cache[name]);
      return;
    }
    fetch(`https://unpkg.com/lucide-static@0.462.0/icons/${name}.svg`).then(r => r.ok ? r.text() : "").then(t => {
      _cache[name] = t;
      if (on) setSvg(t);
    }).catch(() => {});
    return () => {
      on = false;
    };
  }, [name]);
  const html = svg.replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`).replace(/stroke-width="2"/, `stroke-width="${strokeWidth}"`);
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      width: size,
      height: size,
      color,
      flexShrink: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
/** Ghost-иконка 40×40 (контролы 3D-вьюпорта, тулбары). */
function IconButton({
  name,
  label,
  onClick,
  active,
  size = 40,
  iconSize = 20,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: active ? "var(--ink)" : hover ? "var(--surface-sunken)" : "transparent",
      color: active ? "#fff" : "var(--ink-secondary)",
      border: "1px solid transparent",
      borderRadius: "var(--radius-control)",
      cursor: "pointer",
      transition: "background 150ms ease-out",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: name,
    size: iconSize
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

__ds_ns.OrdersTable = __ds_scope.OrdersTable;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Price = __ds_scope.Price;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.OrderTimeline = __ds_scope.OrderTimeline;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ColorSwatches = __ds_scope.ColorSwatches;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentControl = __ds_scope.SegmentControl;

__ds_ns.SizeSlider = __ds_scope.SizeSlider;

__ds_ns.Icon = __ds_scope.Icon;

})();
