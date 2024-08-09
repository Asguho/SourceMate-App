<script lang="ts">
import BackButton from "$lib/components/BackButton.svelte";
import type { Source } from "$lib/scripts/sourceSchema";
import { writeToWord } from "$lib/scripts/utils";

const { data } = $props();
const { sourceUrl, sourceData } = data;
let source: Source["source"] | null = $state(null);
let errorMessage = $state(undefined);

sourceData
	.then((data) => {
		source = data.source;
	})
	.catch((error) => {
		errorMessage = error;
	});

$inspect(sourceData);
</script>

<BackButton />

<div class="grid grid-cols-2 min-h-screen">
    <div class="flex justify-center items-center ">
         {#if errorMessage}
            <div>
                <h1 class="font-bold text-3xl">Error</h1>
                {#if errorMessage?.message == "Failed to fetch"}
                    <p>Please check your internet connection</p>
                {:else}
                    <p>{errorMessage}</p>
                {/if}                
            </div>
        {:else if !source}
            <span class="loading loading-spinner mr-4 bg-primary"></span>
            <p> Loading...</p>
        {:else} 
            <div class="form-control lg:max-w-[30rem] max-w-64 ">
                <div>
                    <label for="title" class="label">Title</label>
                    <input class="input input-bordered w-full" name="Title" type="text" id="title" bind:value={source.title}/>
                    <label for="">Authors</label>
                    <div class="flex gap-2">
                        <label class="w-full text-opacity-40 text-sm" for="">First Name</label>
                        <label class="w-full text-opacity-40 text-sm" for="">Middle Name</label>
                        <label class="w-full text-opacity-40 text-sm" for="">Last Name</label>
                    </div>
                    <div class="flex flex-col gap-2">
                        {#each source.authorObject.people as author}
                            <div class="flex gap-2">
                                <input class="input input-bordered w-full line-clamp-1" name="Author" type="text" bind:value={author.firstName} />                        
                                <input class="input input-bordered w-full line-clamp-1" name="Author" type="text" bind:value={author.middleName} />                        
                                <input class="input input-bordered w-full line-clamp-1" name="Author" type="text" bind:value={author.lastName} />                        
                            </div>
                        {/each}
                    </div>
                    <label class="" for="">Corprate Author</label>
                    <input class="input input-bordered w-full" name="Corprate Author" type="text" bind:value={source.authorObject.corporate}/>
                    <label class="" for="">Date</label>
                    <input class="input input-bordered w-full" name="Date" type="date" bind:value={source.date}/>
                    <label class="" for="">Url</label>
                    <input class="input input-bordered w-full" name="Url" type="text" bind:value={sourceUrl.href} />
                    <label class="" for="">Sitename</label>
                    <input class="input input-bordered w-full" name="Website" type="text" disabled={true} value={sourceUrl.hostname}/>
                    <label class="" for="">Current Date</label>
                    <input class="input input-bordered w-full" name="Date added" type="date" disabled={true} value={new Date().toISOString().substring(0, 10)}/>
                </div>
                <input type="button" value="Add to Word" class="btn mt-16  btn-primary" onclick={()=>{
                    //@ts-ignore 
                    writeToWord(source,sourceUrl);}}>
            </div>
       {/if}
    </div>
        
    <div>
        <div class="bg-gray-500 ">
            <iframe src={sourceUrl.toString()} frameborder="0" title="Url viewer" class=" w-full min-h-screen" onload={()=>{console.log("iframe Loaded")}}></iframe>
        </div>
    </div>
</div>
