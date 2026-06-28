const graphBaseUrl = "https://graph.microsoft.com/v1.0";

export type GraphClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  putContent<T>(path: string, content: ArrayBuffer): Promise<T>;
  getContent(path: string): Promise<ArrayBuffer>;
};

export function createGraphClient(): GraphClient {
  return {
    get: (path) => graphRequest(path, { method: "GET" }),
    post: (path, body) => graphRequest(path, { method: "POST", body: JSON.stringify(body) }),
    patch: (path, body) => graphRequest(path, { method: "PATCH", body: JSON.stringify(body) }),
    putContent: (path, content) => graphRequest(path, { method: "PUT", body: Buffer.from(content) }),
    getContent: async (path) => {
      const response = await graphFetch(path, { method: "GET" });

      return response.arrayBuffer();
    },
  };
}

export function encodeDrivePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function graphRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await graphFetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function graphFetch(path: string, init: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("https://") ? path : `${graphBaseUrl}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Graph request failed ${response.status} ${response.statusText}: ${body}`);
  }

  return response;
}

async function getAccessToken(): Promise<string> {
  const tenant = process.env.ENTRAID_TENANT ?? "wellsfordau.onmicrosoft.com";
  const clientId = process.env.ENTRAID_CLIENT_ID ?? "cef55eda-5c50-43a7-9d57-e7317e2c360f";
  const clientSecret = process.env.ENTRAID_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("ENTRAID_CLIENT_SECRET is required for SharePoint provisioning.");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token request failed ${response.status}: ${await response.text()}`);
  }

  const token = (await response.json()) as { access_token: string };

  return token.access_token;
}
