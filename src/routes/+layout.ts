// Tauri doesn't have a Node.js server to do proper SSR
// so we will use adapter-static to prerender the app (SSG)
// See: https://beta.tauri.app/start/frontend/sveltekit/ for more info
export const prerender = true;
export const ssr = false;

// supabase
import { createBrowserClient, createServerClient, isBrowser } from "@supabase/ssr";
import type { LayoutLoad } from "./$types";
const PUBLIC_SUPABASE_URL = "https://fqxzqrgvpboemjpafdph.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHpxcmd2cGJvZW1qcGFmZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5ODU0MzEsImV4cCI6MjAzNzU2MTQzMX0.D__MYtyLHcubX3SM7b1yI1OB6EVj6i0lgpGz2CY6dFU";
import posthog from "posthog-js";
import { browser, dev } from "$app/environment";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	if (browser && !dev) {
		posthog.init("phc_TZ3VvRPdepiOSi0OufNenNrLpmjJHZLnhIyZSiUavHu", {
			api_host: "https://eu.i.posthog.com",
			capture_pageview: false,
			capture_pageleave: false,
			name: "sourcemate-website",
		});
	}

	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends("supabase:auth");

	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch,
		},
	});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session },
	} = await supabase.auth.getSession();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { session, supabase, user };
};
