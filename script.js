const schemeDefinitions = {
  monochromatic: {
    label: "Монохромная",
    description: "Один и тот же оттенок с разной светлотой и насыщенностью. Хорошо подходит для спокойных, цельных палитр.",
    build(base) {
      const variations = [
        { s: Math.max(base.s - 18, 18), l: Math.max(base.l - 22, 12), label: "Глубокий тон" },
        { s: Math.max(base.s - 8, 10), l: clamp(base.l - 10, 8, 92), label: "Тёмный акцент" },
        { s: base.s, l: base.l, label: "Базовый цвет" },
        { s: clamp(base.s - 12, 12, 100), l: clamp(base.l + 12, 8, 92), label: "Светлый тон" },
        { s: clamp(base.s - 25, 10, 100), l: clamp(base.l + 24, 8, 96), label: "Воздушный оттенок" }
      ];
      return variations.map((variation) => ({ h: base.h, ...variation }));
    }
  },
  analogous: {
    label: "Аналоговая",
    description: "Соседние оттенки на круге. Даёт мягкий переход и ощущение естественной гармонии.",
    build(base) {
      return [
        { h: normalizeHue(base.h - 36), s: base.s, l: clamp(base.l - 6, 8, 92), label: "Левый сосед" },
        { h: normalizeHue(base.h - 18), s: clamp(base.s + 6, 0, 100), l: base.l, label: "Ближний левый" },
        { h: base.h, s: base.s, l: base.l, label: "Базовый цвет" },
        { h: normalizeHue(base.h + 18), s: clamp(base.s + 6, 0, 100), l: base.l, label: "Ближний правый" },
        { h: normalizeHue(base.h + 36), s: base.s, l: clamp(base.l + 4, 8, 92), label: "Правый сосед" }
      ];
    }
  },
  complementary: {
    label: "Комплементарная",
    description: "Цвет и его противоположность на круге. Один из самых ярких контрастов для акцентов.",
    build(base) {
      return [
        { h: base.h, s: clamp(base.s - 18, 0, 100), l: clamp(base.l + 18, 8, 92), label: "Мягкая подложка" },
        { h: base.h, s: base.s, l: base.l, label: "Базовый цвет" },
        { h: normalizeHue(base.h + 180), s: base.s, l: base.l, label: "Дополнительный цвет" },
        { h: normalizeHue(base.h + 180), s: clamp(base.s - 12, 0, 100), l: clamp(base.l - 10, 8, 92), label: "Контрастный акцент" }
      ];
    }
  },
  splitComplementary: {
    label: "Разделённо-комплементарная",
    description: "Базовый цвет плюс два соседа его противоположности. Контраст остаётся сильным, но становится мягче.",
    build(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Базовый цвет" },
        { h: normalizeHue(base.h + 150), s: clamp(base.s - 4, 0, 100), l: clamp(base.l + 6, 8, 92), label: "Левый контраст" },
        { h: normalizeHue(base.h + 210), s: clamp(base.s - 4, 0, 100), l: clamp(base.l + 6, 8, 92), label: "Правый контраст" },
        { h: normalizeHue(base.h + 180), s: clamp(base.s - 28, 0, 100), l: clamp(base.l - 12, 8, 92), label: "Глубокий акцент" }
      ];
    }
  },
  triadic: {
    label: "Триада",
    description: "Три равномерно удалённых цвета. Схема динамичная и сбалансированная, если один цвет сделать главным.",
    build(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Базовый цвет" },
        { h: normalizeHue(base.h + 120), s: clamp(base.s - 6, 0, 100), l: clamp(base.l + 3, 8, 92), label: "Второй угол" },
        { h: normalizeHue(base.h + 240), s: clamp(base.s - 6, 0, 100), l: clamp(base.l + 3, 8, 92), label: "Третий угол" },
        { h: base.h, s: clamp(base.s - 30, 0, 100), l: clamp(base.l + 22, 8, 95), label: "Нейтральная связка" }
      ];
    }
  },
  square: {
    label: "Квадрат",
    description: "Четыре цвета через 90 градусов. Удобно, когда хочется насыщенной, но равномерной палитры.",
    build(base) {
      return [0, 90, 180, 270].map((offset, index) => ({
        h: normalizeHue(base.h + offset),
        s: index === 0 ? base.s : clamp(base.s - 6, 0, 100),
        l: index === 0 ? base.l : clamp(base.l + (index % 2 === 0 ? -4 : 6), 8, 92),
        label: ["Базовый цвет", "Второй угол", "Третий угол", "Четвёртый угол"][index]
      }));
    }
  },
  tetradic: {
    label: "Тетрада",
    description: "Две комплементарные пары. Даёт богатую палитру, особенно если держать один цвет ведущим, а остальные вспомогательными.",
    build(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Базовый цвет" },
        { h: normalizeHue(base.h + 60), s: clamp(base.s - 4, 0, 100), l: clamp(base.l + 8, 8, 92), label: "Соседняя опора" },
        { h: normalizeHue(base.h + 180), s: base.s, l: clamp(base.l - 6, 8, 92), label: "Прямой контраст" },
        { h: normalizeHue(base.h + 240), s: clamp(base.s - 8, 0, 100), l: clamp(base.l + 10, 8, 92), label: "Вторая опора" }
      ];
    }
  }
};

