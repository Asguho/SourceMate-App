<script lang="ts">
    import type { PageData } from './$types';
    import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
    
    export let data: PageData;

    readTextFile('AppData\\Roaming\\Microsoft\\Bibliography\\Sources.xml', { baseDir: BaseDirectory.Home}).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.error(error);
    }); 
</script>

