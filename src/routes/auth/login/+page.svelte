<script lang="ts">
import { goto } from "$app/navigation";
import { BACKEND_URL } from "$lib/constants";
import type { PageData } from "./$types";

let { data: propData } = $props();

const { session, supabase } = propData;
let authInfo = $state({
	email: "",
	password: "",
});

let errorMessage = $state("");

async function login() {
	// const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
	// 	method: "POST",
	// 	body: JSON.stringify(authInfo),
	// });
	// if (res.ok) {
	// 	console.log(await fetch(`${BACKEND_URL}/api/auth/check`).then((res) => res.json()));
	// }
	// const data = (await res.json()) as unknown;

	// console.log(data);
	const { data, error } = await supabase.auth.signInWithPassword({
		email: authInfo.email,
		password: authInfo.password,
	});
	if (error) {
		errorMessage = error.message;
		console.log(error);
	} else {
		console.log(data);
		goto("/");
	}
}
</script>


<div class="flex justify-center items-center  min-h-screen">
	<div class=" form-control  max-w-64 gap-8">
		<h1 class="text-2xl font-bold">Login</h1>
		{#if errorMessage}
			<p class="text-red-500">{errorMessage}</p>
		{/if}
		<label class=" label-text">
			Email
			<input name="email" type="email"  class=" input  input-bordered w-full" bind:value={authInfo.email}/>
		</label>
		<label class=" label-text">
			Password
			<input name="password" type="password"  class=" input  input-bordered w-full" bind:value={authInfo.password}/>
		</label>
		<button class="btn w-full" onclick={login}>Login</button>
	</div>
</div>