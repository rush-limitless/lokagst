import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cm.immostar.immogest",
  appName: "ImmoGest",
  webDir: "capacitor-app",
  server: {
    url: "https://lokagst.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
