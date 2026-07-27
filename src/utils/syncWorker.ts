/**
 * Background Sync Worker Utility for Brontolano POS
 * 
 * Features:
 * - Persistent sync queue in localStorage across browser reloads
 * - Background recurring async polling & online/focus auto-triggering
 * - Automatic exponential retry logic for failed transactions, products & receipt uploads
 * - Event-driven state subscription for UI status updates
 */

export type SyncItemType = "transaction" | "product" | "settings" | "receipt" | "customer";

export type SyncItemStatus = "pending" | "syncing" | "failed" | "success";

export interface SyncItem {
  id: string;
  type: SyncItemType;
  payload: any;
  status: SyncItemStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  lastAttemptAt: string | null;
  error?: string | null;
}

export interface SyncWorkerState {
  queue: SyncItem[];
  isProcessing: boolean;
  lastSyncTime: string | null;
  totalSynced: number;
  totalFailed: number;
  isOnline: boolean;
}

type SyncStateListener = (state: SyncWorkerState) => void;

const STORAGE_KEY = "brontolano_sync_queue_v2";
const METRICS_KEY = "brontolano_sync_metrics_v2";
const DEFAULT_INTERVAL_MS = 15000; // 15 seconds auto background poll

class SyncWorker {
  private static instance: SyncWorker;
  private queue: SyncItem[] = [];
  private isProcessing = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<SyncStateListener> = new Set();
  private webAppUrl: string = "";
  private lastSyncTime: string | null = null;
  private totalSynced = 0;
  private totalFailed = 0;
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;

  private constructor() {
    this.loadFromStorage();
    this.setupNetworkAndLifecycleListeners();
  }

  public static getInstance(): SyncWorker {
    if (!SyncWorker.instance) {
      SyncWorker.instance = new SyncWorker();
    }
    return SyncWorker.instance;
  }

  /**
   * Set Google Apps Script Web App URL if available
   */
  public setWebAppUrl(url: string) {
    this.webAppUrl = url;
  }

  /**
   * Load saved sync queue & metrics from localStorage
   */
  private loadFromStorage() {
    try {
      const savedQueue = localStorage.getItem(STORAGE_KEY);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        // Reset any leftover "syncing" state back to "pending" on load
        this.queue = this.queue.map((item) => ({
          ...item,
          status: item.status === "syncing" ? "pending" : item.status
        }));
      }
    } catch (e) {
      console.warn("Gagal membaca sync queue dari storage:", e);
      this.queue = [];
    }

    try {
      const savedMetrics = localStorage.getItem(METRICS_KEY);
      if (savedMetrics) {
        const parsed = JSON.parse(savedMetrics);
        this.lastSyncTime = parsed.lastSyncTime || null;
        this.totalSynced = parsed.totalSynced || 0;
        this.totalFailed = parsed.totalFailed || 0;
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Save sync queue & metrics to localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      localStorage.setItem(
        METRICS_KEY,
        JSON.stringify({
          lastSyncTime: this.lastSyncTime,
          totalSynced: this.totalSynced,
          totalFailed: this.totalFailed
        })
      );
    } catch (e) {
      console.error("Gagal menyimpan sync queue ke storage:", e);
    }
  }

