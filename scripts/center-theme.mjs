// Brand tokens only. Shared status semantics and layout remain owned by UI.
export function hexColor(value) {
  if (typeof value !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value))
    throw new Error('Use a HEX color, for example #397b73 or #abc.');
  const hex = value.slice(1).toLowerCase();
  return '#' + (hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex);
}

function channels(color) {
  return hexColor(color)
    .slice(1)
    .match(/../g)
    .map((c) => parseInt(c, 16));
}

export function mix(color, target, amount) {
  const end = channels(target);
  return (
    '#' +
    channels(color)
      .map((c, i) =>
        Math.round(c + (end[i] - c) * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

function luminance(color) {
  const c = channels(color).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}

export function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function readableInk(background) {
  return contrast(background, '#ffffff') > contrast(background, '#000000') ? '#ffffff' : '#000000';
}

function darkenForContrast(color, background, ratio) {
  for (let step = 0; step <= 100; step++) {
    const candidate = mix(color, '#000000', step / 100);
    if (contrast(candidate, background) >= ratio) return candidate;
  }
  return '#000000';
}

function ramp(color, anchorBackground = false) {
  if (anchorBackground) {
    // The supplied primary is the branded background, not a midtone to darken.
    return Object.fromEntries(
      [
        [50, 0.95],
        [100, 0.88],
        [200, 0.75],
        [300, 0.55],
        [400, 0.4],
        [500, 0.3],
        [600, 0.22],
        [700, 0.15],
        [800, 0.09],
        [900, 0.04],
        [950, 0],
      ].map(([step, amount]) => [step, mix(color, '#ffffff', amount)]),
    );
  }
  return {
    50: mix(color, '#ffffff', 0.95),
    100: mix(color, '#ffffff', 0.88),
    200: mix(color, '#ffffff', 0.75),
    300: mix(color, '#ffffff', 0.55),
    400: mix(color, '#ffffff', 0.25),
    500: color,
    600: mix(color, '#000000', 0.12),
    700: mix(color, '#000000', 0.25),
    800: mix(color, '#000000', 0.45),
    900: mix(color, '#000000', 0.65),
    950: mix(color, '#000000', 0.82),
  };
}

export function centerTheme(primaryValue, secondaryValue) {
  const primary = hexColor(primaryValue),
    secondary = hexColor(secondaryValue);
  const brand = ramp(primary, true),
    highlight = ramp(secondary);
  const background = mix(primary, '#ffffff', 0.97);
  const action = darkenForContrast(primary, background, 4.5);
  const tokens = Object.fromEntries([
    ...Object.entries(brand).map(([step, value]) => [`brand-${step}`, value]),
    ...Object.entries(highlight).map(([step, value]) => [`highlight-${step}`, value]),
  ]);
  return Object.assign(tokens, {
    background,
    primary: action,
    'primary-foreground': readableInk(action),
    'primary-hover': mix(action, '#000000', 0.08),
    'primary-soft-foreground': darkenForContrast(primary, brand[50], 4.5),
    secondary,
    'secondary-foreground': readableInk(secondary),
    'secondary-hover': mix(
      secondary,
      readableInk(secondary) === '#ffffff' ? '#000000' : '#ffffff',
      0.08,
    ),
    'secondary-soft-foreground': darkenForContrast(secondary, highlight[50], 4.5),
    'accent-foreground': darkenForContrast(primary, brand[50], 4.5),
    ring: darkenForContrast(primary, background, 3),
    muted: mix(primary, '#ffffff', 0.94),
    border: mix(primary, '#ffffff', 0.84),
    // Border contrast only; control backgrounds use the shared card surface.
    input: darkenForContrast(primary, '#ffffff', 3),
    'surface-subtle': mix(primary, '#ffffff', 0.985),
    divider: mix(primary, '#ffffff', 0.9),
    sidebar: primary,
    'sidebar-foreground': readableInk(primary),
    'sidebar-muted': mix(primary, readableInk(primary), 0.8),
    'sidebar-accent': mix(primary, readableInk(primary), 0.08),
    'sidebar-accent-foreground': readableInk(primary),
    'sidebar-border': mix(primary, readableInk(primary), 0.2),
    'sidebar-ring': readableInk(primary),
    'sidebar-primary-foreground': readableInk(highlight[500]),
    'sidebar-selected-foreground': darkenForContrast(primary, '#ffffff', 4.5),
    'chart-1': darkenForContrast(primary, '#ffffff', 3),
    'chart-2': darkenForContrast(secondary, '#ffffff', 3),
    'chart-3': '#089cb4',
    'chart-4': '#8358df',
    'chart-5': '#d84685',
  });
}

export function themeCss(id, tokens) {
  return `:root[data-center='${id}'] {\n${Object.entries(tokens)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')}\n}\n`;
}
