from typing import Tuple, List, Optional


class Piece:
    type: str = ""

    def __init__(self, color: str, position: Tuple[int, int]):
        self.color = color
        self.position = position
        self.has_moved = False

    def get_valid_moves(self, board) -> List[Tuple[int, int]]:
        """Pseudo-legal moves (no king-safety filter). Subclasses override."""
        raise NotImplementedError

    def clone(self) -> 'Piece':
        """Return a shallow copy of this piece."""
        p = self.__class__.__new__(self.__class__)
        p.__dict__.update(self.__dict__)
        return p

    def to_dict(self) -> dict:
        return {
            "type": self.type,
            "color": self.color,
            "has_moved": self.has_moved,
        }

    def __str__(self):
        return self.type.upper() if self.color == "white" else self.type.lower()

    def __repr__(self):
        return f"{self.__class__.__name__}({self.color}, {self.position})"

    def __eq__(self, other):
        if not isinstance(other, Piece):
            return NotImplemented
        return (self.color == other.color and
                self.position == other.position and
                self.type == other.type)

    def __hash__(self):
        return hash((self.color, self.position, self.type))
