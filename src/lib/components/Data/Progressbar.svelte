<script>
  let { value = 0, label = 'Progress' } = $props();

  // Clamp value between 0 and 100
  const clampedValue = $derived(Math.max(0, Math.min(100, value)));
</script>

<div class="progressbar-container">
  <div class="progressbar-track">
    <div class="progressbar-fill" style="width: {clampedValue}%"></div>
    <div class="progressbar-label">{label}</div>
  </div>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .progressbar-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .progressbar-track {
    position: relative;
    width: 100%;
    height: 24px;
    background-color: var(--color-dark-blue);
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .progressbar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: var(--color-dark-red);
    transition: width 0.3s ease-out;
  }

  .progressbar-label {
    position: relative;
    z-index: 10;
    width: 100%;
    font-size: var(--font-size-md, 1rem);
    color: var(--color-white);
    text-align: center;
    font-weight: 500;
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