import React from "react";

export const GoogleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const CzechFlag = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
  >
    <path fill="#fff" d="M0 0h640v480H0z" />
    <path fill="#d7141a" d="M0 240h640v240H0z" />
    <path fill="#11457e" d="M320 240L0 0v480z" />
  </svg>
);

export const USUKFlag = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
  >
    <path fill="#012169" d="M0 0h640v480H0z" />
    <path
      fill="#FFF"
      d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"
    />
    <path
      fill="#C8102E"
      d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"
    />
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
  </svg>
);

export const SpanishFlag = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
  >
    <path fill="#AA151B" d="M0 0h640v480H0z" />
    <path fill="#F1BF00" d="M0 120h640v240H0z" />
  </svg>
);

export const GermanFlag = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 480"
    className={className}
  >
    <path fill="#FFCE00" d="M0 320h640v160H0z" />
    <path fill="#000" d="M0 0h640v160H0z" />
    <path fill="#DD0000" d="M0 160h640v160H0z" />
  </svg>
);

export const AppLogo = ({ className = "h-8" }) => (
  <svg
    className={className}
    viewBox="0 0 140 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Text "Kit" - bílý */}
    <text
      x="0"
      y="30"
      fill="white"
      fontFamily="system-ui, sans-serif"
      fontWeight="900"
      fontSize="28"
      letterSpacing="-1"
    >
      Kit
    </text>
    {/* Text "Hub" - modrý */}
    <text
      x="42"
      y="30"
      fill="#3b82f6"
      fontFamily="system-ui, sans-serif"
      fontWeight="900"
      fontSize="28"
      letterSpacing="-1"
    >
      Hub
    </text>

    {/* Vtokový rámeček (Symbol) napravo */}
    <g transform="translate(100, 5)">
      {/* Hlavní svislá lišta */}
      <rect x="0" y="0" width="6" height="30" rx="3" fill="#334155" />
      {/* Barevné díly */}
      <rect
        x="4"
        y="6"
        width="12"
        height="4"
        rx="2"
        fill="#3b82f6"
        opacity="0.9"
      />
      <rect
        x="4"
        y="13"
        width="16"
        height="4"
        rx="2"
        fill="#f97316"
        opacity="0.9"
      />
      <rect
        x="4"
        y="20"
        width="12"
        height="4"
        rx="2"
        fill="#3b82f6"
        opacity="0.9"
      />
    </g>
  </svg>
);