  /**
   * Listen to browser online/offline & visibility events
   */
  private setupNetworkAndLifecycleListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      console.log("[SyncWorker] Koneksi internet kembali online. Memproses antrean...");
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners();
      console.warn("[SyncWorker] Koneksi terputus. Mode offline aktif.");
    });

    window.addEventListener("focus", () => {
      if (this.hasPendingOrFailedItems()) {
        this.processQueue();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.hasPendingOrFailedItems()) {
        this.processQueue();
      }
    });
  }

  /**
   * Add a new item to the background sync queue
   */
  public addToQueue(
    type: SyncItemType,
    payload: any,
    maxAttempts = 5
  ): SyncItem {
    const newItem: SyncItem = {
      id: `sync-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      status: "pending",
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      error: null
    };

    // Avoid exact duplicate transactions if already in queue
    if (type === "transaction" && payload?.id) {
      const existing = this.queue.find(
        (i) => i.type === "transaction" && i.payload?.id === payload.id
      );
      if (existing) {
        existing.status = "pending";
        existing.attempts = 0;
        this.saveToStorage();
        this.notifyListeners();
        this.processQueue();
        return existing;
      }
    }

    this.queue.push(newItem);
    this.saveToStorage();
    this.notifyListeners();

    // Trigger process immediately if online
    this.processQueue();
    return newItem;
  }

  /**
   * Start recurring background auto sync interval
   */
  public startAutoSync(webAppUrl?: string, intervalMs = DEFAULT_INTERVAL_MS) {
    if (webAppUrl) this.webAppUrl = webAppUrl;

    if (this.timerId) {
      clearInterval(this.timerId);
    }

    // Run initial check
    this.processQueue();

    this.timerId = setInterval(() => {
      this.processQueue();
    }, intervalMs);
  }

  /**
   * Stop auto sync timer
   */
  public stopAutoSync() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Check if there are items needing sync
   */
  public hasPendingOrFailedItems(): boolean {
    return this.queue.some(
      (item) => item.status === "pending" || (item.status === "failed" && item.attempts < item.maxAttempts)
    );
  }

  /**
   * Main Queue Processor with retry logic
   */
  public async processQueue(overrideUrl?: string): Promise<{ successCount: number; failureCount: number }> {
    if (this.isProcessing || !this.isOnline) {
      return { successCount: 0, failureCount: 0 };
    }

    const targetUrl = overrideUrl || this.webAppUrl;
    const pendingItems = this.queue.filter(
      (item) =>
        item.status === "pending" ||
        (item.status === "failed" && item.attempts < item.maxAttempts)
    );

    if (pendingItems.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    this.isProcessing = true;
    this.notifyListeners();

    let successCount = 0;
    let failureCount = 0;

    for (const item of pendingItems) {
      item.status = "syncing";
      item.attempts += 1;
      item.lastAttemptAt = new Date().toISOString();
      this.notifyListeners();

      try {
        let isSuccess = false;
        let errorMessage = "";

        if (item.type === "transaction" || item.type === "receipt") {
          // Sync transaction to local server and Google Sheets
          const response = await fetch("/api/sheets/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              webAppUrl: targetUrl,
              action: "saveTransaction",
              transactions: Array.isArray(item.payload) ? item.payload : [item.payload]
            })
          });

          if (response.ok) {
            isSuccess = true;
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } else if (item.type === "product") {
          // Sync product to Express server
          const localRes = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload)
          });

          if (localRes.ok) {
            isSuccess = true;
            // Also sync to Google Sheets if targetUrl is set
            if (targetUrl) {
              fetch("/api/sheets/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  webAppUrl: targetUrl,
                  action: "syncProducts",
                  products: Array.isArray(item.payload) ? item.payload : [item.payload]
                })
              }).catch((e) => console.warn("[SyncWorker] Gagal sync produk ke Sheets:", e));
            }
          } else {
            errorMessage = `HTTP ${localRes.status}`;
          }
        } else if (item.type === "settings") {
          const localRes = await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload)
          });

          if (localRes.ok) {
            isSuccess = true;
            if (targetUrl) {
              fetch("/api/sheets/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  webAppUrl: targetUrl,
                  action: "syncSettings",
                  settings: item.payload
                })
              }).catch((e) => console.warn("[SyncWorker] Gagal sync settings ke Sheets:", e));
            }
          } else {
            errorMessage = `HTTP ${localRes.status}`;
          }
        } else if (item.type === "customer") {
          const localRes = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload)
          });

          if (localRes.ok) {
            isSuccess = true;
            if (targetUrl) {
              fetch("/api/sheets/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  webAppUrl: targetUrl,
                  action: "syncCustomers",
                  customers: Array.isArray(item.payload) ? item.payload : [item.payload]
                })
              }).catch((e) => console.warn("[SyncWorker] Gagal sync customer ke Sheets:", e));
            }
          } else {
            errorMessage = `HTTP ${localRes.status}`;
          }
        }

        if (isSuccess) {
          item.status = "success";
          item.error = null;
          successCount++;
          this.totalSynced++;
          this.lastSyncTime = new Date().toISOString();
        } else {
          item.status = "failed";
          item.error = errorMessage || "Gagal melakukan sinkronisasi data ke cloud";
          failureCount++;
          this.totalFailed++;
        }
      } catch (err: any) {
        item.status = "failed";
        item.error = err?.message || "Kesalahan jaringan / koneksi server";
        failureCount++;
        this.totalFailed++;
      }

      this.saveToStorage();
      this.notifyListeners();
    }

    // Clean up successfully synced items older than 2 minutes to keep queue concise
    const cutoff = Date.now() - 2 * 60 * 1000;
    this.queue = this.queue.filter(
      (item) => item.status !== "success" || new Date(item.lastAttemptAt || 0).getTime() > cutoff
    );

    this.isProcessing = false;
    this.saveToStorage();
    this.notifyListeners();

    return { successCount, failureCount };
  }

  /**
   * Retry all failed queue items immediately
   */
  public retryFailed() {
    this.queue.forEach((item) => {
      if (item.status === "failed") {
        item.status = "pending";
        item.attempts = 0;
      }
    });
    this.saveToStorage();
    this.notifyListeners();
    this.processQueue();
  }

  /**
   * Clear the entire sync queue
   */
  public clearQueue() {
    this.queue = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Remove a single queue item
   */
  public removeItem(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get current state snapshot
   */
  public getState(): SyncWorkerState {
    return {
      queue: [...this.queue],
      isProcessing: this.isProcessing,
      lastSyncTime: this.lastSyncTime,
      totalSynced: this.totalSynced,
      totalFailed: this.totalFailed,
      isOnline: this.isOnline
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    // Notify subscriber immediately with current state
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error("Error in sync listener:", e);
      }
    });
  }
}

export const syncWorker = SyncWorker.getInstance();
