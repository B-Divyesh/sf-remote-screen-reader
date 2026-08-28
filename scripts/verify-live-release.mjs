const slug = 'remote-screen-reader';
const site = `https://${slug}.sociobot.in`;
const api = 'https://api.sociobot.in/api/v1';

function assert(condition, message) {
  if (!condition) throw new Error(`Live release check failed: ${message}`);
}

const catalogResponse = await fetch(`${api}/products`);
assert(catalogResponse.ok, `product catalog returned ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const product = catalog.data?.find(item => item.slug === slug);
assert(product, 'the factory product is not enabled');
assert(product.currency === 'INR' && product.price_minor === 49900, 'catalog price must match the advertised one-time ₹499');

const checkout = await fetch(`${api}/products/${slug}/checkout`, { redirect: 'manual' });
assert(checkout.status === 303, `checkout returned ${checkout.status}, expected 303`);
assert(checkout.headers.get('location')?.startsWith('https://checkout.dodopayments.com/session/'), 'checkout did not redirect to the hosted Dodo session');

const metadataResponse = await fetch(`${site}/android-release.json`, { cache: 'no-store' });
assert(metadataResponse.ok, `Android release metadata returned ${metadataResponse.status}`);
const metadata = await metadataResponse.json();
assert(/^[a-f0-9]{64}$/.test(metadata.sha256) && !/^0+$/.test(metadata.sha256), 'Android SHA-256 metadata is absent');
for (const [label, url] of [['APK', metadata.downloadUrl], ['checksum', metadata.checksumUrl]]) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  assert(response.ok, `${label} URL returned ${response.status}`);
}

console.log(`Live checkout and Android release checks passed (${metadata.version}, ${metadata.sha256}).`);
