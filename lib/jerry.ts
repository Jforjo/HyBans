const Jerry = {
    routes: {
        base: "https://jerry.robothanzo.dev/v1",
        getScammerFromUUID: (uuid: string) => `${Jerry.routes.base}/scammers/${uuid}`,
        getScammerFromDiscord: (discordId: string) => `${Jerry.routes.base}/scammers/discord/${discordId}`
    }
}

interface ScammerDetails {
    uuid: string;
    reason: string;
    discordIds: string[];
    alts: null | string[];
    staff: string;
    evidence: string;
    creationTime: number;
}
interface GetScammerResponse {
    success: boolean;
    scammer?: boolean;
    alt?: boolean;
    details?: null | ScammerDetails;
    reason?: string;
}
interface GetScammerResponseSuccess extends GetScammerResponse {
    success: true;
    scammer: boolean;
    alt: boolean;
    details: null | ScammerDetails;
    reason?: never;
}
interface GetScammerResponseError extends GetScammerResponse {
    success: false;
    reason: string;
    scammer?: never;
    alt?: never;
    details?: never;
}

export async function getScammerFromUUID(
    uuid: string,
    tries = 0
): Promise<
    GetScammerResponseSuccess | GetScammerResponseError
>{
    const jerryBanKey = process.env.JERRY_BAN_KEY;

    if (!jerryBanKey) {
        return {
            success: false,
            reason: "Server misconfiguration: JERRY_BAN_KEY is not set"
        }
    }

    const res = await fetch(Jerry.routes.getScammerFromUUID(uuid), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${jerryBanKey}`
        }
    });

    if (res.status === 400) {
        return {
            success: false,
            reason: "Invalid UUID"
        }
    } else if (res.status === 403) {
        return {
            success: false,
            reason: "Invalid token"
        }
    } else if (res.status === 525) {
        if (tries < 3) {
            return getScammerFromUUID(uuid, tries + 1);
        }
    }

    if (!res.ok) {
        console.log("JerryScammer res", res);
        console.log("JerryScammer resText", await res.text());
        return {
            success: false,
            reason: "Failed to fetch scammer"
        }
    }

    return await res.json() as GetScammerResponseSuccess | GetScammerResponseError;
}