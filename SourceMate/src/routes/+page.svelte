<script lang="ts">
  let url = $state("");

</script>

<input type="text" bind:value={url}>
<a href="source?source={url}">Crawl Source</a>