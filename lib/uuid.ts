export async function getUsernameOrUUID(
    query: string
): Promise<
    {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    }
> {
    let res: {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    } | false = false;
    // if (query.length > 25) res = await getUsernameFromMojang(query);
    // else res = await getUUIDFromMojang(query);
    // if (res !== false) return res;
    res = await getUsernameOrUUIDFromPlayerDB(query);
    if (res !== false) return res;
    res = await getUsernameOrUUIDFromMinetools(query);
    if (res !== false) return res;
    // TODO: Implement more backups
    return {
        success: false,
        message: "Could not find player"
    };
}
export interface MojangResponseSuccess {
    id: string;
    name: string;
    path: never;
    error: never;
    errorMessage: never;
}
export interface MojangResponseError {
    id: never;
    name: never;
    path: string;
    error: string;
    errorMessage: string;
}
export async function getUsernameFromMojang(uuid: string): Promise<
    {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    } | false
> {
    const res = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/${encodeURIComponent(uuid)}`);
    if (!res.ok) {
        console.log("Mojang response", res);
        console.log("Mojang body", await res.text());
        return false;
    }
    try {
        // It returns other stuff, but I don't care
        const data = await res.json() as MojangResponseSuccess | MojangResponseError
        if (data.error) return {
            success: false,
            message: data.errorMessage
        }
        return {
            success: true,
            uuid: data.id,
            uuiddashes: addDashesToUUID(data.id),
            name: data.name
        }
    } catch {
        return false;
    }
}
export async function getUUIDFromMojang(username: string): Promise<
    {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    } | false
> {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`);
    if (!res.ok) {
        console.log("Mojang response", res);
        console.log("Mojang body", await res.text());
        return false;
    }
    try {
        // It returns other stuff, but I don't care
        const data = await res.json() as MojangResponseSuccess | MojangResponseError
        if (data.error) return {
            success: false,
            message: data.errorMessage
        }
        return {
            success: true,
            uuid: data.id,
            uuiddashes: addDashesToUUID(data.id),
            name: data.name
        }
    } catch {
        return false;
    }
}
export async function getUsernameOrUUIDFromPlayerDB(query: string): Promise<
    {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    } | false
> {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(query)}`);
    if (!res.ok) {
        console.log("PlayerDB response", res);
        console.log("PlayerDB body", await res.text());
        return false;
    }
    try {
        // It returns other stuff, but I don't care
        const data = await res.json() as {
            code: string;
            message: string;
            data: {
                player?: {
                    username: string;
                    id: string;
                    raw_id: string;
                }
            };
            success: boolean;
        }
        if (!data.success) return {
            success: false,
            message: data.message
        }
        if (!data.data.player) return false;
        return {
            success: true,
            uuid: data.data.player.raw_id,
            uuiddashes: data.data.player.id,
            name: data.data.player.username
        }
    } catch {
        return false;
    }
}
export async function getUsernameOrUUIDFromMinetools(query: string): Promise<
    {
        success: false;
        message: string;
    } | {
        success: true;
        uuid: string;
        uuiddashes: string;
        name: string;
    } | false
> {
    // const res = await fetch(`https://api.minetools.eu/uuid/${encodeURIComponent(query)}`, {
    //     mode: 'no-cors'
    // });
    const res = await fetch(`https://api.minetools.eu/uuid/${encodeURIComponent(query)}`);
    if (!res.ok) {
        console.log("Minetools response", res);
        console.log("Minetools body", await res.text());
        return false;
    }
    try {
        const data = await res.json() as {
            id: string | null;
            name: string | null;
            status: string;
            error?: string;
            errorMessage?: string;
        };
        if (data.error || data.errorMessage) {
            console.log("Minetools data", data);
            console.log("Minetools data", JSON.stringify(data));
            return false;
        }
        if (data.name === null) return {
            success: false,
            message: "Invalid UUID"
        }
        if (data.id === null) return {
            success: false,
            message: "Invalid Username"
        }
        return {
            success: true,
            uuid: data.id,
            uuiddashes: addDashesToUUID(data.id),
            name: data.name
        };
    } catch {
        return false;
    }
}

export function addDashesToUUID(uuid: string): string {
    return uuid.slice(0,8) + "-" +
        uuid.slice(8,12) + "-" +
        uuid.slice(12,16) + "-" +
        uuid.slice(16,20) + "-" +
        uuid.slice(20);
}