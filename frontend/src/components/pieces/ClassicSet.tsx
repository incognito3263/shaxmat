import React from "react";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  size?: number | string;
}

const ClassicBase = ({ color, children, size }: React.PropsWithChildren<PieceProps>) => {
  const isWhite = color === "white";
  const fill = isWhite ? "#f7f7f7" : "#1b1b1b";
  const stroke = isWhite ? "#222222" : "#dcdcdc";
  const accent = isWhite ? "#d8d8d8" : "#303030";

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
      <ellipse cx="22.5" cy="41" rx="13.5" ry="2.2" fill={accent} opacity="0.25" />
    </svg>
  );
};

export const ClassicKing = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 6V13M19.5 9.5h6" fill="none" />
    <path d="M14 16h17v4H14z" />
    <path d="M16 20h13v5c3 2 5 5.2 5 8.5V37H11V33.5c0-3.3 2-6.5 5-8.5v-5z" />
    <path d="M12 31.5c3.5-1.6 17.5-1.6 21 0M11.5 34.5c4-1.6 18-1.6 22 0" fill="none" />
  </ClassicBase>
);

export const ClassicQueen = (props: PieceProps) => (
  <ClassicBase {...props}>
    <circle cx="10" cy="12" r="2.2" />
    <circle cx="18" cy="9" r="2.2" />
    <circle cx="27" cy="9" r="2.2" />
    <circle cx="35" cy="12" r="2.2" />
    <path d="M9.5 14.5 14 24h17l4.5-9.5-6 4-7-7-7 7-6-4z" />
    <path d="M12 24.5c3.5-1.2 17.5-1.2 21 0l-1.7 9.5H13.7L12 24.5z" />
    <path d="M13 31.5c3.6-1.4 15.4-1.4 19 0" fill="none" />
  </ClassicBase>
);

export const ClassicRook = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M12 9h5v3h3V9h5v3h3V9h5v6H12z" />
    <path d="M13.5 15h18v16h-18z" />
    <path d="M11.5 31h22l2 6h-26z" />
    <path d="M12 15h21" fill="none" />
  </ClassicBase>
);

export const ClassicBishop = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 8.2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2z" />
    <path d="M22.5 14.8c6.2 0 8.5 5.2 8.5 9.5 0 3.2-1.5 5-3.8 6.8l2.3 5.9H15.5l2.3-5.9c-2.3-1.8-3.8-3.6-3.8-6.8 0-4.3 2.3-9.5 8.5-9.5z" />
    <path d="M20 20.3h5m-6 4.2h7" fill="none" />
  </ClassicBase>
);

export const ClassicKnight = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M14 36c0-9 6-13 9-18 1.4-2.3 1.7-5 1.1-8.2 5.4 1.6 9.7 6.2 8.2 12.2L35 24l-4 3c.8 2.3.8 5.5.3 9H14z" />
    <path d="M20 19.5c2.2 1.3 5.4 1.4 7.6.5" fill="none" />
    <circle cx="24.8" cy="15.8" r="1.1" fill={props.color === "white" ? "#111" : "#efefef"} stroke="none" />
  </ClassicBase>
);

export const ClassicPawn = (props: PieceProps) => (
  <ClassicBase {...props}>
    <circle cx="22.5" cy="13" r="4.1" />
    <path d="M22.5 18.8c5 0 7.4 3.7 7.4 7.4 0 2.3-1.4 4.3-3.4 5.5l1.7 5.3H16.8l1.7-5.3c-2-1.2-3.4-3.2-3.4-5.5 0-3.7 2.4-7.4 7.4-7.4z" />
  </ClassicBase>
);

export const ClassicSupplier = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 6 27 10.5 22.5 15 18 10.5z" />
    <path d="M22.5 15v5.5" fill="none" />
    <path d="M15.5 22.5h14v4.5h-14z" />
    <path d="M22.5 18.8c5 0 7.4 3.7 7.4 7.4 0 2.3-1.4 4.3-3.4 5.5l1.7 5.3H16.8l1.7-5.3c-2-1.2-3.4-3.2-3.4-5.5 0-3.7 2.4-7.4 7.4-7.4z" />
  </ClassicBase>
);
