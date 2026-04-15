const schemeDefinitions = {
  monochromatic: {
    label: "Mono",
    description: "single hue",
    theory: "Один оттенок, но разная светлота и насыщенность.",
    colors(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Mono" }
      ];
    }
  },
  analogous: {
    label: "Analog",
    description: "side hues",
    theory: "Соседние цвета на круге дают мягкий переход.",
    colors(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Base" },
        { h: normalizeHue(base.h - 26), s: clamp(base.s + 4, 8, 100), l: clamp(base.l + 2, 8, 92), label: "Left" },
        { h: normalizeHue(base.h + 26), s: clamp(base.s + 4, 8, 100), l: clamp(base.l + 2, 8, 92), label: "Right" }
      ];
    }
  },
  complementary: {
    label: "Comp",
    description: "direct contrast",
    theory: "Пара противоположных цветов для самого сильного контраста.",
    colors(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Base" },
        { h: normalizeHue(base.h + 180), s: base.s, l: base.l, label: "Oppose" }
      ];
    }
  },
  splitComplementary: {
    label: "Split",
    description: "soft contrast",
    theory: "Контраст через два соседних к дополнению оттенка.",
    colors(base) {
      return [
        { h: normalizeHue(base.h + 150), s: base.s, l: clamp(base.l - 4, 8, 92), label: "Split L" },
        { h: normalizeHue(base.h + 210), s: base.s, l: clamp(base.l + 10, 8, 92), label: "Split R" }
      ];
    }
  },
  triadic: {
    label: "Triad",
    description: "3 corners",
    theory: "Три точки через равные интервалы по кругу.",
    colors(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Base" },
        { h: normalizeHue(base.h + 120), s: clamp(base.s - 6, 8, 100), l: clamp(base.l + 4, 8, 92), label: "T2" },
        { h: normalizeHue(base.h + 240), s: clamp(base.s - 6, 8, 100), l: clamp(base.l + 4, 8, 92), label: "T3" }
      ];
    }
  },
  square: {
    label: "Square",
    description: "4 equal",
    theory: "Четыре равноудалённых оттенка с яркой динамикой.",
    colors(base) {
      return [0, 90, 180, 270].map((offset, index) => ({
        h: normalizeHue(base.h + offset),
        s: index === 0 ? base.s : clamp(base.s - 8, 8, 100),
        l: [base.l, 72, 28, 84][index],
        label: ["Base", "Q2", "Q3", "Q4"][index]
      }));
    }
  },
  tetradic: {
    label: "Tetra",
    description: "2 pairs",
    theory: "Две комплементарные пары для сложной палитры.",
    colors(base) {
      return [
        { h: base.h, s: base.s, l: base.l, label: "Base" },
        { h: normalizeHue(base.h + 60), s: clamp(base.s - 8, 8, 100), l: 76, label: "Pair A" },
        { h: normalizeHue(base.h + 180), s: base.s, l: 26, label: "Oppose" },
        { h: normalizeHue(base.h + 240), s: clamp(base.s - 8, 8, 100), l: 84, label: "Pair B" }
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
  schemeStrip: document.getElementById("schemeStrip"),
  schemeTitle: document.getElementById("schemeTitle"),
  schemeDescription: document.getElementById("schemeDescription"),
  colorWheel: document.getElementById("colorWheel"),
  toneBar: document.getElementById("toneBar"),
  toneThumb: document.getElementById("toneThumb"),
  paletteGrid: document.getElementById("paletteGrid"),
  paletteCardTemplate: document.getElementById("paletteCardTemplate"),
  theoryGrid: document.getElementById("theoryGrid"),
  theoryCardTemplate: document.getElementById("theoryCardTemplate")
};

const state = {
  h: 0,
  s: 82,
  l: 58,
  scheme: "monochromatic"
};

let wheelMarkerHalo;
let wheelMarker;

initialize();

function initialize() {
  buildSchemeButtons();
  bindEvents();
  syncStateFromHex("#ff6b6b");
  render();
}

function buildSchemeButtons() {
  Object.entries(schemeDefinitions).forEach(([key, scheme]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scheme-button";
    button.textContent = scheme.label;
    button.dataset.scheme = key;
    button.addEventListener("click", () => {
      state.scheme = key;
      render();
    });
    elements.schemeStrip.append(button);
  });
}

function bindEvents() {
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

  bindPointerDrag(elements.colorWheel, updateFromWheelPointer);
  bindPointerDrag(elements.toneBar, updateFromTonePointer);
}

function bindPointerDrag(element, handler) {
  let isDragging = false;

  element.addEventListener("pointerdown", (event) => {
    isDragging = true;
    element.setPointerCapture(event.pointerId);
    handler(event);
  });

  element.addEventListener("pointermove", (event) => {
    if (isDragging) {
      handler(event);
    }
  });

  const release = (event) => {
    if (isDragging) {
      isDragging = false;
      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore browsers that already released capture.
      }
    }
  };

  element.addEventListener("pointerup", release);
  element.addEventListener("pointercancel", release);
  element.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      release(event);
    }
  });
}

