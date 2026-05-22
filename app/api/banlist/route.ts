import { getScammerFromDiscord, getScammerFromUUID } from "@/lib/jerry";
import { getSBUBanlistFromUUID } from "@/lib/sbu";
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

    const bans = [];

    const uuidRes = await getUsernameOrUUID(username);
    if (uuidRes.success) {
        try {
            const IsleofDuckRes = await fetch(`https://isle-of-ducks.vercel.app/api/ban?uuid=${encodeURIComponent(uuidRes.uuid)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.ISLEOFDUCKS_BAN_API_KEY!}`,
                },
            });
            const IsleofDuckData = await IsleofDuckRes.json();
            if (IsleofDuckData.banned) bans.push({
                uuid: uuidRes.uuid,
                source: "Isle of Ducks",
                reason: IsleofDuckData.reason,
                discordIds: IsleofDuckData.discords || [],
            });
        } catch {}

        try {
            const jerryScammerResponse = await getScammerFromUUID(uuidRes.uuiddashes);
            if (jerryScammerResponse.success && jerryScammerResponse.scammer) bans.push({
                uuid: uuidRes.uuid,
                source: "Jerry Scammer List (by SkyblockZ: discord.gg/skyblock)",
                reason: jerryScammerResponse.reason || "No reason provided",
                discordIds: jerryScammerResponse.details?.discordIds || [],
            });
        } catch {}

        try {
            const sbuBanlistResponse = await getSBUBanlistFromUUID(uuidRes.uuid);
            if (sbuBanlistResponse.success && sbuBanlistResponse.banned) bans.push({
                uuid: uuidRes.uuid,
                source: "Skyblock University",
                reason: sbuBanlistResponse.details?.reason || "No reason provided",
                discordIds: [], // SBU doesn't provide Discord IDs in their API
            });
        } catch {
            console.error(`Failed to fetch SBU banlist for UUID: ${uuidRes.uuid}`);
        }
    }
    
    try {
        const IsleofDuckRes = await fetch(`https://isle-of-ducks.vercel.app/api/ban?uuid=${encodeURIComponent(username)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ISLEOFDUCKS_BAN_API_KEY!}`,
            },
        });
        const IsleofDuckData = await IsleofDuckRes.json();
        if (IsleofDuckData.banned) bans.push({
            uuid: IsleofDuckData.uuid,
            source: "Isle of Ducks",
            reason: IsleofDuckData.reason,
            discordIds: IsleofDuckData.discords || [],
        });
    } catch {}

    try {
        const jerryScammerDiscordResponse = await getScammerFromDiscord(username);
        if (jerryScammerDiscordResponse.success && jerryScammerDiscordResponse.scammer) bans.push({
            uuid: jerryScammerDiscordResponse.details?.uuid,
            source: "Jerry Scammer List (by SkyblockZ: discord.gg/skyblock)",
            reason: jerryScammerDiscordResponse.reason || "No reason provided",
            discordIds: jerryScammerDiscordResponse.details?.discordIds || [],
        });
    } catch {}

    const uniqueBans = Array.from(new Map(bans.map(ban => [ban.uuid, ban])).values());
    return NextResponse.json(uniqueBans, { status: 200 });
}