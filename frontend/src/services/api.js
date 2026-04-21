const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const ADMIN_KEY_STORAGE = "adminKey";
const ADMIN_KEY_VALUE = "govchain-admin";

export function getAdminKey() {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || "";
}

export function setAdminKey() {
  localStorage.setItem(ADMIN_KEY_STORAGE, ADMIN_KEY_VALUE);
  return ADMIN_KEY_VALUE;
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE) || "";
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "x-admin-key": adminKey,
      ...(options.headers ?? {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function getStatus() {
  return request("/status");
}

export function getRecords() {
  return request("/records");
}

export function getDocuments() {
  return request("/documents");
}

export function findDocumentByHash(hash) {
  return request(`/documents/hash/${encodeURIComponent(hash)}`);
}

export function uploadDocument(payload) {
  return request("/documents/upload", {
    method: "POST",
    body: payload instanceof FormData ? payload : JSON.stringify(payload)
  });
}

export function verifyDocument(id) {
  return request("/documents/verify", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}

export function rejectDocument(id) {
  return request("/documents/reject", {
    method: "POST",
    body: JSON.stringify({ id })
  });
}
