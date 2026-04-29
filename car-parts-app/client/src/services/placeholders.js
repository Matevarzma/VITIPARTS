const createSvgDataUrl = (svg) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const escapeLabel = (label = "") =>
  label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const createPlaceholder = ({
  backgroundStart,
  backgroundEnd,
  textColor,
  accentColor,
  label,
}) =>
  createSvgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${backgroundStart}" />
          <stop offset="100%" stop-color="${backgroundEnd}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#bg)" />
      <circle cx="1030" cy="110" r="90" fill="${accentColor}" opacity="0.2" />
      <circle cx="150" cy="570" r="120" fill="${accentColor}" opacity="0.12" />
      <text
        x="600"
        y="365"
        fill="${textColor}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="72"
        font-weight="700"
        text-anchor="middle"
      >
        ${escapeLabel(label)}
      </text>
    </svg>
  `);

export const getCarPlaceholder = (label = "CAR IMAGE") =>
  createPlaceholder({
    backgroundStart: "#f8f8f8",
    backgroundEnd: "#dddddd",
    textColor: "#111111",
    accentColor: "#f58220",
    label,
  });

export const getBrandPlaceholder = (label = "BRAND") =>
  createPlaceholder({
    backgroundStart: "#f8f8f8",
    backgroundEnd: "#dddddd",
    textColor: "#111111",
    accentColor: "#f58220",
    label,
  });

export const getPartPlaceholder = (label = "PART IMAGE") =>
  createPlaceholder({
    backgroundStart: "#f58220",
    backgroundEnd: "#d86f10",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    label,
  });

export const getBannerPlaceholder = (label = "VITIPARTS") =>
  createPlaceholder({
    backgroundStart: "#f4b546",
    backgroundEnd: "#f58220",
    textColor: "#111111",
    accentColor: "#ffffff",
    label,
  });
