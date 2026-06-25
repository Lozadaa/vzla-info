/**
 * Íconos del sistema — SVG inline, trazo `currentColor`, estilo de línea
 * consistente (1.75, esquinas redondeadas). Sin peticiones de red ni emojis:
 * escalan limpio, heredan color por token y cargan al instante.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- Acciones principales ---- */

export const ShieldCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5 20 5.5V11c0 4.6-3.2 7.8-8 9.5C7.2 18.8 4 15.6 4 11V5.5L12 2.5Z" />
    <path d="M8.5 12l2.4 2.4L15.5 9.5" />
  </Svg>
);

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);

export const MessageInfo = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v3.5L11.5 16H19a2 2 0 0 0 2-2Z" />
    <path d="M12 8.2v.01M12 10.8v3" />
  </Svg>
);

export const LifeBuoy = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.6" />
    <path d="M4.9 4.9 9.5 9.5M14.5 14.5l4.6 4.6M14.5 9.5l4.6-4.6M4.9 19.1l4.6-4.6" />
  </Svg>
);

/* ---- UI ---- */

export const Phone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </Svg>
);

export const AlertTriangle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const Download = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

export const MapPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const WifiOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 2l20 20" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 12.99a10 10 0 0 1 5.24-2.76" />
    <path d="M12 20h.01" />
  </Svg>
);

export const User = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const Share = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </Svg>
);

export const Plus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

/* ---- Categorías de ayuda ---- */

const Home = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
    <path d="M9.5 21v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21" />
  </Svg>
);

const Bowl = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
    <path d="M2 21h20" />
    <path d="M9 4c0 1-1 1-1 2M13 4c0 1-1 1-1 2M17 4c0 1-1 1-1 2" />
  </Svg>
);

const MedicalCross = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Svg>
);

const Bus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
    <path d="M4 10h16" />
    <circle cx="8" cy="19" r="1.5" />
    <circle cx="16" cy="19" r="1.5" />
  </Svg>
);

const Scale = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M8 20h8M6 7h12" />
    <path d="M6 7 3.6 12a3 3 0 0 0 4.8 0L6 7ZM18 7l-2.4 5a3 3 0 0 0 4.8 0L18 7Z" />
  </Svg>
);

const ChatSupport = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v3.5L11.5 16H19a2 2 0 0 0 2-2Z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </Svg>
);

const Shirt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 3.5 4 6.5l2 3.2 2-1.2V21h8V8.5l2 1.2 2-3.2-4.5-3a3 3 0 0 1-5 0Z" />
  </Svg>
);

const Grid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </Svg>
);

const CATEGORY_ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  refugio: Home,
  comida: Bowl,
  medico: MedicalCross,
  transporte: Bus,
  legal: Scale,
  psicologico: ChatSupport,
  ropa: Shirt,
  otros: Grid,
};

export function CategoryIcon({ slug, size = 20, ...rest }: IconProps & { slug: string }) {
  const Cmp = CATEGORY_ICONS[slug] ?? Grid;
  return <Cmp size={size} {...rest} />;
}
