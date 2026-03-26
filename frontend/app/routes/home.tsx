import { useState, useRef } from "react";
import type { Route } from "./+types/home";

const W = 5;
const H = 5;

type PuzzleResponse = {
  date: string;
  puzzle: {
    vertical: number;
    horizontal: number;
    order: number[];
  };
};

type LoaderData =
  | {
      status: "ready";
      puzzleResponse: PuzzleResponse;
    }
  | {
      status: "missing";
    };

type Piece = Record<"t" | "b" | "l" | "r", "bump" | "dent" | "flat"> &
  Record<"id", number>;
type EdgeShape = Piece["t"];

const topEdge = (shape: EdgeShape) => {
  if (shape === "flat") return "L100 0";
  if (shape === "bump")
    return "L35 0 C40 0 40 -14 50 -14 C60 -14 60 0 65 0 L100 0";
  return "L35 0 C40 0 40 14 50 14 C60 14 60 0 65 0 L100 0";
};

const rightEdge = (shape: EdgeShape) => {
  if (shape === "flat") return "L100 100";
  if (shape === "bump")
    return "L100 35 C100 40 114 40 114 50 C114 60 100 60 100 65 L100 100";
  return "L100 35 C100 40 86 40 86 50 C86 60 100 60 100 65 L100 100";
};

const bottomEdge = (shape: EdgeShape) => {
  if (shape === "flat") return "L0 100";
  if (shape === "bump")
    return "L65 100 C60 100 60 114 50 114 C40 114 40 100 35 100 L0 100";
  return "L65 100 C60 100 60 86 50 86 C40 86 40 100 35 100 L0 100";
};

const leftEdge = (shape: EdgeShape) => {
  if (shape === "flat") return "L0 0";
  if (shape === "bump")
    return "L0 65 C0 60 -14 60 -14 50 C-14 40 0 40 0 35 L0 0";
  return "L0 65 C0 60 14 60 14 50 C14 40 0 40 0 35 L0 0";
};

const piecePath = (piece: Piece) =>
  `M0 0 ${topEdge(piece.t)} ${rightEdge(piece.r)} ${bottomEdge(piece.b)} ${leftEdge(piece.l)} Z`;

function JigsawPiece({
  piece,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onTouchStart,
  onTouchEnd,
  isDragging,
  isComplete,
  showDebugNumbers,
}: {
  piece: Piece;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onTouchStart: (index: number) => void;
  onTouchEnd: (index: number) => void;
  isDragging: boolean;
  isComplete: boolean;
  showDebugNumbers: boolean;
}) {
  return (
    <div
      draggable={!isComplete}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onTouchStart={() => onTouchStart(index)}
      onTouchEnd={() => onTouchEnd(index)}
      className={`relative rounded-md p-1 transition-all duration-700 ${
        isComplete
          ? "scale-[1.2] sm:scale-[1.5] cursor-default"
          : isDragging
            ? "opacity-40 scale-95 cursor-move"
            : "hover:bg-base-100/60 hover:scale-105 cursor-move active:scale-110"
      }`}
    >
      <svg viewBox="-20 -20 140 140" className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
        <path
          d={piecePath(piece)}
          fill="hsl(var(--b2))"
          stroke="hsl(var(--bc) / 0.7)"
          strokeWidth="4"
        />
      </svg>
      {showDebugNumbers && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white">{piece.id}</span>
        </div>
      )}
    </div>
  );
}

