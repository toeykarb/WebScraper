const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const FormData = require("form-data");
const fileType = require("file-type");
const cookie = require("cookie");
/**
 * @param {string} url
 * @return {Promise<[Buffer, {contentType:string, src: string},imageExtension:string, src: string]>}
 */

const downloadPickupimageFile = async (url, pageCookies) => {
  const cookieString = pageCookies
    .map(({ name, value, ...options }) => {
      delete options.expires;
      return cookie.serialize(name, value, options);
    })
    .join(";");

  // @ts-ignore
  const response = await fetch(url, {
    method: "POST",
    headers: {
      cookie: cookieString,
    },
  });
  const contentType = await response.headers.get("content-type");
  const buffer = await response.buffer();
  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;
  // @ts-ignore
  return [buffer, { contentType }, imageExtension];
};

module.exports = downloadPickupimageFile;
