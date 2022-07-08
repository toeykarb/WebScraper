const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const FormData = require('form-data');
const fileType = require('file-type');
const cookie = require('cookie');

const downloadSkitterphotoFile = async (url, token, pageCookies) => {
  const cookieString = pageCookies
    .map(({ name, value, ...options }) => {
      delete options.expires;
      return cookie.serialize(name, value, options);
    })
    .join(';');

  var form = new FormData();
  form.append('_token', token);
  // @ts-ignore
  const response = await fetch(url, {
    method: 'POST',
    body: form,
    headers: {
      cookie: cookieString,
    },
  });
  const contentType = await response.headers.get('content-type');
  const buffer = await response.buffer();
  const imageType = await fileType.fromBuffer(buffer);
  console.log();
  if (!imageType?.ext) {
    throw new Error('Invalid image');
  }
  const imageExtension = imageType.ext;
  // @ts-ignore
  return [buffer, { contentType }, imageExtension];
};

module.exports = downloadSkitterphotoFile;
