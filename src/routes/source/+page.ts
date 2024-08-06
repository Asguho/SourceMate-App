import { getSource } from "$lib/scripts/utils";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { SvelteURL } from "svelte/reactivity";
import { BACKEND_URL } from "$lib/constants";

export const load = (async ({ params, url, fetch }) => {
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
	const sourceData = await (await fetch(`${BACKEND_URL}/api/source?url=${sourceUrl.href}`)).json();

	return { sourceUrl, sourceData };
}) satisfies PageLoad;
