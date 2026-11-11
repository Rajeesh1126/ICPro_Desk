const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(
    fs.readFileSync('src/api/session.ts', 'utf8').replaceAll('import.meta.env.BASE_URL', '"/"')
        .replaceAll('import.meta.env.VITE_API_BASE_URL', '"http://api.test"'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText;

function session() {
    let now = 1_000_000;
    let cleanup;
    let refreshes = 0;
    const redirects = [];
    const values = new Map();
    const timers = new Map();
    const listeners = new Map();
    let timerId = 0;
    const storage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        clear: () => values.clear(),
    };
    const events = {
        addEventListener(type, handler) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(handler);
        },
        removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    };
    const token = milliseconds => JSON.stringify({ exp: (now + milliseconds) / 1000 });
    const axios = {
        post: async () => {
            refreshes++;
            return { data: { access: token(60_000), refresh: token(86_400_000) } };
        },
        isAxiosError: () => false,
    };
    const mocks = {
        react: { useEffect: callback => { cleanup = callback(); } },
        axios: { default: axios },
        'jwt-decode': { jwtDecode: JSON.parse },
        '@/styles/theme/themeModeContext': { themeStorageKey: 'theme' },
        '@/api/queryClient': { queryClient: { cancelQueries() {}, clear() {} } },
    };
    const context = {
        URLSearchParams,
        exports: {}, require: name => mocks[name], localStorage: storage,
        sessionStorage: { clear() {} }, Date: { now: () => now },
        window: {
            ...events,
            location: { pathname: '/Home', search: '', hash: '', replace: url => redirects.push(url) },
            setTimeout: (fn, delay) => { const id = ++timerId; timers.set(id, { at: now + delay, fn }); return id; },
            clearTimeout: id => timers.delete(id),
        },
        document: { ...events, visibilityState: 'visible' },
    };
    vm.runInNewContext(source, context);
    const api = context.exports;
    storage.setItem('accessToken', token(60_000));
    storage.setItem('refreshToken', token(86_400_000));
    api.startSessionActivity();
    const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
    return {
        api, storage, redirects,
        get refreshes() { return refreshes; },
        mount() { api.useSessionExpiryWatch(); },
        unmount() { cleanup(); },
        async event(type, extra = {}) {
            for (const handler of listeners.get(type) ?? []) handler({ isTrusted: true, ...extra });
            await settle();
        },
        jump(ms) { now += ms; },
        async advance(ms) {
            const end = now + ms;
            while (true) {
                const next = [...timers.entries()].sort((a, b) => a[1].at - b[1].at)[0];
                if (!next || next[1].at > end) break;
                now = next[1].at;
                timers.delete(next[0]);
                next[1].fn();
                await settle();
            }
            now = end;
            await settle();
        },
    };
}

test('active work continues beyond ten minutes with automatic token refresh', async () => {
    const s = session();
    s.mount();
    for (let minute = 0; minute < 21; minute++) {
        await s.advance(59_000);
        await s.event('keydown');
    }
    assert.ok(s.refreshes >= 19);
    assert.equal(s.redirects.length, 0);
    assert.equal(s.api.hasActiveSession(), true);
    s.unmount();
});

test('background token refresh does not postpone ten-minute idle logout', async () => {
    const s = session();
    s.mount();
    await s.advance(599_999);
    assert.equal(s.redirects.length, 0);
    await s.advance(1);
    assert.equal(s.redirects.length, 1);
    assert.equal(s.storage.getItem('refreshToken'), null);
    s.unmount();
});

test('activity in another tab extends the shared idle deadline', async () => {
    const s = session();
    s.mount();
    await s.advance(540_000);
    s.api.startSessionActivity();
    await s.event('storage', { key: 'sessionLastActivity' });
    await s.advance(599_999);
    assert.equal(s.redirects.length, 0);
    await s.advance(1);
    assert.equal(s.redirects.length, 1);
    s.unmount();
});

test('first interaction after sleeping past idle deadline cannot revive the session', async () => {
    const s = session();
    s.mount();
    s.jump(600_001);
    await s.event('pointerdown');
    assert.equal(s.redirects.length, 1);
    assert.equal(s.storage.getItem('accessToken'), null);
    s.unmount();
});

test('idle requests and refresh attempts are rejected even before the timer runs', async () => {
    const s = session();
    s.jump(600_000);
    assert.equal(s.api.hasActiveSession(), false);
    assert.throws(() => s.api.requireActiveSession(), /inactivity/);
    assert.equal(s.redirects.length, 1);
    assert.equal(s.refreshes, 0);
});

test('unmount removes activity listeners and expiry timers', async () => {
    const s = session();
    s.mount();
    s.unmount();
    await s.advance(700_000);
    await s.event('keydown');
    assert.equal(s.redirects.length, 0);
    assert.equal(s.refreshes, 0);
});
