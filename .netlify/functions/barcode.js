var bwipjs = require("bwip-js");

exports.handler = async function(event, context, handler){
    let result;
    const params = get_params(event.rawQueryString || event.rawQuery || '');

    const includetext = params.includetext ?? false;

    let opts = {
        bcid:        params.type ?? 'code128',       // Barcode type
        text:        params.content ?? 'undefined',    // Text to encode
        scale:       params.scale ?? 3,               // 3x scaling factor
        includetext: includetext,
        textxalign:  'center',
        padding:     params.padding ?? 0,
    };

    if('height' in params){
      opts.height = params.height;
    } else if(inArray(opts.bcid, ['code128', 'code39', 'upca', 'upce', 'ean14', 'ean13'])) {
      opts.height = 10;
    }



    await bwipjs.toBuffer(opts)
    .then(png => {
       result = png;
    })
    .catch(err => {

    });

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
