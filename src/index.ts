export async function* httail(url: string, method: 'arrayBuffer'|'text' = 'arrayBuffer') {
    while (true) {
        const res = await fetch(url);
        yield await res[method]();

        const retryAfter = res.headers.get('Retry-After');
        if (!retryAfter) return;

        const retryAfterAsDelay = Number(retryAfter);
        if (retryAfterAsDelay) await wait(retryAfterAsDelay * 1000);

        const retryAfterAsTimestamp = Number(new Date(retryAfter));

        if (isNaN(retryAfterAsTimestamp)) {
            throw new Error(`Invalid Date: ${retryAfter}`);
        }

        await wait(Math.max(0, retryAfterAsTimestamp - Date.now()))
    }
}

function wait(s: number) {
    return new Promise(y => setTimeout(y, s));
}
