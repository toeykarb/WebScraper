var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      console.log(`current link : ${url}`);

      if (body.data == '' || !body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      // var images = $('.item-description .item-description-title a');
      var images = $('.item-description');
      var imgStore = [];
      images.map(async (item) => {
        const link = $(images[item]).find('.item-description-title a').attr('href');
        const checkAuthor = $(images[item]).find('ul .contributor').text();
        //console.log(checkAuthor);
        //const noauthor = $(images[item]).find(".item-description .contributor").text;
        // console.log(checkAuthor);
        if (!checkAuthor) {
          imgStore.push(link);
        }
      });
      setTimeout(() => resolve(imgStore), 500);
    });
  });
}

async function main() {
  var i = 601;

  var result = [];
  while (i <= 700) {
    if (i == 1) {
      var url =
        'https://www.loc.gov/collections/fsa-owi-black-and-white-negatives/?c=150&sp=1&st=list';
    } else {
      var url = `https://www.loc.gov/collections/fsa-owi-black-and-white-negatives/?c=150&sp=${i}&st=list`;
    }
    var scrapingImg = await scraping(url);
    if (scrapingImg.length <= 0) {
      console.log(`All Contributor : ${i}`);
    } else if (scrapingImg == false) {
      console.log(`Error : ${i}`);
    } else {
      result = [...result, ...scrapingImg];
    }

    i++;

    console.log('complete ...... : ' + result.length);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  // console.log(json);
  fs.writeFile('loc-farm-no-contributor-8.json', json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
    return true;
  });
}

main();
