import { getScammerFromUUID } from "@/lib/jerry";
import { getUsernameOrUUID } from "@/lib/uuid";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();

    if (!username) {
        return NextResponse.json(
            { error: "Missing required query parameter: username" },
            { status: 400 },
        );
    }

    const uuidRes = await getUsernameOrUUID(username);
    if (!uuidRes.success) {
        return NextResponse.json(
            { success: false, message: uuidRes.message },
            { status: 400 },
        );
    }

    const bans = [];
    const isleOfDucksApiKey = process.env.ISLEOFDUCKS_BAN_API_KEY;

    if (!isleOfDucksApiKey) {
        return NextResponse.json(
            {
                success: false,
                message: "Server misconfiguration: ISLEOFDUCKS_BAN_API_KEY is not set",
            },
            { status: 500 },
        );
    }

    const IsleofDuckRes = await fetch(`https://isle-of-ducks.vercel.app/api/ban?uuid=${encodeURIComponent(uuidRes.uuid)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${isleOfDucksApiKey}`,
        },
    });
    const IsleofDuckData = await IsleofDuckRes.json();
    if (IsleofDuckData.banned) bans.push({
        source: "Isle of Ducks",
        reason: IsleofDuckData.reason,
        discordIds: IsleofDuckData.discords || [],
    });

    const jerryScammerResponse = await getScammerFromUUID(uuidRes.uuiddashes);
    if (jerryScammerResponse.success && jerryScammerResponse.scammer) bans.push({
        source: "Jerry Scammer List (by SkyblockZ: discord.gg/skyblock)",
        reason: jerryScammerResponse.reason || "No reason provided",
        discordIds: jerryScammerResponse.details?.discordIds || [],
    })

    return NextResponse.json(bans, { status: 200 });
}