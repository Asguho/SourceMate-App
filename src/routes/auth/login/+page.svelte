<script lang="ts">
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
		// headers: {
		// 	"Content-Type": "application/json",
		// },
		body: JSON.stringify(authInfo),
	});
	if (!res.ok) {
		alert("Login request failed");
		return;
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