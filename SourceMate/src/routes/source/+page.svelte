<script lang="ts">
    import type { PageData } from './$types';
    import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
    import InputField from '../../lib/components/InputField.svelte';
    import { SvelteURL, SvelteDate } from 'svelte/reactivity';

    const { data } = $props()
    const { sourceUrl, sourceData } = data


    
    // let url = $url()
</script>



<div class="grid grid-cols-2 min-h-screen">
    <div class="flex justify-center items-center">
        {#await sourceData}
            <p>loading...</p>
        {:then _source} 
            <div class="form-control">
                <div>
                    <InputField name="Title" type="text" value="test title"/>
                    <InputField name="Author" type="text" />
                    <InputField name="Date" type="date" />
                    <InputField name="Url" type="text" />
                    <InputField name="Website" type="text" disabled={true} />
                    <InputField name="Date added" type="date" disabled={true}/>
                </div>
            <input type="button" value="Add to Word" class="btn lg:btn-lg btn-primary">
            </div>
        
            {:catch error}
            <p>error: {error}</p>
        {/await}
    </div>
</div>
        
<div>
    <div class="bg-gray-500 ">
        <iframe src={sourceUrl} frameborder="0" title="Url viewer" class=" w-full   min-h-screen"></iframe>
    </div>
</div>
