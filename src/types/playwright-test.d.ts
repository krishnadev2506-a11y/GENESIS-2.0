declare module '@playwright/test' {
  export interface APIResponse {
    status(): number;
  }

  export interface APIRequestContext {
    get(url: string): Promise<APIResponse>;
  }

  export interface Locator {
    toBeVisible(): Promise<void>;
  }

  export interface Page {
    goto(url: string): Promise<void>;
    locator(selector: string): Locator;
    textContent(selector: string): Promise<string | null>;
  }

  export interface TestArgs {
    request: APIRequestContext;
    page: Page;
  }

  type TestCallback = (args: TestArgs) => void | Promise<void>;

  export interface TestAPI {
    (name: string, callback: TestCallback): void;
    describe(name: string, callback: () => void): void;
  }

  export const test: TestAPI;

  export const expect: any;
}
