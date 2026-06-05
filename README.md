# Barcode API

API-only Netlify service that returns barcode and QR code PNG images.

## Local Development

```bash
npm install
npm run dev
```

The local API runs at:

```text
http://localhost:8888/
```

## Usage

Generate a Code 128 barcode:

```text
http://localhost:8888/?content=hello&type=code128&includetext=true
```

Generate a QR code containing a URL with its own query parameters:

```text
http://localhost:8888/?type=qrcode&content=https%3A%2F%2Fexample.com%2Fpage%3Fa%3D1%26b%3D2&scale=5&padding=10
```

The response is a PNG image.

## Query Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `type` | `code128` | Barcode type passed to `bwip-js`, such as `code128`, `code39`, `ean13`, or `qrcode`. |
| `content` | `undefined` | Text or URL to encode. URL-encode values that contain `?`, `&`, or `=`. |
| `scale` | `3` | Image scale. Must be between `1` and `10`. |
| `padding` | `0` | Image padding. Must be between `0` and `100`. |
| `height` | varies | Optional barcode height. Must be between `1` and `200`. |
| `includetext` | `false` | Use `true`, `1`, or a bare `?includetext` to show readable text where supported. |

## Tests

```bash
npm test
```
