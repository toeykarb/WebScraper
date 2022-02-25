const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");

const downloadFile = async (url) => {
  const response = await fetch(url);
  const contentType = await response.headers.get("content-type");
  const buffer = await response.buffer();

  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;
  return [buffer, contentType, imageExtension];
};

module.exports = downloadFile;
