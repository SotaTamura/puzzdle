const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export type HintResult = "correct" | "present" | "absent";

export interface TodayWord {
	id: number;
	length: number;
	date: string;
}

export interface GuessResponse {
	result: HintResult[];
	correct: boolean;
}

export async function submitGuess(guess: string): Promise<GuessResponse> {
	const res = await fetch(`${API_BASE}/api/wordle/guess`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ guess }),
	});
	if (!res.ok) throw new Error("Failed to submit guess");
	return res.json();
}
