import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClassicKing,
  ClassicQueen,
  ClassicRook,
  ClassicBishop,
  ClassicKnight,
  ClassicPawn,
  ClassicSupplier,
} from "./ClassicSet";

type PieceColor = "white" | "black";

const PieceRenderer: React.FC<{ type: string; color: string; size?: number | string }> = ({
  type,
  color,
  size = 45,
}) => {
  const colorKey: PieceColor = color === "white" ? "white" : "black";
  const t = type.toUpperCase();

  const getPiece = () => {
    switch (t) {
      case "K":
        return <ClassicKing color={colorKey} size={size} />;
      case "Q":
        return <ClassicQueen color={colorKey} size={size} />;
      case "R":
        return <ClassicRook color={colorKey} size={size} />;
      case "B":
        return <ClassicBishop color={colorKey} size={size} />;
      case "N":
        return <ClassicKnight color={colorKey} size={size} />;
      case "P":
        return <ClassicPawn color={colorKey} size={size} />;
      case "S":
        return <ClassicSupplier color={colorKey} size={size} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`classic-${type}-${color}`}
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
