import { contextBridge, shell } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  counter: (count: number) => {
    return count + 1;
  },

  openExternal: (url) => {
    shell.openExternal(url);
    return null;
  },
});