const elements = {
  heroSwatch: document.getElementById("heroSwatch"),
  heroHex: document.getElementById("heroHex"),
  heroHsl: document.getElementById("heroHsl"),
  hexInput: document.getElementById("hexInput"),
  nativeColorInput: document.getElementById("nativeColorInput"),
  hueSlider: document.getElementById("hueSlider"),
  saturationSlider: document.getElementById("saturationSlider"),
  lightnessSlider: document.getElementById("lightnessSlider"),
  hueValue: document.getElementById("hueValue"),
  saturationValue: document.getElementById("saturationValue"),
  lightnessValue: document.getElementById("lightnessValue"),
  schemeSelect: document.getElementById("schemeSelect"),
  schemeTitle: document.getElementById("schemeTitle"),
  schemeDescription: document.getElementById("schemeDescription"),
  colorWheel: document.getElementById("colorWheel"),
  paletteGrid: document.getElementById("paletteGrid"),
  paletteCardTemplate: document.getElementById("paletteCardTemplate")
};

const state = {
  h: 0,
  s: 80,
  l: 67,
  scheme: "monochromatic"
};

initialize();

function initialize() {
  populateSchemeSelect();
  bindEvents();
  syncStateFromHex("#ff6b6b");
  render();
}

function populateSchemeSelect() {
  Object.entries(schemeDefinitions).forEach(([key, scheme]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = scheme.label;
    elements.schemeSelect.append(option);
  });
  elements.schemeSelect.value = state.scheme;
}

function bindEvents() {
  elements.schemeSelect.addEventListener("change", () => {
    state.scheme = elements.schemeSelect.value;
    render();
  });

  elements.nativeColorInput.addEventListener("input", (event) => {
    syncStateFromHex(event.target.value);
    render();
  });

  elements.hexInput.addEventListener("change", () => {
    const normalized = normalizeHex(elements.hexInput.value);
    if (!normalized) {
      elements.hexInput.value = hslToHex(state.h, state.s, state.l);
      return;
    }
    syncStateFromHex(normalized);
    render();
  });

  elements.hueSlider.addEventListener("input", () => {
    state.h = Number(elements.hueSlider.value);
    render();
  });

  elements.saturationSlider.addEventListener("input", () => {
    state.s = Number(elements.saturationSlider.value);
    render();
  });

  elements.lightnessSlider.addEventListener("input", () => {
    state.l = Number(elements.lightnessSlider.value);
    render();
  });
}