function updateFromWheelPointer(event) {
  const rect = elements.colorWheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const distance = Math.min(Math.hypot(dx, dy), rect.width / 2);
  const ratio = clamp(distance / (rect.width / 2), 0, 1);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  state.h = normalizeHue(angle);
  state.s = Math.round(12 + ratio * 88);
  state.l = Math.round(92 - ratio * 40);
  render();
}

function updateFromTonePointer(event) {
  const rect = elements.toneBar.getBoundingClientRect();
  const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  state.l = Math.round(8 + ratio * 84);
  render();
}

function syncStateFromHex(hex) {
  const { h, s, l } = hexToHsl(hex);
  state.h = h;
  state.s = s;
  state.l = l;
}

function render() {
  const baseHex = hslToHex(state.h, state.s, state.l);
  const baseCss = hslToCss(state.h, state.s, state.l);
  const scheme = schemeDefinitions[state.scheme];
  const schemeColors = scheme.colors(state);

  elements.heroSwatch.style.background = baseHex;
  elements.heroHex.textContent = baseHex;
  elements.heroHsl.textContent = formatHsl(state.h, state.s, state.l);
  elements.hexInput.value = baseHex;
  elements.nativeColorInput.value = baseHex;
  elements.hueSlider.value = String(state.h);
  elements.saturationSlider.value = String(state.s);
  elements.lightnessSlider.value = String(state.l);
  elements.hueValue.textContent = `${state.h}°`;
  elements.saturationValue.textContent = `${state.s}%`;
  elements.lightnessValue.textContent = `${state.l}%`;
  elements.schemeTitle.textContent = scheme.label;
  elements.schemeDescription.textContent = scheme.description;
  document.documentElement.style.setProperty("--accent", baseHex);
  document.documentElement.style.setProperty("--accent-soft", `${baseCss}33`);

  renderSchemeButtons();
  renderWheel(schemeColors);
  renderToneBar();
  renderPalette(schemeColors);
  renderTheory();
}

function renderSchemeButtons() {
  elements.schemeStrip.querySelectorAll(".scheme-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.scheme === state.scheme);
  });
}

function renderWheel(schemeColors) {
  elements.colorWheel.querySelectorAll(".scheme-marker").forEach((marker) => marker.remove());

  const radius = elements.colorWheel.clientWidth / 2;

  schemeColors.forEach((color) => {
    const marker = document.createElement("div");
    marker.className = "scheme-marker";
    marker.style.background = hslToHex(color.h, color.s, color.l);
    marker.title = `${color.label} ${hslToHex(color.h, color.s, color.l)}`;
    if (sameColor(color, state)) {
      marker.style.transform = "scale(1.35)";
      marker.style.boxShadow = "0 0 0 2px rgba(195, 226, 255, 0.28)";
    }

    const ratio = colorToWheelRatio(color);
    const hueRad = (color.h * Math.PI) / 180;
    const markerX = radius + Math.cos(hueRad) * radius * ratio;
    const markerY = radius + Math.sin(hueRad) * radius * ratio;

    marker.style.left = `${markerX}px`;
    marker.style.top = `${markerY}px`;
    marker.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      setStateFromColor(color);
      render();
    });
    elements.colorWheel.append(marker);
  });
}

