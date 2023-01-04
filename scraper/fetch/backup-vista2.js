// @ts-nocheck
const probe = require("probe-image-size");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const postToImageService = require("../functions/image-service");
const downloadFile = require("../functions/download-file");
const { IMAGES_EXTENSION } = require("../functions/utils");
const putToS3 = require("../functions/put-to-s3");
const checkImageExists = require("../functions/check-image-exists");
const { getCatalogStoragePath, CATALOG_IDS } = require("../constants/catalogs");

const sqs = new AWS.SQS({ region: "ap-southeast-1" });
const data = {
  tags: ["vista", "vista templates"],
};
const scrapeVistaTemplate = async (data, imagelink) => {
  const environment = process.env.DOCKER_ENVIRONMENT;

  data.imageLink = `https://cdn.create.vista.com${imagelink}`;
  const [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);

  const imageExtension = data.imageLink.split(".").pop().toLowerCase();
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    console.log(`Invalid image extension ${imageExtension} for ${imagelink} - skip scraping`);
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping  ${imagelink}`,
      },
    };
  }
  const environmentFileName = environment !== "prod" ? `${environment}-` : "";
  data.imageName = `vista_template_${data.articleId}_${environmentFileName}.${imageExtension}`;

  const imageKey = `${getCatalogStoragePath(CATALOG_IDS.TEAM, "files")}/${data.imageName}`;
  // Check if the image file has already been uploaded.
  const imageExists = await checkImageExists(data.imageName, imageKey);
  if (imageExists) {
    console.log(
      `Image for article [${data.articleId}] already exists, skip scraping - ${data.imageLink}`
    );
    return {
      statusCode: 200,
      message: `Image for article [${data.articleId}] already exists, skip scraping`,
    };
  }

  // Put to S3
  console.log("Put image to s3");

  const image = await putToS3(imageBuffer, imageKey, imageMetadata);
  data.imageDimensions = probe.sync(imageBuffer);
  await postToImageService({
    ...data,
    imageS3Key: image.s3Key,
    imageSize: image.filesize,
  });

  return {
    statusCode: 200,
    body: {
      ...data,
    },
  };
};
async function getVistaTemplate() {
  let result;
  const url = [
    "https://create.vista.com/api/v2/search/templates?limit=2&skip=0&templateType=regular%2Canimated&searchByKeyword=false&section=templatesPage&q=4th%20of%20july%20flyer&_ga=GA1.1.1850159779.1658132136",
  ];

  for (var k = 0; k < url.length; k++) {
    try {
      const response = await fetch(url[k]);
      if (response.status === 200) {
        let resposeData = await response.json();
        if (resposeData.count > 0) {
          try {
            let getsearchTerm = await resposeData.searchMeta["original"]["q"];
            const searchTag = `${getsearchTerm.toLowerCase()} templates`;
            data.tags.push(searchTag);
          } catch (err) {
            console.log(err);
            console.log("search tag not found");
            return {
              statusCode: 200,
              body: {
                message: `search tag not found - skip scraping  ${url[k]}`,
              },
            };
          }
          ////////////////
          for (var index = 0; index < resposeData.results.length; index++) {
            if (resposeData.results[index]["previewImageUrls"]) {
              console.log(resposeData.results[index]["previewImageUrls"].length);
              for (var i = 0; i < resposeData.results[index]["previewImageUrls"].length; i++) {
                // getArticle Id
                if (resposeData.results[index]["previewImageUrls"].length > 1) {
                  data.articleId = `${resposeData.results[index]["id"]}_${i}`;
                } else {
                  data.articleId = resposeData.results[index]["id"];
                }
                // send to scrape
                result = await scrapeVistaTemplate(
                  data,
                  resposeData.results[index]["previewImageUrls"][i]
                );
                if (result && result.statusCode === 200) {
                  console.log(result);
                }
              }
            } else {
              console.log(`No image link - ${resposeData.results[index]["id"]}`);
              return {
                statusCode: 200,
                body: {
                  message: `No image link - skip scraping for ${resposeData.results[index]["id"]}`,
                },
              };
            }
            //////
          }
        } else {
          console.log(`No response - ${url[k]}`);
          return {
            statusCode: 200,
            body: {
              message: `No response - skip scraping for ${url[k]}`,
            },
          };
        }
      } else {
        console.log(`fetch error - skip scraping for ${url[k]}`);
        return {
          statusCode: result.statusCode,
          body: {
            message: `fetch error - skip scraping for ${url[k]} - ${response.status}`,
          },
        };
      }
    } catch (error) {
      console.log(`Failed to scrape ${url[k]}`);
      console.log(error);
    }
  }
}
getVistaTemplate();
