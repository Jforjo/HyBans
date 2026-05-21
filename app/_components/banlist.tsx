"use client";

import React from "react";

type BanlistEntry = {
    source: string;
    reason: string;
    discordIds: string[];
};

export default function Banlist() {
    const [input, setInput] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [result, setResult] = React.useState<BanlistEntry[] | null>(null);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedInput = input.trim();
        if (!trimmedInput) {
            setError("Please enter a username, UUID or Discord ID.");
            setResult(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/banlist?username=${encodeURIComponent(trimmedInput)}`,
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? "Failed to fetch ban list data.");
            }

            // Defensive: ensure data is an array
            setResult(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            setResult(null);
            setError(
                fetchError instanceof Error
                    ? fetchError.message
                    : "An unexpected error occurred.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="flex flex-col max-w-2xl w-full items-center justify-center mt-4 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col sm:flex-row gap-2"
            >
                <input
                    type="text"
                    placeholder="Username, UUID, or Discord ID"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                    className="w-full p-2 border border-neutral-600 rounded-2xl"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-2xl border border-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Checking..." : "Check"}
                </button>
            </form>

            <div className="mt-4 w-full min-h-24">
                {error && <p className="text-red-700 text-center">{error}</p>}
                {!error && result && result.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {result.map((entry, idx) => (
                            <div
                                key={idx}
                                className="border border-neutral-700 rounded-xl bg-neutral-900 p-4 shadow-sm flex flex-col gap-2"
                            >
                                <div className="font-semibold text-base text-neutral-400">
                                    Source: <span className="font-normal">{entry.source}</span>
                                </div>
                                <div className="text-neutral-400">
                                    <span className="font-semibold">Reason:</span> {entry.reason}
                                </div>
                                <div className="text-neutral-400">
                                    <span className="font-semibold">Discord IDs:</span>
                                    {entry.discordIds && entry.discordIds.length > 0 ? (
                                        <ul className="list-disc list-inside ml-4">
                                            {entry.discordIds.map((id, i) => (
                                                <li key={i}>{id}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="ml-2 text-neutral-500">None</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!error && result && result.length === 0 && (
                    <p className="text-green-700 font-medium text-center">No bans found for this user.</p>
                )}
                {!error && !result && (
                    <p className="text-neutral-600 text-sm text-center">
                        Submit a username, UUID, or Discord ID to see API results.
                    </p>
                )}
            </div>
        </section>
    );
}