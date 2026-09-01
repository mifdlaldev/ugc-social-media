import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import LoadingIndicator from './LoadingIndicator.svelte';

describe('LoadingIndicator', () => {
	it('renders the provided label', () => {
		const { getByText } = render(LoadingIndicator, { props: { label: 'Generating slides' } });
		expect(getByText('Generating slides')).toBeInTheDocument();
	});

	it('renders an optional hint badge', () => {
		const { getByText } = render(LoadingIndicator, {
			props: { label: 'Working', hint: 'You.com' }
		});
		expect(getByText('You.com')).toBeInTheDocument();
	});

	it('exposes a polite live region and busy state', () => {
		const { container } = render(LoadingIndicator, { props: { label: 'Working' } });
		const status = container.querySelector('[role="status"]');
		expect(status).not.toBeNull();
		expect(status).toHaveAttribute('aria-live', 'polite');
		expect(status).toHaveAttribute('aria-busy', 'true');
	});

	it('does not render a numeric percentage or time estimate', () => {
		const { container } = render(LoadingIndicator, { props: { label: 'Working' } });
		const text = container.textContent ?? '';
		expect(text).not.toMatch(/\d+%/);
		expect(text).not.toMatch(/\d+s\b/);
		expect(text).not.toMatch(/\d+\s*seconds/);
	});
});
