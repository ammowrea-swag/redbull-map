<script>
  let { number, label, footnote } = $props();
</script>

<div class="big-number">
  <span class="number">{number}</span>
  <span class="label">{label}</span>
  {#if footnote}
    <span class="footnote">{footnote}</span>
  {/if}
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .big-number {
    text-align: center;
    padding: var(--spacing-md);
    background-color: var(--color-gold);
    color: var(--color-dark-red);
    border-radius: var(--border-radius-sm);
    height: 100%;
  }

  .number {
    display: block;
    font-size: 2rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-dark-blue);
    line-height: var(--leading-heading);
  }

  .label {
    display: block;
    font-size: var(--font-size-base);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wider);
    margin-top: var(--spacing-xs);
  }

  .footnote {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--color-dark-red);
    margin-top: var(--spacing-xxs);
    font-style: italic;
  }

  @include mobile {
    .big-number {
      padding: var(--spacing-sm);
    }

    .number {
      font-size: var(--font-size-5xl);
    }
  }
</style>
