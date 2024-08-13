<script>
import { invalidate } from "$app/navigation";
import { onMount } from "svelte";
import "../app.css";

let { data: propData, children } = $props();
const { session, supabase } = propData;

$effect(() => {
	const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
		if (newSession?.expires_at !== session?.expires_at) {
			invalidate("supabase:auth");
		}
	});

	return () => data.subscription.unsubscribe();
});
</script>

{@render children()}