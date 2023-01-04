const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { imageExtension, stockphotoTags } = require("./utils");
const data = {
  tags: [],
  internalTags: [],
  isCC0: false,
  authorTags: "",
  articleId: null,
};

(async (config = {}) => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });

  const page = await browser.newPage();
  // page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 2000, height: 2000, deviceScaleFactor: 1 });

  let sessionDataObject = {
    "adobeid_ims_profile/MarvelWeb3/false/AdobeID,DCAPI,ab.manage,additional_info.projectedProductContext,creative_cloud,creative_sdk,gnav,mps,openid,read_organizations,sao.ACOM_CLOUD_STORAGE,sao.spark,sao.typekit,stk.a.k12_access.cru,stk.a.limited_license.cru,tk_platform,tk_platform_refresh_user,tk_platform_sync":
      '{"account_type":"type1","utcOffset":"null","preferred_languages":["en-us"],"serviceAccounts":[{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"creative_cloud","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"2"},{"pn":"version_retention_time","pv":"10"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"creative_cloud","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"2"},{"pn":"version_retention_time","pv":"10"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ccpublish","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"100"},{"pn":"version_retention_time","pv":"1000"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ccprivate","serviceStatus":"ACTIVE","serviceLevel":"CS_LVL_1","params":[{"pn":"storage_quota","pv":"100"},{"pn":"version_retention_time","pv":"1000"},{"pn":"storage_region","pv":"AP"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ACOM_CLOUD_STORAGE","serviceStatus":"ACTIVE","serviceLevel":"ACOM_FREE","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","subRef":null,"createDts":1658109687000,"modDts":1658109687000,"params":[{"pn":"storage_quota","pv":"101"},{"pn":"acp_region","pv":"AP"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"ACOM_CLOUD_STORAGE","serviceStatus":"ACTIVE","serviceLevel":"ACOM_FREE","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":"https://ccapi-stage.corp.adobe.com/","createDts":1658109687000,"modDts":1658109687000,"params":[{"pn":"storage_quota","pv":"101"},{"pn":"acp_region","pv":"AP"},{"pn":"storage_region","pv":"US"}]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"typekit","serviceStatus":"ACTIVE","serviceLevel":"FREE_BASIC","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":"https://typekit.com/","createDts":1658109687000,"modDts":1658109687000,"params":[]},{"ident":"96676F2562D4BEF40A495E19-96676F2562D4BEF40A495E19","serviceCode":"spark","serviceStatus":"ACTIVE","serviceLevel":"FREE_BASIC","ownerGuid":"96676F2562D4BEF40A495E19","ownerAuthSrc":"WCD","ownerAcctLabel":null,"delegateGuid":"96676F2562D4BEF40A495E19","delegateAuthSrc":"WCD","delegateAcctLabel":null,"serviceUrl":null,"createDts":1658109687000,"modDts":1658109687000,"params":[]}],"displayName":"test test","last_name":"test","userId":"96676F2562D4BEF40A495E19@AdobeID","authId":"96676F2562D4BEF40A495E19@AdobeID","tags":["agegroup_18plus"],"projectedProductContext":[],"emailVerified":"true","toua":[{"touName":"creative_cloud","current":true}],"phoneNumber":null,"countryCode":"TH","optionalAgreements":["CA_ML"],"name":"test test","mrktPerm":"EMAIL:false","mrktPermEmail":"false","first_name":"test","email":"referraltesttoey02@gmail.com"}',
    _scsid: "6f88d57c-a1d1-4257-b654-d91587aafb24",
    ingestSessionId: "0010e17e-9a52-4d46-8ffd-e139c8fd5e5a",
    _logger_session_key: "a3f8daba-1d9a-40cc-9df8-3116dce15cc1",
    "adobeid_ims_access_token/MarvelWeb3/false/AdobeID,DCAPI,ab.manage,additional_info.projectedProductContext,creative_cloud,creative_sdk,gnav,mps,openid,read_organizations,sao.ACOM_CLOUD_STORAGE,sao.spark,sao.typekit,stk.a.k12_access.cru,stk.a.limited_license.cru,tk_platform,tk_platform_refresh_user,tk_platform_sync":
      '{"REAUTH_SCOPE":"reauthenticated","valid":true,"client_id":"MarvelWeb3","scope":"AdobeID,openid,creative_sdk,gnav,sao.spark,additional_info.projectedProductContext,tk_platform,tk_platform_refresh_user,tk_platform_sync,creative_cloud,ab.manage,sao.typekit,mps,read_organizations,stk.a.k12_access.cru,stk.a.limited_license.cru,DCAPI,sao.ACOM_CLOUD_STORAGE,additional_info.optionalAgreements","expire":"2022-07-29T03:00:59.613Z","user_id":"96676F2562D4BEF40A495E19@AdobeID","tokenValue":"eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0.eyJpZCI6IjE2NTg5NzcyNTk2MTNfOGExM2Y2MGEtM2ExMS00MmFlLTk4OGQtYTAwY2U2MDBlMzBjX3VlMSIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJjbGllbnRfaWQiOiJNYXJ2ZWxXZWIzIiwidXNlcl9pZCI6Ijk2Njc2RjI1NjJENEJFRjQwQTQ5NUUxOUBBZG9iZUlEIiwiYXMiOiJpbXMtbmExIiwiYWFfaWQiOiI5NjY3NkYyNTYyRDRCRUY0MEE0OTVFMTlAQWRvYmVJRCIsImN0cCI6MCwiZmciOiJXVVNUSUkzRVZQRTVJSFVPRU1RRlFIUUFSQT09PT09PSIsInNpZCI6IjE2NTgxMTY3OTMyOThfNzEwZjA1NDItYjljNy00M2VlLWE5ZGUtMzYxYmQwZjU4MTM1X3VlMSIsIm1vaSI6IjZmMDliOWUiLCJwYmEiOiIiLCJleHBpcmVzX2luIjoiODY0MDAwMDAiLCJzY29wZSI6IkFkb2JlSUQsb3BlbmlkLGNyZWF0aXZlX3NkayxnbmF2LHNhby5zcGFyayxhZGRpdGlvbmFsX2luZm8ucHJvamVjdGVkUHJvZHVjdENvbnRleHQsdGtfcGxhdGZvcm0sdGtfcGxhdGZvcm1fcmVmcmVzaF91c2VyLHRrX3BsYXRmb3JtX3N5bmMsY3JlYXRpdmVfY2xvdWQsYWIubWFuYWdlLHNhby50eXBla2l0LG1wcyxyZWFkX29yZ2FuaXphdGlvbnMsc3RrLmEuazEyX2FjY2Vzcy5jcnUsc3RrLmEubGltaXRlZF9saWNlbnNlLmNydSxEQ0FQSSxzYW8uQUNPTV9DTE9VRF9TVE9SQUdFLGFkZGl0aW9uYWxfaW5mby5vcHRpb25hbEFncmVlbWVudHMiLCJjcmVhdGVkX2F0IjoiMTY1ODk3NzI1OTYxMyJ9.hdiXP9Wjbxqz-x7IyTqTHwhYiBNxhyVFDw5i5IAlG1gr3iXg0iaxKGuSxOzHwSN5UpGMelJMP3MzaGhXs1uDXuY1J44JyIOJCaU6TMEc6UG2sC4eWZkWqOWD75fJCP9A-zJD7bNZdkdTma5TbiOC6qVZ6wWRZ-nEZ28-SxPc1Srule-FJe3LwdHiOsq7eBZ7K9q1PVrEYSKQF9P7GOhU9Z84F0emPDdehwZa5_k4nfuXNhZKLW4JeZ7Nx2OBbVmgr_mp5EgfyeiebLer_NjScCxdLDFzMBgPtTufI-qlShy_8cUexefmxARjD7AwR9TCXXXt4WaEXS31NbLPZN-NCQ","sid":"1658116793298_710f0542-b9c7-43ee-a9de-361bd0f58135_ue1","state":{},"fromFragment":false,"impersonatorId":"","isImpersonatedSession":false,"other":"{}"}',
    "signin-success": "true",
    branch_session:
      '{"session_id":"1081044918347199349","identity_id":"1081044918347499644","link":"https://adobesparkpost.app.link?%24identity_id=1081044918347499644","data":"{\\"+clicked_branch_link\\":false,\\"+is_first_session\\":true}","browser_fingerprint_id":"MTAxODAzOTM2MTg2NTc4ODkzMQ==","has_app":false,"identity":null}',
  };
  await page.goto("https://express.adobe.com/sp/search", {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.evaluate((sessionDataObject) => {
    Object.keys(sessionDataObject).forEach((key) =>
      sessionStorage.setItem(key, sessionDataObject[key])
    );
  }, sessionDataObject);
  await page.goto("https://express.adobe.com/sp/search?key=4th of July flyer", {
    waitUntil: ["networkidle2", "domcontentloaded"],
  });
  var adobeTemplate = [];
  await page.screenshot({
    path: "adobe.jpeg",
    type: "jpeg",
    fullPage: true,
    quality: 50,
  });
  adobeTemplate = await page.evaluate(() => {
    var items = [
      ...document
        .querySelector("theo-vertical-masonry")
        .shadowRoot.querySelectorAll("theo-thumbnail"),
    ];
    return items;
  }, []);
  console.log(adobeTemplate.length);
  var limitTop50 = 50;
  if (adobeTemplate.length < 50) {
    limitTop50 = adobeTemplate.length;
  }

  for (var i = 0; i <= 5; i++) {
    // const imageLink = await page.evaluate((adobeTemplate) => {
    //   var link = adobeTemplate[i].querySelector(`.has-cta-div img`)
    //     ? adobeTemplate[i].querySelector(`.has-cta-div img`).getAttribute(`src`)
    //     : "";
    //   return link;
    // }, adobeTemplate);
    // console.log(imageLink);
    console.log(adobeTemplate[i]);
    //console.log(adobeTemplate[i]["__url"]);
    // const imageLink = await page.evaluate(
    //   "adobeTemplate[i].shadowRoot.querySelector(`.has-cta-div img`) ? adobeTemplate[i].shadowRoot.querySelector(`.has-cta-div img`).getAttribute(`src`) : ''"
    // );
    // var imageLink = adobeTemplate[i].shadowRoot
    //   .querySelector(".has-cta-div img")
    //   .getAttribute("src");
  }
  console.log("Done");
  //   await page.screenshot({
  //     path: "adobe.jpeg",
  //     type: "jpeg",
  //     fullPage: true,
  //     quality: 50,
  //   });

  await browser.close();
})();
