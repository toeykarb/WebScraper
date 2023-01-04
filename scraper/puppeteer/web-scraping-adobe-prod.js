// @ts-nocheck
const probe = require("probe-image-size");
const fetch = require("node-fetch");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const postToImageService = require("./image-template-service");
const downloadFile = require("../functions/download-file");
const { IMAGES_EXTENSION } = require("../functions/utils");
const putToS3 = require("../functions/put-to-s3");
const checkImageExists = require("../functions/check-image-exists");
const { getCatalogStoragePath, CATALOG_IDS } = require("../constants/catalogs");
const puppeteer = require("puppeteer");

const sqs = new AWS.SQS({ region: "ap-southeast-1" });

const scrapeAdobeTemplate = async (data, templateData) => {
  const environment = process.env.DOCKER_ENVIRONMENT;
  data.titleTag = [];
  data.imageLink = templateData["__url"] ? templateData["__url"] : "";
  data.articleId = templateData["__id"] ? templateData["__id"] : "";
  data.isPremuim = templateData["__isPremium"] ? templateData["__isPremium"] : false;
  if (data.isPremuim) {
    data.titleTag.push("adobe express premium");
  } else {
    data.titleTag.push("adobe express free");
  }
  const [imageBuffer, imageMetadata] = await downloadFile(data.imageLink);

  const imageExtension = imageMetadata.contentType.split("/").pop().toLowerCase();
  if (![...IMAGES_EXTENSION].includes(imageExtension)) {
    console.log(`Invalid image extension ${imageExtension} for ${data.imageLink} - skip scraping`);
    return {
      statusCode: 200,
      status: false,
      body: {
        message: `Image link not present on page - skip scraping  ${imagelink}`,
      },
    };
  }
  const environmentFileName = environment !== "prod" ? `${environment}-` : "";
  data.imageName = `adobe_express_template_${data.articleId}${environmentFileName}.${imageExtension}`;

  const imageKey = `${getCatalogStoragePath(CATALOG_IDS.TEAM, "files")}/${data.imageName}`;
  // Check if the image file has already been uploaded.
  const imageExists = await checkImageExists(data.imageName, imageKey);
  if (imageExists) {
    // console.log(
    //   `Image for article [${data.articleId}] already exists, skip scraping - ${data.imageLink}`
    // );
    return {
      statusCode: 200,
      status: false,
      message: `Image for article [${data.articleId}] already exists, skip scraping`,
    };
  }

  // Put to S3
  console.log("Put image to s3");

  const image = await putToS3(imageBuffer, imageKey, imageMetadata);
  data.imageDimensions = await probe.sync(imageBuffer);
  await postToImageService({
    ...data,
    imageS3Key: image.s3Key,
    imageSize: image.filesize,
  });

  return {
    statusCode: 200,
    status: true,
    body: {
      ...data,
    },
  };
};