function syncStateFromHex(hex) {
  const { h, s, l } = hexToHsl(hex);
  state.h = h;
  state.s = s;
  state.l = l;
}

function render() {
  const baseHex = hslToHex(state.h, state.s, state.l);
  const baseHsl = formatHsl(state.h, state.s, state.l);
  const scheme = schemeDefinitions[state.scheme];
  const palette = scheme.build(state);

  elements.heroSwatch.style.background = baseHex;
  elements.heroHex.textContent = baseHex;
  elements.heroHsl.textContent = baseHsl;
  elements.hexInput.value = baseHex;
  elements.nativeColorInput.value = baseHex;
  elements.hueSlider.value = String(state.h);
  elements.saturationSlider.value = String(state.s);
  elements.lightnessSlider.value = String(state.l);
  elements.hueValue.textContent = `${state.h}°`;
  elements.saturationValue.textContent = `${state.s}%`;
  elements.lightnessValue.textContent = `${state.l}%`;
  elements.schemeTitle.textContent = `${scheme.label} схема`;
  elements.schemeDescription.textContent = scheme.description;
  document.documentElement.style.setProperty("--accent", baseHex);

  renderWheel(palette);
  renderPalette(palette);
}

function renderWheel(palette) {
  const currentMarkers = elements.colorWheel.querySelectorAll(".wheel-marker");
  currentMarkers.forEach((marker) => marker.remove());

  palette.forEach((color, index) => {
    const marker = document.createElement("div");
    marker.className = `wheel-marker${index === 0 ? " base" : ""}`;
    marker.style.setProperty("--angle", String(color.h));
    marker.style.setProperty("--distance", "182");
    marker.style.setProperty("--marker-color", hslToCss(color.h, color.s, color.l));
    elements.colorWheel.append(marker);
  });
}

function renderPalette(palette) {
  elements.paletteGrid.innerHTML = "";

  palette.forEach((color) => {
    const colorHex = hslToHex(color.h, color.s, color.l);
    const fragment = elements.paletteCardTemplate.content.cloneNode(true);
    const swatch = fragment.querySelector(".palette-swatch");
    const title = fragment.querySelector("h3");
    const hex = fragment.querySelector(".palette-hex");
    const hsl = fragment.querySelector(".palette-hsl");
    const button = fragment.querySelector(".copy-button");

    swatch.style.background = colorHex;
    title.textContent = color.label;
    hex.textContent = colorHex;
    hsl.textContent = formatHsl(color.h, color.s, color.l);
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(colorHex);
        button.textContent = "Скопировано";
        setTimeout(() => {
          button.textContent = "Скопировать";
        }, 1200);
      } catch {
        button.textContent = "Не удалось";
      }
    });

    elements.paletteGrid.append(fragment);
  });
}

function normalizeHex(value) {
  const prepared = value.trim().replace(/^#?/, "#");
  return /^#[0-9a-fA-F]{6}$/.test(prepared) ? prepared.toLowerCase() : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHue(hue) {
  return ((Math.round(hue) % 360) + 360) % 360;
}

function formatHsl(h, s, l) {
  return `HSL(${normalizeHue(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function hslToCss(h, s, l) {
  return `hsl(${normalizeHue(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function hslToRgb(h, s, l) {
  const hue = normalizeHue(h) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;

  if (sat === 0) {
    const grayscale = Math.round(light * 255);
    return [grayscale, grayscale, grayscale];
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const toChannel = (t) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  return [
    Math.round(toChannel(hue + 1 / 3) * 255),
    Math.round(toChannel(hue) * 255),
    Math.round(toChannel(hue - 1 / 3) * 255)
  ];
}

function hexToHsl(hex) {
  const sanitized = hex.replace("#", "");
  const bigint = Number.parseInt(sanitized, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        h = 60 * ((b - r) / delta + 2);
        break;
      default:
        h = 60 * ((r - g) / delta + 4);
        break;
    }
  }

  return {
    h: normalizeHue(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
