import { PublicClientApplication } from "@azure/msal-node";
import fetch from "node-fetch";

const MSAL_CONFIG = {
  auth: {
    clientId: process.env.MS_CLIENT_ID || "",
    authority:
      process.env.MS_AUTHORITY || "https://login.microsoftonline.com/consumers",
  },
};

const SCOPES = ["User.Read", "Mail.Read", "offline_access"];
const TARGET_EMAIL = process.env.TARGET_EMAIL || "";
const FILTER_FLAGGED_ONLY = process.env.FILTER_FLAGGED === "true";

const pca = new PublicClientApplication(MSAL_CONFIG);

export async function getToken(): Promise<string> {
  const accs = await pca.getTokenCache().getAllAccounts();
  if (accs.length) {
    try {
      const result = await pca.acquireTokenSilent({
        account: accs[0],
        scopes: SCOPES,
      });
      return result.accessToken;
    } catch (_) {
      // Fall through to device code flow
    }
  }
  const res = await pca.acquireTokenByDeviceCode({
    scopes: SCOPES,
    deviceCodeCallback: (i) => console.log(i.message),
  });
  if (!res) throw new Error("Failed to acquire token");
  return res.accessToken;
}

async function graphGetAll(
  url: string,
  token: string,
  extraHeaders: Record<string, string> = {}
): Promise<any[]> {
  let items: any[] = [];
  let currentUrl: string | null = url;

  while (currentUrl) {
    const r = await fetch(currentUrl, {
      headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
    });
    if (!r.ok) throw new Error(`Graph error ${r.status}: ${await r.text()}`);
    const data = (await r.json()) as any;
    items = items.concat(data.value || []);
    currentUrl = data["@odata.nextLink"] || null;
  }
  return items;
}

export function getAddresses(arr: any[] = []): string[] {
  return arr
    .map((x) => x?.emailAddress?.address?.toLowerCase())
    .filter(Boolean) as string[];
}

function matchesTarget(m: any, email: string): boolean {
  if (!email) return true;
  const t = email.toLowerCase();
  const from = m.from?.emailAddress?.address?.toLowerCase();
  const to = getAddresses(m.toRecipients || []);
  const cc = getAddresses(m.ccRecipients || []);
  return from === t || to.includes(t) || cc.includes(t);
}

export async function fetchMessagesByContact(
  token: string,
  email: string
): Promise<any[]> {
  const base = "https://graph.microsoft.com/v1.0/me";
  const select =
    "$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,sentDateTime,createdDateTime,conversationId,bodyPreview,body,flag,internetMessageId,internetMessageHeaders";
  const top = "$top=50";

  const contactFilter = email
    ? ` and (from/emailAddress/address eq '${email}' or toRecipients/any(r:r/emailAddress/address eq '${email}') or ccRecipients/any(r:r/emailAddress/address eq '${email}'))`
    : "";

  const fetchFolderMessages = async (
    folder: string,
    extraFilter: string
  ): Promise<any[]> => {
    const url = `${base}/mailFolders/${folder}/messages?${select}&${top}&$filter=${encodeURIComponent(
      extraFilter
    )}`;
    return graphGetAll(url, token);
  };

  const fetchConversationAll = async (
    conversationId: string
  ): Promise<any[]> => {
    const filter =
      `isDraft eq false and conversationId eq '${conversationId}'` +
      (email
        ? ` and (from/emailAddress/address eq '${email}' or toRecipients/any(r:r/emailAddress/address eq '${email}') or ccRecipients/any(r:r/emailAddress/address eq '${email}'))`
        : "");
    const [inbox, sent] = await Promise.all([
      fetchFolderMessages("Inbox", filter),
      fetchFolderMessages("SentItems", filter),
    ]);
    const map = new Map();
    [...inbox, ...sent].forEach((m) => map.set(m.id, m));
    return [...map.values()];
  };

  if (!FILTER_FLAGGED_ONLY) {
    const filter = `isDraft eq false${contactFilter}`;
    const url = `${base}/messages?${select}&${top}&$filter=${encodeURIComponent(
      filter
    )}`;
    const raw = await graphGetAll(url, token);
    const out = raw.filter((m) => matchesTarget(m, email));
    out.sort((a, b) => {
      const atA = new Date(
        a.sentDateTime || a.receivedDateTime || a.createdDateTime || 0
      );
      const atB = new Date(
        b.sentDateTime || b.receivedDateTime || b.createdDateTime || 0
      );
      return +atA - +atB;
    });
    return out;
  }

  const flaggedFilter = `isDraft eq false and flag/flagStatus eq 'flagged'${contactFilter}`;
  const [flaggedInbox, flaggedSent] = await Promise.all([
    fetchFolderMessages("Inbox", flaggedFilter),
    fetchFolderMessages("SentItems", flaggedFilter),
  ]);
  const seeds = [...flaggedInbox, ...flaggedSent];
  if (!seeds.length) return [];

  const convIds = [
    ...new Set(seeds.map((m) => m.conversationId).filter(Boolean)),
  ];
  const expandedBatches = await Promise.all(
    convIds.map((id) => fetchConversationAll(id))
  );
  const expanded = expandedBatches.flat();

  const uniq = new Map();
  expanded.forEach((m) => uniq.set(m.id, m));
  const all = [...uniq.values()].filter((m) => matchesTarget(m, email));

  all.sort((a, b) => {
    const atA = new Date(
      a.sentDateTime || a.receivedDateTime || a.createdDateTime || 0
    );
    const atB = new Date(
      b.sentDateTime || b.receivedDateTime || b.createdDateTime || 0
    );
    return +atA - +atB;
  });

  return all;
}

export async function fetchAttachments(
  token: string,
  messageId: string
): Promise<any[]> {
  const url = `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`Failed to fetch attachments: ${r.status}`);
  const data = (await r.json()) as any;
  return data.value || [];
}
