export function httail(url: string, method: 'text'): AsyncIterable<string>;
export function httail(url: string, method: 'arrayBuffer'): AsyncIterable<ArrayBuffer>;
export async function* httail(url: string, method: 'arrayBuffer'|'text' = 'arrayBuffer'): AsyncIterable<ArrayBuffer|string> {

    let lastModified = null;
    while (true) {
        const headers = new Headers();
        if (lastModified) {
            headers.append('If-Nodified-Since', lastModified);
        }

        headers.append('Prefer', 'follow');

        const res = await fetch(url, { headers });

        lastModified = res.headers.get('Last-Modified')

        yield await res[method]();

        const retryAfter = res.headers.get('Retry-After');
        if (!retryAfter) return;

        const retryAfterAsDelay = Number(retryAfter);
        if (retryAfterAsDelay) await wait(retryAfterAsDelay * 1000);

        const retryAfterAsTimestamp = Number(new Date(retryAfter));

        if (!isNaN(retryAfterAsTimestamp)) {
            await wait(Math.max(0, retryAfterAsTimestamp - Date.now()))
        }
    }
}

function wait(s: number): Promise<void> {
    return new Promise(y => setTimeout(y, s));
}
