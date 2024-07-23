import { getSource } from "$lib/scripts/utils";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({params, url, fetch}) => {
    const sourceUrl = url.searchParams.get("url")
    if(!sourceUrl){
        redirect(300, "/")
    }
    
    return { sourceUrl, sourceData: "test"/*getSource(sourceUrl)*/ };
}) satisfies PageLoad;
