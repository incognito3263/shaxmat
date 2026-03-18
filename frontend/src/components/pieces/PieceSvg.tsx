import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  size?: number | string;
}

const palette = {
  white: {
    fill: "url(#grad-white)",
    stroke: "#8B7E68",
    top: "#FFFDF5",
    mid: "#F4EDDE",
    bottom: "#D3C5AE",
    shadow: "rgba(0,0,0,0.15)"
  },
  black: {
    fill: "url(#grad-black)",
    stroke: "#4E5965",
    top: "#4A5565",
    mid: "#1A2027",
    bottom: "#0B1015",
    shadow: "rgba(0,0,0,0.25)"
  }
};

const PieceBase = ({ p }: { p: any }) => (
  <g>
    <ellipse cx="50" cy="88" rx="24" ry="6" fill="black" opacity="0.12" />
    <path d="M28 80 H72 L68 86 H32 Z" fill={p.bottom} stroke={p.stroke} strokeWidth="1.5" />
    <path d="M24 74 H76 V80 H24 Z" fill={p.mid} stroke={p.stroke} strokeWidth="1.5" />
    <path d="M32 70 H68 L72 74 H28 Z" fill={p.top} stroke={p.stroke} strokeWidth="1.5" />
  </g>
);

const SvgRoot = ({ size, children, color }: { size: any; children: React.ReactNode; color: PieceColor }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-white" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFDF5" />
        <stop offset="100%" stopColor="#D3C5AE" />
      </linearGradient>
      <linearGradient id="grad-black" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4A5565" />
        <stop offset="100%" stopColor="#0B1015" />
      </linearGradient>
      <filter id="piece-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#piece-shadow)">
      <PieceBase p={palette[color]} />
      {children}
    </g>
  </svg>
);

const King = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <path d="M50 8V22M42 14H58" stroke={p.stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M38 28C38 24 42 22 50 22C58 22 62 24 62 28V36H38V28Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M34 52C36 44 42 40 50 40C58 40 64 44 66 52V70H34V52Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <rect x="40" y="36" width="20" height="4" fill={p.bottom} stroke={p.stroke} strokeWidth="1.5" />
    </SvgRoot>
  );
};

const Queen = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <circle cx="34" cy="22" r="3" fill={p.top} stroke={p.stroke} strokeWidth="1.5" />
      <circle cx="50" cy="16" r="3.5" fill={p.top} stroke={p.stroke} strokeWidth="1.5" />
      <circle cx="66" cy="22" r="3" fill={p.top} stroke={p.stroke} strokeWidth="1.5" />
      <path d="M34 26L40 44H60L66 26L58 32L50 26L42 32L34 26Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M34 54C36 46 42 42 50 42C58 42 64 46 66 54V70H34V54Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <rect x="40" y="44" width="20" height="4" fill={p.bottom} stroke={p.stroke} strokeWidth="1.5" />
    </SvgRoot>
  );
};

const Rook = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <path d="M32 18H40V26H46V18H54V26H60V18H68V36H32V18Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M36 36L38 70H62L64 36H36Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <rect x="40" y="45" width="20" height="2" fill={p.stroke} opacity="0.3" />
    </SvgRoot>
  );
};

const Bishop = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <circle cx="50" cy="16" r="3.5" fill={p.top} stroke={p.stroke} strokeWidth="1.5" />
      <path d="M50 20C58 20 62 26 62 34C62 42 58 46 54 50C60 54 62 60 62 70H38C38 60 40 54 46 50C42 46 38 42 38 34C38 26 42 20 50 20Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M46 30L54 40" stroke={p.stroke} strokeWidth="2.5" strokeLinecap="round" />
    </SvgRoot>
  );
};

const Knight = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <path d="M40 70C38 58 38 42 48 32C52 28 55 24 55 18C60 20 65 26 65 36C65 44 62 50 60 55L64 60L58 65V70H40Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="53" cy="28" r="2" fill={p.stroke} />
      <path d="M48 42C52 44 58 44 62 41" stroke={p.stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </SvgRoot>
  );
};

const Pawn = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <circle cx="50" cy="32" r="10" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M40 48C40 40 60 40 60 48C60 56 56 60 54 62L56 70H44L46 62C44 60 40 56 40 48Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
    </SvgRoot>
  );
};

const Supplier = ({ color, size }: PieceProps) => {
  const p = palette[color];
  return (
    <SvgRoot size={size} color={color}>
      <path d="M50 12L65 28L50 44L35 28L50 12Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 44H60L58 54H42L40 44Z" fill={p.bottom} stroke={p.stroke} strokeWidth="2" />
      <path d="M36 54C38 46 62 46 64 54V70H36V54Z" fill={p.fill} stroke={p.stroke} strokeWidth="2" />
      <path d="M44 28H56" stroke={p.stroke} strokeWidth="1.5" opacity="0.3" />
    </SvgRoot>
  );
};

const PieceRenderer: React.FC<{ type: string; color: string; size?: number | string }> = ({ type, color, size = 45 }) => {
  const { pieceTheme } = useGameStore();
  const colorKey = color === "white" ? "white" : "black";
  const t = type.toUpperCase();

  const getPiece = () => {
    switch (t) {
      case "K": return <King color={colorKey} size={size} />;
      case "Q": return <Queen color={colorKey} size={size} />;
      case "R": return <Rook color={colorKey} size={size} />;
      case "B": return <Bishop color={colorKey} size={size} />;
      case "N": return <Knight color={colorKey} size={size} />;
      case "P": return <Pawn color={colorKey} size={size} />;
      case "S": return <Supplier color={colorKey} size={size} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${pieceTheme}-${type}-${color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {getPiece()}
      </motion.div>
    </AnimatePresence>
  );
};

export default PieceRenderer;
