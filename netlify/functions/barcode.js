var bwipjs = require("bwip-js");

exports.handler = async function(event, context, handler){
    const params = get_params(event.rawQueryString || event.rawQuery || '');

    const includetext = parse_boolean(params.includetext);
    const scale = parse_number_param('scale', params.scale, 3, { min: 1, max: 10 });
    const padding = parse_number_param('padding', params.padding, 0, { min: 0, max: 100 });
    const height = parse_number_param('height', params.height, undefined, { min: 1, max: 200 });

    if (scale.error) return json_error(scale.error);
    if (padding.error) return json_error(padding.error);
    if (height.error) return json_error(height.error);

    let opts = {
        bcid:        params.type ?? 'code128',       // Barcode type
        text:        params.content ?? 'undefined',    // Text to encode
        scale:       scale.value,                    // 3x scaling factor
        includetext: includetext,
        textxalign:  'center',
        padding:     padding.value,
    };

    if(height.value !== undefined){
      opts.height = height.value;
    } else if(inArray(opts.bcid, ['code128', 'code39', 'upca', 'upce', 'ean14', 'ean13'])) {
      opts.height = 10;
    }
    let result;
    try {
      result = await bwipjs.toBuffer(opts);
    } catch (err) {
      return json_error(err.message || 'Unable to generate barcode');
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'private, max-age=2592000, immutable',
        },
        body: result.toString('base64'),
        isBase64Encoded: true
    }
}


function parse_boolean(value) {
  return value === true || value === 'true' || value === '1';
}

function parse_number_param(name, value, defaultValue, options) {
  if (value === undefined) return { value: defaultValue };
  if (value === true) return { error: `Missing value for number parameter: ${name}` };

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return { error: `Invalid number for ${name}: ${value}` };
  }

  if (number < options.min || number > options.max) {
    return { error: `${name} must be between ${options.min} and ${options.max}: ${value}` };
  }

  return { value: number };
}

function json_error(message) {
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: message,
    }),
  };
}


function get_params(rawQueryString) {
  const params = {};
  const queryString = new URLSearchParams(rawQueryString);

  for (const [key, value] of queryString.entries()) {
    if (key) params[key] = value || true;
  }

  return params;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
