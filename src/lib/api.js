const API_BASE = "/api";
const SESSION_KEY = "simpel.session";
const writeQueues = new Map();

export function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token) {
  if (token) localStorage.setItem(SESSION_KEY, token);
  else localStorage.removeItem(SESSION_KEY);
}

export async function request(path, { method = "GET", body, token = getSessionToken() } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Permintaan gagal (${response.status}).`);
  return result;
}

export function saveData(resource, value) {
  const previous = writeQueues.get(resource) || Promise.resolve();
  const next = previous.catch(() => {}).then(() =>
    request(`/data/${encodeURIComponent(resource)}`, { method: "PUT", body: value })
  );
  writeQueues.set(resource, next);
  return next;
}
