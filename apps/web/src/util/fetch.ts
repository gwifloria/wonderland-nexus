export function fetcherFactory(method: "GET" | "POST" | "PUT" | "DELETE") {
  return async <T>(url: string, { arg }: { arg?: any }): Promise<T> => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: arg ? JSON.stringify(arg) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "请求失败");
    }
    return res.json();
  };
}

// 用法
export const postFetcher = fetcherFactory("POST");
export const putFetcher = fetcherFactory("PUT");
export const deleteFetcher = fetcherFactory("DELETE");
