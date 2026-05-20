export interface DevMindOptions {
  apiKey: string;
  service: string;
  apiUrl?: string;
  debug?: boolean;
}

export interface CaptureResult {
  success: boolean;
  jira_key?: string;
  github_pr_url?: string;
}

export declare class DevMindSDK {
  init(options: DevMindOptions): void;
  capture(
    error: Error,
    route?: string,
    extra?: Record<string, any>,
  ): Promise<CaptureResult | undefined>;
  middleware(): (err: Error, req: any, res: any, next: any) => void;
  wrap<T extends (...args: any[]) => Promise<any>>(fn: T): T;
}

declare const DevMind: DevMindSDK;
export default DevMind;
export { DevMind };
