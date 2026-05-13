<script>
  let { text = '', href = '' } = $props();
</script>

{#if text}
  <p class="dek">
    {#if href}
      <a {href}>{text}</a>
    {:else}
      {text}
    {/if}
  </p>
{/if}

<style>
    .dek {
        font-family: var(--font-serif);
        font-size: var(--font-size-md);
        line-height: var(--leading-relaxed);
        color: var(--color-dark);
        margin: 0 0 var(--spacing-md);
        justify-content: center;
        display: flex;
    }
</style>