function renderToneBar() {
  const dark = hslToHex(state.h, Math.max(state.s - 18, 0), 8);
  const base = hslToHex(state.h, state.s, state.l);
  const light = hslToHex(state.h, Math.max(state.s - 18, 0), 92);
  elements.toneBar.style.background = `linear-gradient(90deg, ${dark} 0%, ${base} 50%, ${light} 100%)`;
  elements.toneThumb.style.left = `${((state.l - 8) / 84) * 100}%`;
}

function renderPalette(schemeColors) {
  elements.paletteGrid.innerHTML = "";

  schemeColors.forEach((color) => {
    const colorHex = hslToHex(color.h, color.s, color.l);
    const fragment = elements.paletteCardTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".palette-swatch-button");
    const swatch = fragment.querySelector(".palette-swatch");
    const title = fragment.querySelector("h2");
    const hex = fragment.querySelector(".palette-hex");
    const hsl = fragment.querySelector(".palette-hsl");
    const copyLabel = fragment.querySelector(".palette-copy");

    swatch.style.background = colorHex;
    title.textContent = color.label;
    hex.textContent = colorHex;
    hsl.textContent = formatHsl(color.h, color.s, color.l);

    button.addEventListener("click", async () => {
      setStateFromColor(color);
      render();
      try {
        await navigator.clipboard.writeText(colorHex);
        copyLabel.textContent = "copied";
        setTimeout(() => {
          copyLabel.textContent = "copy";
        }, 1000);
      } catch {
        copyLabel.textContent = "fail";
      }
    });

    elements.paletteGrid.append(fragment);
  });
}

function renderTheory() {
  const demoBase = { h: 18, s: 78, l: 56 };
  elements.theoryGrid.innerHTML = "";

  Object.values(schemeDefinitions).forEach((scheme) => {
    const palette = scheme.colors(demoBase);
    const fragment = elements.theoryCardTemplate.content.cloneNode(true);
    const title = fragment.querySelector("h2");
    const copy = fragment.querySelector(".theory-copy");
    const wheel = fragment.querySelector(".theory-wheel");
    const swatches = fragment.querySelector(".theory-swatches");

    title.textContent = scheme.label;
    copy.textContent = scheme.theory;

    palette.forEach((color) => {
      const dot = document.createElement("div");
      dot.className = "theory-dot";
      dot.style.background = hslToHex(color.h, color.s, color.l);

      const hueRad = (color.h * Math.PI) / 180;
      const radius = 39;
      const ratio = colorToWheelRatio(color) * 0.84;
      const x = radius + Math.cos(hueRad) * radius * ratio;
      const y = radius + Math.sin(hueRad) * radius * ratio;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      wheel.append(dot);

      const swatch = document.createElement("div");
      swatch.className = "theory-swatch";
      swatch.style.background = hslToHex(color.h, color.s, color.l);
      swatches.append(swatch);
    });

    elements.theoryGrid.append(fragment);
  });
}

function normalizeHex(value) {
  const prepared = value.trim().replace(/^#?/, "#");
  return /^#[0-9a-fA-F]{6}$/.test(prepared) ? prepared.toLowerCase() : null;
}

function setStateFromColor(color) {
  state.h = normalizeHue(color.h);
  state.s = Math.round(color.s);
  state.l = Math.round(color.l);
}

function sameColor(a, b) {
  return normalizeHue(a.h) === normalizeHue(b.h) && Math.round(a.s) === Math.round(b.s) && Math.round(a.l) === Math.round(b.l);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function colorToWheelRatio(color) {
  const saturationRatio = clamp((color.s - 12) / 88, 0, 1);
  const lightnessRatio = clamp((92 - color.l) / 40, 0, 1);
  const blendedRatio = saturationRatio * 0.58 + lightnessRatio * 0.42;
  return clamp(blendedRatio, 0.16, 1);
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
