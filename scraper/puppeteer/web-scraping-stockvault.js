const { is } = require("cheerio/lib/api/traversing");
const puppeteer = require("puppeteer");
const { imageExtension, stockphotoTags } = require("./utils");
const { downloadStockvalutFile } = require("./test-fetch");
var internalTags = [];
var tags = [];

(async (config = {}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  stockvaultmonth = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  await page.goto(
    "https://www.stockvault.net/photo/241134/happy-new-year-2018",
    {
      waitUntil: ["networkidle0", "domcontentloaded"],
    }
  );
  await page.waitForTimeout(3000);
  let { authorLink, authorText } = await page.evaluate(() => {
    const authorIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".portfolio-meta *"),
    ].findIndex((node) => node.textContent.trim() === "Author:");

    if (authorIndex !== -1) {
      // @ts-ignore
      const rawAuthorSource = [
        ...document.querySelectorAll(".portfolio-meta *"),
      ][authorIndex + 2];
      if (rawAuthorSource != "") {
        return {
          authorLink: rawAuthorSource.getAttribute("href"),
          authorText: rawAuthorSource.innerText,
        };
      }
    }
    return "";
  });
  var uploadedDate = "";
  uploadedDate = await page.evaluate(() => {
    const uploadedIndex = [
      // @ts-ignore
      ...document.querySelectorAll(".portfolio-meta *"),
    ].findIndex((node) => node.textContent.trim() === "Uploaded:");
    const textSource =
      uploadedIndex !== -1
        ? // @ts-ignore
          [...document.querySelectorAll(".portfolio-meta *")][
            uploadedIndex - 1
          ].textContent.toLowerCase()
        : "";
    return textSource;
  });

  if (uploadedDate) {
    var splitDate = uploadedDate.split(" ");
    var monthNumb = stockvaultmonth.indexOf(splitDate[1].toLowerCase()) + 1;
    var dateNumb = splitDate[2].replace(/\D/g, "");
    const newDate = splitDate[3] + "/" + monthNumb + "/" + dateNumb;
    console.log(newDate);
    if (authorText.trim().toLowerCase() == "pixabay") {
      if (newDate < "2019/01/09") {
        internalTags.push("#pre9jan2019");
      }
    } else if (authorText.trim().toLowerCase() == "unsplash") {
      if (newDate < "2017/06/05") {
        internalTags.push("#pre5june2017");
      }
    }
  }
  console.log(internalTags);
  console.log("done");
  await browser.close();
})();
