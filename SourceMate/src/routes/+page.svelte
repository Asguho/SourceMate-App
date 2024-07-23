<script lang="ts">
  import { enhance } from "$app/forms";

  let url = $state("");

</script>
<div class="flex justify-center items-center min-h-screen">
  <div class="">
    <h1 class="font-extrabold text-4xl tracking-tight mb-4">Enter a url you want to add!</h1>
    <form class="grid grid-cols-3" method="get" action="/source" >
      <!-- use:enhance -->
      <input type="text" name="url" class="input input-bordered col-span-2" bind:value={url}>
      <button type="submit" class="btn ml-2">Crawl Source</button>
      <!-- href="source?source={url}" -->
    </form>
  </div>
</div>
