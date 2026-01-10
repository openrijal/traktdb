/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
        runtime: import("@astrojs/cloudflare").Runtime<any> & { env: any };
    }
}