async function getAdobeTemplate() {
  console.log("...Start");
  const data = {
    tags: ["adobe express", "adobe express templates", "template"],
  };
  const searchTerm = ["4th of July flyer"];
  let result;
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  let sessionDataObject = {
    "adobeid_ims_profile/MarvelWeb3/false/AdobeID,DCAPI,ab.manage,additional_info.projectedProductContext,creative_cloud,creative_sdk,gnav,mps,openid,read_organizations,sao.ACOM_CLOUD_STORAGE,sao.spark,sao.typekit,stk.a.k12_access.cru,stk.a.limited_license.cru,tk_platform,tk_platform_refresh_user,tk_platform_sync":
      '{"account_type":"type1","utcOffset":"null","preferred_languages":["en-us"],"serviceAccounts":[{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"creative_cloud","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"2"},{"pn":"version_retention_time","pv":"10"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"creative_cloud","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"2"},{"pn":"version_retention_time","pv":"10"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ccprivate","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"100"},{"pn":"version_retention_time","pv":"1000"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ccpublish","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"100"},{"pn":"version_retention_time","pv":"1000"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ACOM_CLOUD_STORAGE","serviceStatus":"ACTIVE","serviceLevel":"ACOM_FREE","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","subRef":null,"createDts":1658109687000,"modDts":1658109687000,"params":[{"pn":"storage_quota","pv":"101"},{"pn":"acp_region","pv":"AP"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ACOM_CLOUD_STORAGE","serviceStatus":"ACTIVE","serviceLevel":"ACOM_FREE","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":"https://ccapi-stage.corp.adobe.com/","createDts":1658109687000,"modDts":1658109687000,"params":[{"pn":"storage_quota","pv":"101"},{"pn":"acp_region","pv":"AP"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"typekit","serviceStatus":"ACTIVE","serviceLevel":"FREE_BASIC","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":"https://typekit.com/","createDts":1658109687000,"modDts":1658109687000,"params":[]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"spark","serviceStatus":"ACTIVE","serviceLevel":"FREE_BASIC","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":null,"createDts":1658109687000,"modDts":1658109687000,"params":[]}],"displayName":"test test","last_name":"test","userId":"96676F2562D4BEF40A495E19@AdobeID","authId":"96676F2562D4BEF40A495E19@AdobeID","tags":["agegroup_18plus"],"projectedProductContext":[],"emailVerified":"true","toua":[{"touName":"creative_cloud","current":true}],"phoneNumber":null,"countryCode":"TH","optionalAgreements":["CA_ML"],"name":"test test","mrktPerm":"EMAIL:false","mrktPermEmail":"false","first_name":"test","email":"referraltesttoey02@gmail.com"}',
    "adobeid_ims_access_token/MarvelWeb3/false/AdobeID,DCAPI,ab.manage,additional_info.projectedProductContext,creative_cloud,creative_sdk,gnav,mps,openid,read_organizations,sao.ACOM_CLOUD_STORAGE,sao.spark,sao.typekit,stk.a.k12_access.cru,stk.a.limited_license.cru,tk_platform,tk_platform_refresh_user,tk_platform_sync":
      '{"REAUTH_SCOPE":"reauthenticated","valid":true,"client_id":"MarvelWeb3","scope":"AdobeID,openid,creative_sdk,gnav,sao.spark,additional_info.projectedProductContext,tk_platform,tk_platform_refresh_user,tk_platform_sync,creative_cloud,ab.manage,sao.typekit,mps,read_organizations,stk.a.k12_access.cru,stk.a.limited_license.cru,DCAPI,sao.ACOM_CLOUD_STORAGE,additional_info.optionalAgreements","expire":"2022-07-29T03:50:57.360Z","user_id":"96676F2562D4BEF40A495E19@AdobeID","tokenValue":"eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE2NTg5ODAyNTczNjBfY2VmZDA2YjUtYzFmNC00ZDExLTk1ZDItNGM3ZWRhNTNmZTM5X3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJNYXJ2ZWxXZWIzIiwidXNlcl9pZCI6Ijk2Njc2RjI1NjJENEJFRjQwQTQ5NUUxOUBBZG9iZUlEIiwic3RhdGUiOiJ7XCJhY1wiOlwibWFydmVsLmFkb2JlLmNvbVwiLFwianNsaWJ2ZXJcIjpcInYyLXYwLjM0LjAtNC1nNDEzODg1OVwiLFwibm9uY2VcIjpcIjU2NjI2OTYzNjMzMzc4ODFcIn0iLCJhcyI6Imltcy1uYTEiLCJhYV9pZCI6Ijk2Njc2RjI1NjJENEJFRjQwQTQ5NUUxOUBBZG9iZUlEIiwiY3RwIjowLCJmZyI6IldVU1dOQTVCVlBFNUlIVU9FTVFGUUhRQVJBPT09PT09Iiwic2lkIjoiMTY1ODk4MDI1NjEzNl81ZmQ1NDllYy1lOWIxLTQxMjgtYWU4ZC0wYzQ0ZjY4NDBiMWJfdWUxIiwibW9pIjoiNDRlMmYwNjAiLCJwYmEiOiIiLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJzY29wZSI6IkFkb2JlSUQsb3BlbmlkLGNyZWF0aXZlX3NkayxnbmF2LHNhby5zcGFyayxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQsdGtfcGxhdGZvcm0sdGtfcGxhdGZvcm1fcmVmcmVzaF91c2VyLHRrX3BsYXRmb3JtX3N5bmMsY3JlYXRpdmVfY2xvdWQsYWIubWFuYWdlLHNhby50eXBla2l0LG1wcyxyZWFkX29yZ2FuaXphdGlvbnMsc3RrLmEuazEyX2FjY2Vzcy5jcnUsc3RrLmEubGltaXRlZF9saWNlbnNlLmNydSxEQ0FQSSxzYW8uQUNPTV9DTE9VRF9TVE9SQUdFLGFkZGl0aW9uYWxfaW5mby5vcHRpb25hbEFncmVlbWVudHMiLCJjcmVhdGVkX2F0IjoiMTY1ODk4MDI1NzM2MCJ9.YO9VT7tQdnafB49cyJC9Jg6LNFSS_A-Ri5HzTjIB1oFppKwhWE0FmtEJtGLPgZEIS32zNv8J3OLNFEMBAXqco5ZRAqB8TzzInjbeiicOGJbDF08b0wcauD8pR2w30l4JTYXBQVPMOmGZJwCQpxVbg31_uJl61wI6Q4h6dD-quHvdvwxKWaxf17Mzf6zf8IaQbB8lOntGPDDTAph_cc-5f6E-xmVbDeSPj5kW9bTnejl-Gdr1CVDW0vWDO2cchjXl_eaJb3y4FNxZFyCRZy4XX-YU3NPT8d7SnYCUN7i9W6ctsko72ko-9T52fv-5V_ewKS2BkrQmSq06z8j-qKEzpA","sid":"1658980256136_5fd549ec-e9b1-4128-ae8d-0c44f6840b1b_ue1","state":{},"fromFragment":false,"impersonatorId":"","isImpersonatedSession":false,"other":"{}"}',
    ingestSessionId: "0010e17e-9a52-4d46-8ffd-e139c8fd5e5a",
    "redirect-uri": "https://express.adobe.com/sp",
    _scsid: "6f88d57c-a1d1-4257-b654-d91587aafb24",
    _logger_session_key: "a3f8daba-1d9a-40cc-9df8-3116dce15cc1",
    "signin-success": "true",
    branch_session:
      '{"session_id":"1081048445366831367","identity_id":"1081048445366981371","link":"https://adobesparkpost.app.link?%24identity_id=1081048445366981371","data":"{\\"+clicked_branch_link\\":false,\\"+is_first_session\\":true}","browser_fingerprint_id":"MTAxODAzOTM2MTg2NTc4ODkzMQ==","has_app":false,"identity":null}',
    marvel_ref_url: "https://adobeid-na1.services.adobe.com/",
  };
  await page.goto("https://express.adobe.com/sp/search", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.evaluate((sessionDataObject) => {
    Object.keys(sessionDataObject).forEach((key) =>
      sessionStorage.setItem(key, sessionDataObject[key])
    );
  }, sessionDataObject);

  for (var i = 0; i < searchTerm.length; i++) {
    try {
      var searchTermTag = `${searchTerm[i].toLowerCase()} template`;
      var searchTermTags = searchTerm[i].split(" ");
      data.tags.push(searchTermTag);
      data.tags.push(...searchTermTags);

      await page.goto(`https://express.adobe.com/sp/search?key=${searchTerm[i]}`, {
        waitUntil: ["networkidle2", "domcontentloaded"],
      });
      var adobeTemplate = [];
      adobeTemplate = await page.evaluate(() => {
        var items = [
          ...document
            .querySelector("theo-vertical-masonry")
            .shadowRoot.querySelectorAll("theo-thumbnail"),
        ];
        return items;
      }, []);
      // console.log(adobeTemplate.length);

      if (adobeTemplate.length < 51) {
        limitTop50 = adobeTemplate.length;
        for (var k = 0; k < limitTop50; k++) {
          result = await scrapeAdobeTemplate(data, adobeTemplate[k]);
          console.log(result);
        }
      } else {
        var successTemplate = 0;
        var counter = 0;
        while (successTemplate < 51) {
          if (counter < adobeTemplate.length) {
            result = await scrapeAdobeTemplate(data, adobeTemplate[counter]);
            console.log(result);
            if (result.status) {
              successTemplate++;
            }
          } else {
            await page.evaluate(async () => {
              await new Promise((resolve, reject) => {
                const scrollableSection = document.querySelector(".search-results-grid-holder");
                var totalHeight = 0;
                var distance = 500;
                var timer = setInterval(() => {
                  var items = [
                    ...document
                      .querySelector("theo-vertical-masonry")
                      .shadowRoot.querySelectorAll("theo-thumbnail"),
                  ];
                  scrollableSection.scrollBy(0, distance);
                  totalHeight += distance;
                  if (items.length > adobeTemplate.length) {
                    clearInterval(timer);
                    resolve();
                  }
                }, 100);
              });
            });
            adobeTemplate = await page.evaluate(() => {
              var items = [
                ...document
                  .querySelector("theo-vertical-masonry")
                  .shadowRoot.querySelectorAll("theo-thumbnail"),
              ];
              return items;
            }, []);
            result = await scrapeAdobeTemplate(data, adobeTemplate[counter]);
            console.log(result);
            if (result.status) {
              successTemplate++;
            }
          }
          counter++;
        }
      }
    } catch (error) {
      console.log(`Failed to scrape ${searchTerm[i]}`);
      console.log(error);
    }
  }
  await browser.close();
}
getAdobeTemplate();
