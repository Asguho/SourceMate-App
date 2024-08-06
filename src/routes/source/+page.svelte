<script lang="ts">
import type { PageData } from "./$types";
import { readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import InputField from "../../lib/components/InputField.svelte";
import { SvelteURL, SvelteDate } from "svelte/reactivity";
import BackButton from "$lib/components/BackButton.svelte";

const { data } = $props();
const { sourceUrl, sourceData } = data;

$inspect(sourceData);

// let url = $url()
</script>


<BackButton></BackButton>

<div class="grid grid-cols-2 min-h-screen">
    <div class="flex justify-center items-center">
        {#await sourceData}
        <span class="loading loading-spinner"></span>
            <p>loading...</p>
        {:then _source} 
            <div class="form-control">
                <div>
                    <InputField name="Title" type="text" value="test title"/>
                    <InputField name="Author" type="text" />
                    <InputField name="Date" type="date" />
                    <InputField name="Url" type="text" value={sourceUrl.toString()} />
                    <InputField name="Website" type="text" disabled={true} value={sourceUrl.hostname}/>
                    <InputField name="Date added" type="date" disabled={true} value={new Date().toISOString().substring(0, 10)}/>
                </div>
                <input type="button" value="Add to Word" class="btn lg:btn-lg btn-primary">
            </div>
        {:catch error}
            <h1 class="font-bold text-3xl">Error</h1>
            <p>{error}</p>
        {/await}
    </div>
        
<div>
    <div class="bg-gray-500 ">
        <iframe src={sourceUrl.toString()} frameborder="0" title="Url viewer" class=" w-full min-h-screen" on:load={console.log("iframeLoaded")}></iframe>
    </div>
</div>
</div>
