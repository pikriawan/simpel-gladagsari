const API_BASE = "/api";
const SESSION_KEY = "simpel.session";
const writeQueues = new Map();

export function getSessionToken() {
  return null;
}

export function setSessionToken() {
  localStorage.removeItem(SESSION_KEY);
}

async function getCsrfToken() {
  const response = await fetch(`${API_BASE}/csrf`, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.token) throw new Error("Gagal menyiapkan sesi keamanan.");
  return result.token;
}

export async function request(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    headers["X-CSRF-TOKEN"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validationMessage = Object.values(result.errors || {}).flat()[0];
    const error = new Error(result.error || validationMessage || result.message || `Permintaan gagal (${response.status}).`);
    error.status = response.status;
    throw error;
  }
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
