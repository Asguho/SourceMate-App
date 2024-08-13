<script lang="ts">
import { goto } from "$app/navigation";
import { BACKEND_URL } from "$lib/constants";
import type { PageData } from "./$types";

let data = $props();

let authInfo = $state({
	email: "",
	password: "",
});

async function login() {
	const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
		method: "POST",
		body: JSON.stringify(authInfo),
	});
	if (res.ok) {
		console.log(await fetch(`${BACKEND_URL}/api/auth/check`).then((res) => res.json()));
	}
	const data = (await res.json()) as unknown;
	console.log(data);
}
</script>

<main>
    <h1>Login</h1>
    <form>
        <input type="text" placeholder="email" bind:value={authInfo.email} />
        <input type="password" placeholder="Password" bind:value={authInfo.password}/>
        <button type="submit" onclick={login}>Login</button>

    </form>
</main>