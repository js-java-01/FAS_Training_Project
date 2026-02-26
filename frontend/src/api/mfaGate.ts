import type { AxiosRequestConfig } from "axios";

interface PendingRequest {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

class MfaGate {
  private pendingRequests: PendingRequest[] = [];
  private listeners: Array<() => void> = [];

  enqueue(config: AxiosRequestConfig): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ config, resolve, reject });

      if (this.pendingRequests.length === 1) {
        this.notifyListeners();
      }
    });
  }

  hasPendingRequests(): boolean {
    return this.pendingRequests.length > 0;
  }

  resolveAll(executeRequest: (config: AxiosRequestConfig) => Promise<unknown>): void {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    requests.forEach(({ config, resolve, reject }) => {
      executeRequest(config).then(resolve).catch(reject);
    });
  }

  rejectAll(error: Error): void {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    requests.forEach(({ reject }) => {
      reject(error);
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

const mfaGate = new MfaGate();

export default mfaGate;
