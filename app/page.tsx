import Image from "next/image";
import Banlist from "./_components/banlist";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-center mt-10">Welcome to HyBans!</h1>
            <p className="text-center mt-4 text-lg">
                Check if a Hypixel player is in various ban lists.
            </p>
            <Banlist />
        </main>
    );
}
