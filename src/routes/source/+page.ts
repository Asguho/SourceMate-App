import { getSource } from "$lib/scripts/utils";
import { error, redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { SvelteURL } from "svelte/reactivity";
import { BACKEND_URL } from "$lib/constants";
import { SOURCE_SCHEMA } from "$lib/scripts/sourceSchema";

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
	const sourceData = fetch(`${BACKEND_URL}/api/source?url=${sourceUrl.href}`)
		.then((res) => {
			if (res.ok) return res.json();
			error(503, {
				message: "Failed to fetch source data",
			});
		})
		.then((data) => {
			console.log(data);
			return SOURCE_SCHEMA.parse(data);
		});

	return { sourceUrl, sourceData };
}) satisfies PageLoad;
