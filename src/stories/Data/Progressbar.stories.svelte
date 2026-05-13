<!--
  Progressbar.stories.svelte

  Stories for the Progressbar component.
  Progressbar displays a visual progress indicator with a label — perfect for
  showing completion status or progress metrics.

  Props:
  - value: The progress percentage 0-100 (number)
  - label: Text label shown below the progress bar (string)
-->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Progressbar from '$lib/components/Data/Progressbar.svelte';

  const { Story } = defineMeta({
    title: 'Data/Progressbar',
    component: Progressbar,
    tags: ['autodocs'],
    argTypes: {
      value: {
        control: { type: 'range', min: 0, max: 100, step: 1 },
        description: 'Progress percentage from 0 to 100',
      },
      label: {
        control: 'text',
        description: 'Label text displayed below the progress bar',
      },
    },
  });
</script>

<!-- Default: 50% progress -->
<Story name="Default" args={{ value: 50, label: 'Progress' }} />

<!-- Empty: 0% progress -->
<Story name="Empty" args={{ value: 0, label: 'Not Started' }} />

<!-- Full: 100% progress -->
<Story name="Full" args={{ value: 100, label: 'Complete' }} />

<!-- Partial: 75% progress -->
<Story name="Partial" args={{ value: 75, label: 'Almost There' }} />