export async function loader(_args: Route.LoaderArgs) {
  const apiUrl = process.env.API_URL ?? "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/puzzle/today`);
  if (res.status === 404) {
    return { status: "missing" } satisfies LoaderData;
  }
  if (!res.ok) throw new Error("Failed to get today's puzzle");

  const data: PuzzleResponse = await res.json();
  return { status: "ready", puzzleResponse: data } satisfies LoaderData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === "missing") {
    return (
      <>
        <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest">Puzzle</h1>
        <p className="text-center text-sm sm:text-base text-base-content/80 px-4">
          Today&apos;s puzzle is not available yet. Please try again later.
        </p>
      </>
    );
  }

  const { date, puzzle } = loaderData.puzzleResponse;
  let id = 0;
  let pieces: Piece[] = Array.from({ length: W * H }, () => {
    return { t: "flat", b: "flat", l: "flat", r: "flat", id: id++ };
  });
  const piecesWithL = pieces.filter((_, i) => i % W !== 0);
  const piecesWithR = pieces.filter((_, i) => (i + 1) % W !== 0);
  const piecesWithT = pieces.filter((_, i) => i >= W);
  const piecesWithB = pieces.filter((_, i) => i <= W * (H - 1) - 1);
  for (let i = 0; i < (W - 1) * H; i++) {
    const vData = (puzzle.vertical >> i) & 1;
    piecesWithR[i].r = vData ? "bump" : "dent";
    piecesWithL[i].l = vData ? "dent" : "bump";
  }
  for (let i = 0; i < W * (H - 1); i++) {
    const hData = (puzzle.horizontal >> i) & 1;
    piecesWithB[i].b = hData ? "bump" : "dent";
    piecesWithT[i].t = hData ? "dent" : "bump";
  }

  const [currentPieces, setCurrentPieces] = useState<Piece[]>(
    puzzle.order.map((i) => pieces[i]),
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [time, setTime] = useState<string | null>(null);

  const { current: startTime } = useRef<Date>(new Date());

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Swap the pieces
    const newPieces = [...currentPieces];
    [newPieces[draggedIndex], newPieces[dropIndex]] = [
      newPieces[dropIndex],
      newPieces[draggedIndex],
    ];
    setCurrentPieces(newPieces);
    setDraggedIndex(null);

    // Check if puzzle is complete after updating state
    setTimeout(() => checkComplete(newPieces), 0);
  };

  const handleTouchStart = (index: number) => {
    if (isComplete) return;
    setTouchStartIndex(index);
    setDraggedIndex(index);
  };

  const handleTouchEnd = (index: number) => {
    if (isComplete || touchStartIndex === null || touchStartIndex === index) {
      setTouchStartIndex(null);
      setDraggedIndex(null);
      return;
    }

    // Swap the pieces
    const newPieces = [...currentPieces];
    [newPieces[touchStartIndex], newPieces[index]] = [
      newPieces[index],
      newPieces[touchStartIndex],
    ];
    setCurrentPieces(newPieces);
    setTouchStartIndex(null);
    setDraggedIndex(null);

    // Check if puzzle is complete after updating state
    setTimeout(() => checkComplete(newPieces), 0);
  };

  const checkComplete = (piecesToCheck: Piece[]) => {
    const piecesWithL = piecesToCheck.filter((_, i) => i % W !== 0);
    const piecesWithR = piecesToCheck.filter((_, i) => (i + 1) % W !== 0);
    const piecesWithT = piecesToCheck.filter((_, i) => i >= W);
    const piecesWithB = piecesToCheck.filter((_, i) => i <= W * (H - 1) - 1);
    for (let i = 0; i < (W - 1) * H; i++) {
      if (
        !(
          (piecesWithR[i].r === "bump" && piecesWithL[i].l === "dent") ||
          (piecesWithR[i].r === "dent" && piecesWithL[i].l === "bump")
        )
      )
        return;
    }
    for (let i = 0; i < W * (H - 1); i++) {
      if (
        !(
          (piecesWithB[i].b === "bump" && piecesWithT[i].t === "dent") ||
          (piecesWithB[i].b === "dent" && piecesWithT[i].t === "bump")
        )
      )
        return;
    }
    setIsComplete(true);
    const endTime = new Date();
    const timeDiff = endTime.getTime() - startTime.getTime();
    const totalSeconds = Math.floor(timeDiff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    setTime(
      String(h).padStart(2, "0") +
        ":" +
        String(m).padStart(2, "0") +
        ":" +
        String(s).padStart(2, "0"),
    );
  };

  return (
    <>
      <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest">PUZZDLE</h1>
      <p className="mb-4 text-sm sm:text-base">Date: {date}</p>

      <div
        className={`mb-6 grid grid-cols-5 bg-white rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-700 ${
          isComplete ? "gap-0" : "gap-1 sm:gap-2 md:gap-3"
        }`}
      >
        {currentPieces.map((piece, index) => (
          <JigsawPiece
            key={`${piece.id}-${index}`}
            piece={piece}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            isDragging={draggedIndex === index}
            isComplete={isComplete}
            showDebugNumbers={process.env.NODE_ENV === "development"}
          />
        ))}
      </div>
      {isComplete && (
        <div className="mt-6 text-xl sm:text-2xl md:text-3xl font-bold">Time: {time}</div>
      )}
    </>
  );
}
