const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fileType = require("file-type");
const FormData = require("form-data");

const downloadStockvalutFile = async (id) => {
  var form = new FormData();
  form.append("id", id);
  const url = "https://www.stockvault.net/photo/download/";
  console.log(`Downloading: ${url}${id}`);
  // @ts-ignore
  const response = await fetch(url, {
    method: "POST",
    body: form,
  });
  const contentType = await response.headers.get("content-type");
  const buffer = await response.buffer();
  console.log(buffer);
  const imageType = await fileType.fromBuffer(buffer);
  if (!imageType?.ext) {
    throw new Error("Invalid image");
  }
  const imageExtension = imageType.ext;
  return [buffer, contentType, imageExtension];
};

downloadStockvalutFile("https://www.webumenia.sk/en/image/119073/download").then(
  ([imageBuffer, imageMetadata, extension]) => {
    console.log(extension);
    console.log(imageBuffer);
    console.log(imageMetadata);
  }
);
// console.log(type);
