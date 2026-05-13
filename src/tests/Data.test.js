import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BigNumber from '$lib/components/Data/BigNumber.svelte';
import Progressbar from '$lib/components/Data/Progressbar.svelte';

describe('BigNumber', () => {
  it('renders the number and label', () => {
    render(BigNumber, { props: { number: '42%', label: 'Approval Rating' } });
    expect(screen.getByText('42%')).toBeTruthy();
    expect(screen.getByText('Approval Rating')).toBeTruthy();
  });

  it('renders a footnote when provided', () => {
    render(BigNumber, {
      props: {
        number: '$1.2M',
        label: 'Total Budget',
        footnote: 'As of 2024',
      },
    });
    expect(screen.getByText('As of 2024')).toBeTruthy();
  });

  it('does not render a footnote when omitted', () => {
    const { container } = render(BigNumber, {
      props: { number: '100', label: 'Count' },
    });
    expect(container.querySelector('.footnote')).toBeNull();
  });
});

describe('Progressbar', () => {
  it('renders the progress bar with correct fill width', () => {
    const { container } = render(Progressbar, {
      props: { value: 50, label: 'Test Progress' },
    });
    const fill = container.querySelector('.progressbar-fill');
    expect(fill).toBeTruthy();
    expect(fill.style.width).toBe('50%');
  });

  it('renders the label text', () => {
    render(Progressbar, {
      props: { value: 75, label: 'Custom Label' },
    });
    expect(screen.getByText('Custom Label')).toBeTruthy();
  });

  it('renders with default label when not provided', () => {
    render(Progressbar, {
      props: { value: 60 },
    });
    expect(screen.getByText('Progress')).toBeTruthy();
  });

  it('clamps value to 100 when exceeding', () => {
    const { container } = render(Progressbar, {
      props: { value: 150, label: 'Over 100' },
    });
    const fill = container.querySelector('.progressbar-fill');
    expect(fill.style.width).toBe('100%');
  });

  it('clamps value to 0 when negative', () => {
    const { container } = render(Progressbar, {
      props: { value: -20, label: 'Negative' },
    });
    const fill = container.querySelector('.progressbar-fill');
    expect(fill.style.width).toBe('0%');
  });

  it('renders at 0% for zero value', () => {
    const { container } = render(Progressbar, {
      props: { value: 0, label: 'Empty' },
    });
    const fill = container.querySelector('.progressbar-fill');
    expect(fill.style.width).toBe('0%');
  });

  it('renders progress track and label elements', () => {
    const { container } = render(Progressbar, {
      props: { value: 45, label: 'Test' },
    });
    expect(container.querySelector('.progressbar-track')).toBeTruthy();
    expect(container.querySelector('.progressbar-label')).toBeTruthy();
    expect(container.querySelector('.progressbar-container')).toBeTruthy();
  });
});
