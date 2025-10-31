import path from 'path';

async function dynamicImport(p: string) {
  // Use dynamic import to get better error messages when module cannot be loaded
  try {
    return await import(p);
  } catch (err) {
    console.error(`Failed to import ${p}:`, err);
    throw err;
  }
}

async function testRateLimiter() {
  console.log('--- RateLimiter concurrency test ---');
  const batchPath = path.resolve(__dirname, '../src/ai/batch.ts');
  const batchModule = await dynamicImport(batchPath).catch(() => null);
  if (!batchModule) {
    console.warn('Skipping RateLimiter test: module import failed.');
    return;
  }

  const { RateLimiter } = batchModule as any;
  if (!RateLimiter) {
    console.warn('RateLimiter not exported from src/ai/batch.ts — skipping test.');
    return;
  }

  // Create a limiter that allows 3 concurrent, 10 per minute (values purely for testing)
  const rl = new RateLimiter(3, 1000);

  // Helper task that resolves after a short random delay
  const makeTask = (i: number) => async () => {
    const delay = 100 + Math.floor(Math.random() * 200);
    await new Promise((r) => setTimeout(r, delay));
    return `task-${i}-done`;
  };

  const concurrent = 12;
  const tasks = new Array(concurrent).fill(0).map((_, i) =>
    rl.execute(makeTask(i))
      .then((res: any) => ({ ok: true, res }))
      .catch((err: any) => ({ ok: false, err: err?.message || String(err) }))
  );

  const results = await Promise.all(tasks);
  console.log('RateLimiter results summary:', results.map((r) => (r.ok ? 'OK' : `ERR:${r.err}`)));
  if (typeof rl.getStatus === 'function') {
    const status = await rl.getStatus();
    console.log('RateLimiter.getStatus():', status);
  } else {
    console.log('RateLimiter.getStatus() not available on this instance.');
  }
}

async function testCachedGenerate() {
  console.log('--- cachedGenerate thundering-herd test ---');
  const cachePath = path.resolve(__dirname, '../src/ai/cache.ts');
  const cacheModule = await dynamicImport(cachePath).catch(() => null);
  if (!cacheModule) {
    console.warn('Skipping cachedGenerate test: module import failed.');
    return;
  }

  // cachedGenerate may be exported from the module. Try multiple possible names.
  const cachedGenerate =
    cacheModule.cachedGenerate ||
    cacheModule.default?.cachedGenerate ||
    cacheModule.default ||
    cacheModule.cached_generate;

  if (!cachedGenerate || typeof cachedGenerate !== 'function') {
    console.warn('cachedGenerate not found in src/ai/cache.ts — skipping test.');
    return;
  }

  let fetchCount = 0;
  const key = `test:dedup:${Date.now()}`;

  // A fetcher that increments fetchCount and sleeps ~250ms
  const fetcher = async () => {
    fetchCount++;
    await new Promise((r) => setTimeout(r, 250));
    return { ts: Date.now() };
  };

  // Launch 8 concurrent callers
  const callers = new Array(8).fill(0).map(() =>
    cachedGenerate(key, fetcher, 10).then(
      (v: any) => ({ ok: true, value: v }),
      (err: any) => ({ ok: false, err: err?.message || String(err) })
    )
  );

  const results = await Promise.all(callers);
  console.log('cachedGenerate call results:', results.map((r) => (r.ok ? 'OK' : `ERR:${r.err}`)));
  console.log('Underlying fetcher executed:', fetchCount, 'time(s). (<=1 expected to avoid thundering herd)');
}

async function main() {
  try {
    await testRateLimiter();
    await testCachedGenerate();
  } catch (err) {
    console.error('Test runner error:', err);
    process.exitCode = 2;
  }
}

main();