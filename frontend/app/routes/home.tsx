import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/home";

type HintResult = "correct" | "present" | "absent";

const MAX_ATTEMPTS = 6;

export async function loader(_args: Route.LoaderArgs) {
	const apiUrl = process.env.API_URL ?? "http://localhost:8080";
	const res = await fetch(`${apiUrl}/api/wordle/today`);
	if (!res.ok) throw new Error("Failed to get today's word");
	const data: { id: number; length: number; date: string } = await res.json();
	return { wordLength: data.length, date: data.date };
}

export async function action({ request }: Route.ActionArgs) {
	const apiUrl = process.env.API_URL ?? "http://localhost:8080";
	const formData = await request.formData();
	const guess = formData.get("guess");
	if (typeof guess !== "string" || guess.length === 0) {
		return { error: "Invalid guess" };
	}

	const res = await fetch(`${apiUrl}/api/wordle/guess`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ guess }),
	});
	if (!res.ok) {
		return { error: "Failed to submit guess" };
	}

	const data: { result: HintResult[]; correct: boolean } = await res.json();
	return { guess, result: data.result, correct: data.correct };
}

function cellColor(hint: HintResult | undefined): string {
	if (hint === "correct") return "#538d4e";
	if (hint === "present") return "#b59f3b";
	return "#3a3a3c";
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { wordLength } = loaderData;
	const [currentGuess, setCurrentGuess] = useState("");

	const fetcher = useFetcher<typeof action>();

	// Build game state from accumulated fetcher results
	const historyRef = useRef<{ guess: string; result: HintResult[] }[]>([]);

	// When fetcher completes with success, append to history
	if (fetcher.data && !("error" in fetcher.data) && fetcher.state === "idle") {
		const last = historyRef.current[historyRef.current.length - 1];
		if (!last || last.guess !== fetcher.data.guess) {
			historyRef.current = [
				...historyRef.current,
				{ guess: fetcher.data.guess, result: fetcher.data.result },
			];
		}
	}

	const history = historyRef.current;
	const guesses = history.map((h) => h.guess);
	const hints = history.map((h) => h.result);
	const error = fetcher.data && "error" in fetcher.data ? fetcher.data.error : "";
	const gameWon = history.some((h) => h.result.every((r) => r === "correct"));
	const gameOver = gameWon || history.length >= MAX_ATTEMPTS;

	useEffect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (gameOver || fetcher.state !== "idle") return;

			if (e.key === "Enter") {
				if (currentGuess.length !== wordLength) return;
				fetcher.submit({ guess: currentGuess.toLowerCase() }, { method: "post" });
				setCurrentGuess("");
			} else if (e.key === "Backspace") {
				setCurrentGuess((prev) => prev.slice(0, -1));
			} else if (/^[a-zA-Z]$/.test(e.key)) {
				setCurrentGuess((prev) => (prev.length < wordLength ? prev + e.key.toLowerCase() : prev));
			}
		}

		window.addEventListener("keydown", handleKeydown);
		return () => window.removeEventListener("keydown", handleKeydown);
	}, [gameOver, wordLength, currentGuess, fetcher]);

	return (
		<>
			<h1 className="text-3xl tracking-widest mb-6 font-bold">Wordle</h1>

			{error ? (
				<p className="text-error">{error}</p>
			) : (
				<>
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
							{gameWon ? `Solved in ${guesses.length} attempt(s)!` : "Game over!"}
						</p>
					)}
				</>
			)}
		</>
	);
}
