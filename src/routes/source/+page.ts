import { error, redirect, type LoadEvent } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { SvelteURL } from "svelte/reactivity";
import { BACKEND_URL } from "$lib/constants";
import { SOURCE_SCHEMA } from "$lib/scripts/sourceSchema";

export const load = (async ({ url, fetch, data }) => {
	const sourceUrlString = url.searchParams.get("url");
	if (!sourceUrlString) {
		redirect(300, "/");
	}
	let sourceUrl: SvelteURL;
	try {
		sourceUrl = new SvelteURL(sourceUrlString);
	} catch (_) {
		redirect(300, "/");
	}
	// if (!data) {
	// 	return;
	// }

	// 	const { data: supabaseData, error } = await data.supabase.auth.getSession();
	// 	console.log(supabaseData, error);

	// 	const sourceData = fetch(`${BACKEND_URL}/api/source?url=${sourceUrl.href}`)
	// 		.then((res) => {
	// 			if (res.ok) return res.json();
	// 			console.error("Fetching error", res);
	// 			error(503, {
	// 				message: "Failed to fetch source data",
	// 			});
	// 		})
	// 		.then((data) => {
	// 			console.log(data);
	// 			return SOURCE_SCHEMA.parse(data);
	// 		});

	return { sourceUrl };
}) satisfies PageLoad;
