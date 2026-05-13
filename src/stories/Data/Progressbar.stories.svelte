
<script>
  let { value = 0, label = 'Progress' } = $props();

  // Clamp value between 0 and 100
  const clampedValue = $derived(Math.max(0, Math.min(100, value)));
</script>

<div class="progressbar-container">
  <div class="progressbar-track">
    <div class="progressbar-fill" style="width: {clampedValue}%"></div>
  </div>
  <div class="progressbar-label">{label}</div>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .progressbar-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .progressbar-track {
    width: 100%;
    height: 24px;
    background-color: var(--color-dark-blue);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
  }

  .progressbar-fill {
    height: 100%;
    background-color: var(--color-dark-red);
    transition: width 0.3s ease-out;
  }

  .progressbar-label {
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm, 4px);
    text-align: center;
  }

  @include mobile {
    .progressbar-track {
      height: 20px;
    }

    .progressbar-label {
      font-size: var(--font-size-xs, 0.75rem);
    }
  }

</style>