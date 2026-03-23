const BASE = '/api';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data;
}

async function requestText(url: string): Promise<string> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data as string;
}

export const api = {
  prototypes: {
    list: () => request<any[]>('/prototypes'),
    get: (id: string) => request<any>(`/prototypes/${id}`),
    create: (body: { name: string; description?: string }) =>
      request<any>('/prototypes', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<any>(`/prototypes/${id}`, { method: 'DELETE' }),
  },
  groups: {
    list: (protoId: string) => request<any[]>(`/prototypes/${protoId}/groups`),
    get: (protoId: string, groupId: string) =>
      request<any>(`/prototypes/${protoId}/groups/${groupId}`),
    create: (protoId: string, body: { name: string; description?: string }) =>
      request<any>(`/prototypes/${protoId}/groups`, { method: 'POST', body: JSON.stringify(body) }),
    update: (protoId: string, groupId: string, body: Record<string, unknown>) =>
      request<any>(`/prototypes/${protoId}/groups/${groupId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (protoId: string, groupId: string) =>
      request<any>(`/prototypes/${protoId}/groups/${groupId}`, { method: 'DELETE' }),
    versions: (protoId: string, groupId: string) =>
      request<any[]>(`/prototypes/${protoId}/groups/${groupId}/versions`),
  },
  versions: {
    list: (protoId: string, tag?: string) =>
      request<any[]>(`/prototypes/${protoId}/versions${tag ? `?tag=${tag}` : ''}`),
    get: (protoId: string, versionId: string) =>
      request<any>(`/prototypes/${protoId}/versions/${versionId}`),
    create: (protoId: string, body: { name: string; groupId: string; category?: string; description?: string; tags?: string[] }) =>
      request<any>(`/prototypes/${protoId}/versions`, { method: 'POST', body: JSON.stringify(body) }),
    update: (protoId: string, versionId: string, body: Record<string, unknown>) =>
      request<any>(`/prototypes/${protoId}/versions/${versionId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (protoId: string, versionId: string) =>
      request<any>(`/prototypes/${protoId}/versions/${versionId}`, { method: 'DELETE' }),
    restore: (protoId: string, versionId: string) =>
      request<any>(`/prototypes/${protoId}/versions/${versionId}/restore`, { method: 'POST' }),
    previewUrl: (protoId: string, versionId: string) =>
      `${BASE}/prototypes/${protoId}/versions/${versionId}/preview`,
  },
  context: {
    get: () => requestText('/context'),
    set: (text: string) =>
      request<any>('/context', { method: 'PUT', body: JSON.stringify({ text }) }),
  },
  briefs: {
    get: (protoId: string, groupId: string) =>
      requestText(`/prototypes/${protoId}/groups/${groupId}/brief`),
    set: (protoId: string, groupId: string, text: string) =>
      request<any>(`/prototypes/${protoId}/groups/${groupId}/brief`, {
        method: 'PUT',
        body: JSON.stringify({ text }),
      }),
  },
  ai: {
    exportMarkdown: (groupId?: string) =>
      requestText(`/export${groupId ? `?group=${groupId}` : ''}`),
  },
};
