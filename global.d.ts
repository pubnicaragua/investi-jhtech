declare const global: typeof globalThis & {
  crypto?: {
    subtle?: any;
    getRandomValues?: (array: Uint8Array) => Uint8Array;
  };
  msCrypto?: any;
  process?: {
    env: { [key: string]: string | undefined };
    browser?: boolean;
  };
};
