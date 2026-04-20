type SharedSocketStatus = "connected" | "connecting" | "disconnected" | "error";

type Subscriber = {
  onMessage?: (event: MessageEvent<string>) => void;
  onStatus?: (status: SharedSocketStatus) => void;
};

type SharedSocket = {
  closeTimer: ReturnType<typeof setTimeout> | null;
  refCount: number;
  socket: WebSocket;
  status: SharedSocketStatus;
  subscribers: Set<Subscriber>;
  url: string;
};

const CLOSE_GRACE_PERIOD_MS = 1_500;
const sharedSockets = new Map<string, SharedSocket>();

function notifyStatus(shared: SharedSocket) {
  shared.subscribers.forEach((subscriber) => {
    subscriber.onStatus?.(shared.status);
  });
}

function createSharedSocket(url: string): SharedSocket {
  const socket = new WebSocket(url);
  const shared: SharedSocket = {
    closeTimer: null,
    refCount: 0,
    socket,
    status: "connecting",
    subscribers: new Set(),
    url,
  };

  socket.onopen = () => {
    shared.status = "connected";
    notifyStatus(shared);
  };

  socket.onmessage = (event) => {
    shared.subscribers.forEach((subscriber) => {
      subscriber.onMessage?.(event);
    });
  };

  socket.onerror = () => {
    shared.status = "error";
    notifyStatus(shared);
  };

  socket.onclose = () => {
    shared.status = "disconnected";
    notifyStatus(shared);
    if (shared.refCount === 0 && sharedSockets.get(url) === shared) {
      sharedSockets.delete(url);
    }
  };

  return shared;
}

function getOrCreateSharedSocket(url: string): SharedSocket {
  const existing = sharedSockets.get(url);
  if (existing) {
    if (existing.closeTimer !== null) {
      clearTimeout(existing.closeTimer);
      existing.closeTimer = null;
    }
    return existing;
  }

  const shared = createSharedSocket(url);
  sharedSockets.set(url, shared);
  return shared;
}

export function getContractSocketStatus(url: string): SharedSocketStatus | null {
  return sharedSockets.get(url)?.status ?? null;
}

export function subscribeToContractSocket(url: string, subscriber: Subscriber): () => void {
  const shared = getOrCreateSharedSocket(url);
  shared.refCount += 1;
  shared.subscribers.add(subscriber);
  subscriber.onStatus?.(shared.status);

  return () => {
    shared.subscribers.delete(subscriber);
    shared.refCount = Math.max(0, shared.refCount - 1);

    if (shared.refCount > 0 || shared.closeTimer !== null) {
      return;
    }

    shared.closeTimer = setTimeout(() => {
      shared.closeTimer = null;
      if (shared.refCount > 0) {
        return;
      }
      if (sharedSockets.get(url) === shared) {
        sharedSockets.delete(url);
      }
      shared.socket.close();
    }, CLOSE_GRACE_PERIOD_MS);
  };
}
