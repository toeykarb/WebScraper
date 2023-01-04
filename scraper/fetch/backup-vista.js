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

const scrapeVistaTemplate = async (url) => {
  const environment = process.env.DOCKER_ENVIRONMENT;
  const data = {
    tags: ["vista", "vista templates"],
  };

  const response = await fetch(url);
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
            message: `search tag not found - skip scraping  ${url}`,
          },
        };
      }

      resposeData.results.forEach(async (item) => {
        let articleId = "";
        if (item.previewImageUrls) {
          for (var i = 0; i < item.previewImageUrls.length; i++) {
            data.imageLink = `https://cdn.create.vista.com${item.previewImageUrls[i]}`;
            const [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);

            if (item.previewImageUrls.length > 1) {
              data.articleId = `${item.id}_${i}`;
            } else {
              data.articleId = item.id;
            }
            const imageExtension = data.imageLink.split(".").pop().toLowerCase();
            if (![...IMAGES_EXTENSION].includes(imageExtension)) {
              console.log(
                `Invalid image extension ${imageExtension} for ${item.previewImageUrls[i]} - skip scraping`
              );
              return {
                statusCode: 200,
                body: {
                  message: `Image link not present on page - skip scraping  ${item.previewImageUrls[i]}`,
                },
              };
            }
            const environmentFileName = environment !== "prod" ? `${environment}-` : "";
            data.imageName = `vista_template_${data.articleId}_${environmentFileName}.${imageExtension}`;

            const imageKey = `${getCatalogStoragePath(CATALOG_IDS.TEAM, "files")}/${
              data.imageName
            }`;
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
          }
        } else {
          console.log(`No image link - ${item.id}`);
          return {
            statusCode: 200,
            body: {
              message: `No image link - skip scraping for ${item.id}`,
            },
          };
        }
      });
    } else {
      console.log(`No response - ${url}`);
      return {
        statusCode: 200,
        body: {
          message: `No response - skip scraping for ${url}`,
        },
      };
    }

    // handle data
  } else {
    console.log(`fetch error - skip scraping for ${url}`);
    return {
      statusCode: 200,
      body: {
        message: `fetch error - skip scraping for ${url} - ${response.status}`,
      },
    };
  }

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
  try {
    result = await scrapeVistaTemplate(url);
    if (result && result.statusCode === 200) {
      console.log(result);
    }
  } catch (error) {
    console.log(`Failed to scrape ${url}`);
    console.log(error);
  }
}
getVistaTemplate();
