jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('Demo mode payments', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, STRIPE_SECRET_KEY: 'sk_test_demo' };
    delete process.env.NEXT_PUBLIC_RESOUND_DEMO;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('defaults to demo mode without configuration', () => {
    expect(require('@/lib/demo').isDemoMode).toBe(true);
    expect(require('@/lib/demoData').isDemoMode()).toBe(true);
  });

  it.each(['true', '', 'FALSE', '0'])('keeps demo mode on for %j', (value) => {
    process.env.NEXT_PUBLIC_RESOUND_DEMO = value;
    expect(require('@/lib/demo').isDemoMode).toBe(true);
    expect(require('@/lib/demoData').isDemoMode()).toBe(true);
  });

  it.each(['sk_test_demo', 'rk_test_demo'])('allows a test key: %s', (key) => {
    process.env.STRIPE_SECRET_KEY = key;

    expect(() => require('@/lib/stripe')).not.toThrow();
    expect(require('stripe').default).toHaveBeenCalledWith(key, expect.any(Object));
  });

  it.each(['sk_live_demo', 'rk_live_demo', 'invalid_key'])('blocks a non-test key before Stripe initializes: %s', (key) => {
    process.env.STRIPE_SECRET_KEY = key;

    expect(() => require('@/lib/stripe')).toThrow('Demo mode requires a Stripe test secret key');
    expect(require('stripe').default).not.toHaveBeenCalled();
  });

  it('requires an explicit opt-out to allow live payments', () => {
    process.env.NEXT_PUBLIC_RESOUND_DEMO = 'false';
    process.env.STRIPE_SECRET_KEY = 'sk_live_demo';

    expect(require('@/lib/demo').isDemoMode).toBe(false);
    expect(require('@/lib/demoData').isDemoMode()).toBe(false);
    expect(() => require('@/lib/stripe')).not.toThrow();
    expect(require('stripe').default).toHaveBeenCalledWith('sk_live_demo', expect.any(Object));
  });

  it('still rejects a missing Stripe secret key', () => {
    delete process.env.STRIPE_SECRET_KEY;

    expect(() => require('@/lib/stripe')).toThrow('STRIPE_SECRET_KEY is not defined');
    expect(require('stripe').default).not.toHaveBeenCalled();
  });
});
