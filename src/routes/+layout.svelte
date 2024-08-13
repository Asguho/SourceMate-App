<script>
import { goto, invalidate } from "$app/navigation";
import { onMount } from "svelte";
import "../app.css";

let { data: propData, children } = $props();
const { session, supabase } = propData;

onMount(() => {
	if (!session) {
		goto("/auth/login");
	}
});
import posthog from "posthog-js";
import { browser } from "$app/environment";
import { beforeNavigate, afterNavigate } from "$app/navigation";

$effect(() => {
	const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
		if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && newSession?.user?.id) {
			posthog.identify(newSession.user.id, {
				email: newSession.user.email,
			});
		}
		if (event === "SIGNED_OUT") {
			posthog.reset();
		}
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate("supabase:auth");
		}
	});

	return () => data.subscription.unsubscribe();
});

if (browser) {
	beforeNavigate(() => posthog.capture("$pageleave"));
	afterNavigate(() => posthog.capture("$pageview"));
}
</script>

{@render children()}