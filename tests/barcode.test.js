const assert = require('assert');

const bwipjs = require('bwip-js');

async function testValidPngResponse() {
  const { handler } = require('../netlify/functions/barcode.js');

  const response = await handler({
    rawQueryString: 'type=qrcode&content=https%3A%2F%2Fexample.com%2Fpage%3Fa%3D1%26b%3D2&scale=5&padding=10',
  });
  const png = Buffer.from(response.body, 'base64');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.headers['Content-Type'], 'image/png');
  assert.strictEqual(response.headers['Cache-Control'], 'public, max-age=2592000, immutable');
  assert.strictEqual(response.headers['Netlify-CDN-Cache-Control'], 'public, s-maxage=2592000, immutable');
  assert.strictEqual(response.isBase64Encoded, true);
  assert.strictEqual(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
}

async function testParsedOptions() {
  const originalToBuffer = bwipjs.toBuffer;
  let generatedOptions;

  bwipjs.toBuffer = async (options) => {
    generatedOptions = options;
    return Buffer.from('ok');
  };

  try {
    delete require.cache[require.resolve('../netlify/functions/barcode.js')];
    const { handler } = require('../netlify/functions/barcode.js');

    const response = await handler({
      rawQueryString: 'type=qrcode&content=https%3A%2F%2Fexample.com%2Fpage%3Fa%3D1%26b%3D2%3Dx&scale=5&padding=10&height=20&includetext=false',
    });

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(generatedOptions, {
      bcid: 'qrcode',
      text: 'https://example.com/page?a=1&b=2=x',
      scale: 5,
      includetext: false,
      textxalign: 'center',
      padding: 10,
      height: 20,
    });
  } finally {
    bwipjs.toBuffer = originalToBuffer;
    delete require.cache[require.resolve('../netlify/functions/barcode.js')];
  }
}

async function testValidationErrors() {
  const { handler } = require('../netlify/functions/barcode.js');
  const cases = [
    {
      query: 'type=qrcode&content=test&scale',
      error: 'Missing value for number parameter: scale',
    },
    {
      query: 'type=qrcode&content=test&scale=50',
      error: 'scale must be between 1 and 10: 50',
    },
    {
      query: 'type=qrcode&content=test&padding=abc',
      error: 'Invalid number for padding: abc',
    },
    {
      query: 'type=not-a-barcode&content=test',
      error: 'bwipp.unknownEncoder: unknown encoder name: not-a-barcode',
    },
  ];

  for (const item of cases) {
    const response = await handler({ rawQueryString: item.query });

    assert.strictEqual(response.statusCode, 400);
    assert.strictEqual(response.headers['Content-Type'], 'application/json');
    assert.deepStrictEqual(JSON.parse(response.body), { error: item.error });
  }
}

(async () => {
  await testValidPngResponse();
  await testParsedOptions();
  await testValidationErrors();
  console.log('barcode tests passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
