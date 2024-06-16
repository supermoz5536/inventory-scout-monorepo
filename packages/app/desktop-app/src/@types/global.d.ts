export declare global {
  interface Window {
    myAPI: {
      counter: (count: number) => number;
      openExternal: (url: string) => void | null;
    };
  }
}
