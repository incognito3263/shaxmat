import React from "react";

type PieceColor = "white" | "black";

interface PieceProps {
  color: PieceColor;
  size?: number | string;
}

const ClassicBase = ({ color, children, size = "100%" }: React.PropsWithChildren<PieceProps>) => {
  const isWhite = color === "white";
  const fill = isWhite ? "#ffffff" : "#454341";
  const stroke = isWhite ? "#000000" : "#ffffff";

  return (
    <svg width={size} height={size} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>
      <g fill={fill} stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
};

export const ClassicKing = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 6V11M20 8.5H25" fill="none" strokeWidth="1.5" />
    <path d="M22.5 25s4.5-7.5 4.5-10.5c0-2.1-1.69-3.5-3.5-3.5s-3.5 1.4-3.5 3.5c0 3 4.5 10.5 4.5 10.5z" />
    <path d="M11.5 37c0-3.3 2-6.5 5-8.5V22h12v6.5c3 2 5 5.2 5 8.5v2h-22v-2z" />
    <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0" fill="none" />
  </ClassicBase>
);

export const ClassicQueen = (props: PieceProps) => (
  <ClassicBase {...props}>
    <g>
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 13.5 9.5 26z" />
      <path d="M9 26c0 2 1.5 2 2.5 4 1 3 1 1 1 1h20s0 2 1-1c1-2 2.5-2 2.5-4 0-1.5 0-1.5 0-1.5H9s0 0 0 1.5z" />
      <path d="M11.5 37v2h22v-2l-3-1h-16l-3 1z" />
    </g>
    <circle cx="6.5" cy="11.5" r="2" />
    <circle cx="14.5" cy="8.5" r="2" />
    <circle cx="22.5" cy="7" r="2" />
    <circle cx="30.5" cy="8.5" r="2" />
    <circle cx="38.5" cy="11.5" r="2" />
  </ClassicBase>
);

export const ClassicRook = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
    <path d="M34 14l-3 3H14l-3-3V14z" />
    <path d="M31 17v12.5H14V17h17z" />
    <path d="M31 29.5l1.5 2.5h-20l1.5-2.5h17z" />
    <path d="M11 14h23" fill="none" />
  </ClassicBase>
);

export const ClassicBishop = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M9 36c3.39 1.06 15.39 1.06 18.78 0l3.22 3h-25.22l3.22-3z" />
    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
    <path d="M17.5 26h10M15 30c2.5 2.5 12.5 2.5 15 0" fill="none" />
  </ClassicBase>
);

export const ClassicKnight = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
    <path d="M24 18c.38 2.43-4.65 7.32-6 10-3 6-1 11-1 11" />
    <path d="M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5z" fill={props.color === 'white' ? '#000' : '#fff'} />
    <path d="M15 15.5c4.5 2 5 2 10 0 0 0-2.5-2.5-2.5-4s.5-4 .5-4c-1.49.3-2 2.35-3 2.5L15 15.5z" />
    <path d="M24 18c-1.5 1-3.5 1-5 0" fill="none" />
    <circle cx="27" cy="14" r="1.2" fill={props.color === 'white' ? '#000' : '#fff'} stroke="none" />
  </ClassicBase>
);

export const ClassicPawn = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 13 18.5 13 21c0 2.03 3.5 3.5 3.5 3.5V32c0 1.5-1.5 2.5-1.5 2.5h15s-1.5-1-1.5-2.5v-7.5s3.5-1.47 3.5-3.5c0-2.5-4.33-4.5-6.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
  </ClassicBase>
);

export const ClassicSupplier = (props: PieceProps) => (
  <ClassicBase {...props}>
    <path d="M22.5 7l10 10-10 10-10-10L22.5 7z" />
    <path d="M22.5 27v8" fill="none" />
    <path d="M14 35h17v4H14v-4z" />
    <path d="M12 39h21l2 3H10l2-3z" />
  </ClassicBase>
);
