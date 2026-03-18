import React from "react";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  size?: number | string;
}

const modernPalette = {
  white: {
    fill: "#EEF3F8",
    stroke: "#93A2B6",
    accent: "#4DD9E8"
  },
  black: {
    fill: "#121821",
    stroke: "#66778B",
    accent: "#4DD9E8"
  }
};

const ModernBase = ({ color, children, size }: React.PropsWithChildren<PieceProps>) => {
  const p = modernPalette[color];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path d="M32 80H68L65 85H35L32 80Z" fill={p.stroke} opacity="0.5" />
        <rect x="28" y="74" width="44" height="6" rx="1" fill={p.fill} stroke={p.stroke} strokeWidth="1.5" />
        {children}
      </g>
    </svg>
  );
};

export const ModernKing = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path d="M50 15V25M44 20H56" stroke={p.stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M35 35L42 28H58L65 35V45H35V35Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M32 45H68L65 74H35L32 45Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <rect x="40" y="55" width="20" height="2" fill={p.accent} />
    </ModernBase>
  );
};

export const ModernQueen = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <circle cx="50" cy="18" r="2.5" fill={p.accent} />
      <path d="M35 30L50 20L65 30V45H35V30Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M32 45H68L65 74H35L32 45Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </ModernBase>
  );
};

export const ModernRook = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path d="M35 25H42V32H46V25H54V32H58V25H65V40H35V25Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M35 40H65L62 74H38L35 40Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </ModernBase>
  );
};

export const ModernBishop = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path d="M50 20L62 35L50 50L38 35L50 20Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M42 35H58" stroke={p.accent} strokeWidth="2" />
      <path d="M35 50H65L62 74H38L35 50Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </ModernBase>
  );
};

export const ModernKnight = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path 
        d="M40 72L38 55L45 35L55 20L62 25L58 35L65 50L58 55L60 72H40Z" 
        fill={p.fill} 
        stroke={p.stroke} 
        strokeWidth="2" 
        strokeLinejoin="round" 
      />
      <circle cx="54" cy="31" r="1.8" fill={p.stroke} />
      <path d="M45 35L50 30" stroke={p.accent} strokeWidth="2" strokeLinecap="round" />
    </ModernBase>
  );
};

export const ModernPawn = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path d="M50 30L60 50H40L50 30Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M38 50H62L60 74H40L38 50Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </ModernBase>
  );
};

export const ModernSupplier = (props: PieceProps) => {
  const p = modernPalette[props.color];
  return (
    <ModernBase {...props}>
      <path d="M50 15L65 35H35L50 15Z" fill={p.accent} stroke={p.stroke} strokeWidth="2" />
      <path d="M50 35V50M40 42H60" stroke={p.stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M35 50H65L62 74H38L35 50Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </ModernBase>
  );
};
