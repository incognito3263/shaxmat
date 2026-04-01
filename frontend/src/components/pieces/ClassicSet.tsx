import React from "react";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  size?: number | string;
}

const ClassicBase = ({ color, children, size = "100%" }: React.PropsWithChildren<PieceProps>) => {
  const isWhite = color === "white";
  const fill = isWhite ? "#FFFFFF" : "#454341";
  const stroke = isWhite ? "#454341" : "#FFFFFF";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="piece-shadow">
      <g fill={fill} stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
};

export const ClassicKing = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M50 15v10M42 20h16" fill="none" strokeWidth="4" />
    <path d="M50 25c-8 0-12 5-12 12 0 5 4 10 12 18 8-8 12-13 12-18 0-7-4-12-12-12z" />
    <path d="M25 80c0-5 5-10 10-12V55h30v13c5 2 10 7 10 12v5H25v-5z" />
    <path d="M25 70c15-5 35-5 50 0M25 75c15-5 35-5 50 0" fill="none" />
  </ClassicBase>
);

export const ClassicQueen = (props: PieceProps) => (
  <ClassicBase {...props}>
    <circle cx="20" cy="25" r="4" />
    <circle cx="35" cy="18" r="4" />
    <circle cx="50" cy="15" r="4" />
    <circle cx="65" cy="18" r="4" />
    <circle cx="80" cy="25" r="4" />
    <path d="M20 30l10 15 20-10 20 10 10-15-5 25H25l-5-25z" />
    <path d="M25 55c5-3 45-3 50 0l-5 25H30l-5-25z" />
    <path d="M25 65c15-3 35-3 50 0M25 72c15-3 35-3 50 0" fill="none" />
    <path d="M25 80h50v5H25v-5z" />
  </ClassicBase>
);

export const ClassicRook = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M25 20v10h10V20h10v10h10V20h10v10h10V20H25z" strokeLinecap="butt" />
    <path d="M30 30h40v40H30V30z" />
    <path d="M25 70h50l5 10H20l5-10z" />
    <path d="M25 35h50M25 65h50" fill="none" />
  </ClassicBase>
);

export const ClassicBishop = (props: PieceProps) => (
  <ClassicBase {...props}>
    <circle cx="50" cy="20" r="5" />
    <path d="M50 25c-10 0-15 10-15 20 0 10 5 15 15 25 10-10 15-15 15-25 0-10-5-20-15-20z" />
    <path d="M30 80c5-5 35-5 40 0v5H30v-5z" />
    <path d="M40 45h20M38 52h24" fill="none" strokeWidth="2" />
  </ClassicBase>
);

export const ClassicKnight = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M30 80c0-15 10-35 30-40 5-2 15 0 15 10 0 5-5 10-5 15l10 5-5 10-15-5c-5 10-10 10-30 5z" />
    <path d="M45 35c5-5 15-5 20 0" fill="none" />
    <circle cx="65" cy="30" r="2" fill={props.color === 'white' ? '#000' : '#fff'} stroke="none" />
    <path d="M30 80h40v5H30v-5z" />
  </ClassicBase>
);

export const ClassicPawn = (props: PieceProps) => (
  <ClassicBase {...props}>
    <circle cx="50" cy="35" r="12" />
    <path d="M50 47c-10 0-18 8-18 20 0 5 5 10 18 13 13-3 18-8 18-13 0-12-8-20-18-20z" />
    <path d="M32 80h36v5H32v-5z" />
  </ClassicBase>
);

export const ClassicSupplier = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M50 15l15 15-15 15-15-15L50 15z" />
    <path d="M50 45v15M35 60h30v10H35V60z" />
    <path d="M32 80h36v5H32v-5z" />
  </ClassicBase>
);
