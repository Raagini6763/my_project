import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('Gemini proxy worker', () => {
	it('rejects unsupported methods', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(response.status).toBe(405);
		expect(await response.json()).toEqual({ error: 'Use POST for this endpoint.' });
	});

	it('requires JSON for POST requests', async () => {
		const response = await SELF.fetch('https://example.com', { method: 'POST', body: 'text' });
		expect(response.status).toBe(415);
	});

	it('rejects unknown operations before calling Gemini', async () => {
		const response = await SELF.fetch('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ operation: 'unknown' }),
		});
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({ error: 'Unsupported language operation.' });
	});
});
