import { useCallback, useEffect, useState } from "react";
import { type HintResult, submitGuess } from "../lib/api";
import type { Route } from "./+types/home";

const MAX_ATTEMPTS = 6;

export async function loader(_args: Route.LoaderArgs) {
	const apiUrl = process.env.API_URL ?? "http://localhost:8080";
	const res = await fetch(`${apiUrl}/api/wordle/today`);
	if (!res.ok) throw new Error("Failed to get today's word");
	const data: { id: number; length: number; date: string } = await res.json();
	return { wordLength: data.length, date: data.date };
}

function cellColor(hint: HintResult | undefined): string {
	if (hint === "correct") return "#538d4e";
	if (hint === "present") return "#b59f3b";
	return "#3a3a3c";
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { wordLength } = loaderData;
	const [guesses, setGuesses] = useState<string[]>([]);
	const [hints, setHints] = useState<HintResult[][]>([]);
	const [currentGuess, setCurrentGuess] = useState("");
	const [gameOver, setGameOver] = useState(false);
	const [won, setWon] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = useCallback(async () => {
		if (currentGuess.length !== wordLength || gameOver) return;

		try {
			setError("");
			const res = await submitGuess(currentGuess.toLowerCase());
			const newGuesses = [...guesses, currentGuess.toLowerCase()];
			setGuesses(newGuesses);
			setHints((prev) => [...prev, res.result]);

			if (res.correct) {
				setGameOver(true);
				setWon(true);
			} else if (newGuesses.length >= MAX_ATTEMPTS) {
				setGameOver(true);
			}

			setCurrentGuess("");
		} catch {
			setError("Failed to submit guess");
		}
	}, [currentGuess, wordLength, gameOver, guesses]);

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (gameOver) return;

			if (e.key === "Enter") {
				handleSubmit();
			} else if (e.key === "Backspace") {
				setCurrentGuess((prev) => prev.slice(0, -1));
			} else if (/^[a-zA-Z]$/.test(e.key)) {
				setCurrentGuess((prev) => (prev.length < wordLength ? prev + e.key.toLowerCase() : prev));
			}
		}

		window.addEventListener("keydown", handleKeydown);
		return () => window.removeEventListener("keydown", handleKeydown);
	}, [gameOver, wordLength, handleSubmit]);

	if (error) {
		return <p className="text-error">{error}</p>;
	}

	return (
		<>
			<h1 className="text-3xl tracking-widest mb-6 font-bold">Wordle</h1>

			<div className="flex flex-col gap-1.5">
				{Array.from({ length: MAX_ATTEMPTS }, (_, row) => (
					<div key={row} className="flex gap-1.5">
						{Array.from({ length: wordLength }, (_, col) => {
							const letter =
								row < guesses.length
									? guesses[row][col]
									: row === guesses.length
										? (currentGuess[col] ?? "")
										: "";
							const hint = row < hints.length ? hints[row][col] : undefined;

							return (
								<div
									key={col}
									className="w-14 h-14 border-2 border-base-content/20 flex items-center justify-center text-3xl font-bold uppercase"
									style={{
										backgroundColor: row < hints.length ? cellColor(hint) : undefined,
									}}
								>
									{letter}
								</div>
							);
						})}
					</div>
				))}
			</div>

			{gameOver && (
				<p className="mt-6 text-lg">
					{won ? `Solved in ${guesses.length} attempt(s)!` : "Game over!"}
				</p>
			)}
		</>
	);
}
