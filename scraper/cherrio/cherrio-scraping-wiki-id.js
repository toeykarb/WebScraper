const { is } = require('cheerio/lib/api/traversing');
const puppeteer = require('puppeteer');
var fs = require('fs');

async function scraping(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // page.on('console', (consoleObj) => console.log(consoleObj.text()));

    await page.setViewport({ width: 3000, height: 2000, deviceScaleFactor: 1 });
    await page.goto(url);

    await page.waitForTimeout(3000);

    const data = {
      url,
      link: [],
      internalTags: [],
    };

    data.articleId = '';

    console.log('Get ArticleId');
    data.articleId = await page.evaluate(() => window.RLCONF.wgArticleId);
    console.log(data.articleId);
    await browser.close();
    return data.articleId;
  } catch (error) {
    console.log(error);
    console.log('Error :', url);
    return [];
  }
}

async function main() {
  var url = [
    'https://commons.wikimedia.org/wiki/File:Psammomys_obesus_roudairei_(Psammomys_roudairei)_-_Museo_Civico_di_Storia_Naturale_Giacomo_Doria_-_Genoa,_Italy_-_DSC02815.JPG',
    'https://commons.wikimedia.org/wiki/File:Zav%C3%ADje%C4%8D_zahradn%C3%AD.jpg',
    'https://commons.wikimedia.org/wiki/File:Lisaj_lipovy_3.jpg',
    'https://commons.wikimedia.org/wiki/File:Fort_Lovrijenac.jpg',
    'https://commons.wikimedia.org/wiki/File:Martinac_bukovy_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Vatekov_end_of_village.jpg',
    'https://commons.wikimedia.org/wiki/File:Vatekov_cp18.jpg',
    'https://commons.wikimedia.org/wiki/File:Fort_lovrijenac.jpg',
    'https://commons.wikimedia.org/wiki/File:Zobonosec_kop%C5%99ivov%C3%BD.jpg',
    'https://commons.wikimedia.org/wiki/File:Lisaj_lipovy.jpg',
    'https://commons.wikimedia.org/wiki/File:Bourovec_brezovy.jpg',
    'https://commons.wikimedia.org/wiki/File:Cannabis_sativa_(female).JPG',
    'https://commons.wikimedia.org/wiki/File:Bourovec_brezovy_3.jpg',
    'https://commons.wikimedia.org/wiki/File:Mythimna_l-album.jpg',
    'https://commons.wikimedia.org/wiki/File:Lisaj_lipovy_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Zampach_bridge_1.jpg',
    'https://commons.wikimedia.org/wiki/File:Bekyn%C4%9B_pi%C5%BEmov%C3%A1_-_housenka.jpg',
    'https://commons.wikimedia.org/wiki/File:Bourovec_brezovy_4.jpg',
    'https://commons.wikimedia.org/wiki/File:Tettigonia_viridissima_03.jpg',
    'https://commons.wikimedia.org/wiki/File:Icicles_Kaverna(3).jpg',
    'https://commons.wikimedia.org/wiki/File:Dubrovnik-panorama(2).jpg',
    'https://commons.wikimedia.org/wiki/File:Bourovec_brezovy_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Dubrovnik_from_city_walls.jpg',
    'https://commons.wikimedia.org/wiki/File:Lokrum_island,_Benedictine_monastery.jpg',
    'https://commons.wikimedia.org/wiki/File:Zampach_bridge_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Stemonitis_fusca_Roth,_1787.jpg',
    'https://commons.wikimedia.org/wiki/File:Melolontha_melolontha_2011_05_16.jpg',
    'https://commons.wikimedia.org/wiki/File:Pestrenka_5.jpg',
    'https://commons.wikimedia.org/wiki/File:Pestrenka_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Phasianus_colchicus_Konopiste.jpg',
    'https://commons.wikimedia.org/wiki/File:Advertising_of_Ozujsko_Beer.jpg',
    'https://commons.wikimedia.org/wiki/File:Dubrovnik-panorama.jpg',
    'https://commons.wikimedia.org/wiki/File:Icicles_Kaverna(2).jpg',
    'https://commons.wikimedia.org/wiki/File:Firewood.jpg',
    'https://commons.wikimedia.org/wiki/File:Arctia_caja_2010.jpg',
    'https://commons.wikimedia.org/wiki/File:Pampeliska_lekarska_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Bourovec_brezovy_5.jpg',
    'https://commons.wikimedia.org/wiki/File:Pestrenka_1.jpg',
    'https://commons.wikimedia.org/wiki/File:Vaclav_Jamek.jpg',
    'https://commons.wikimedia.org/wiki/File:Icicles_Kaverna.jpg',
    'https://commons.wikimedia.org/wiki/File:Vatekov_bs.jpg',
    'https://commons.wikimedia.org/wiki/File:Pampeliska_lekarska_1.jpg',
    'https://commons.wikimedia.org/wiki/File:Martinac_bukovy.jpg',
    'https://commons.wikimedia.org/wiki/File:Pitbike.JPG',
    'https://commons.wikimedia.org/wiki/File:Lacerta_agilis_(Vatekov,_2001-07-07).jpg',
    'https://commons.wikimedia.org/wiki/File:Zlin1.jpg',
    'https://commons.wikimedia.org/wiki/File:Sphinx_pinastri_01.jpg',
    'https://commons.wikimedia.org/wiki/File:Nicrophorus_vespillo_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Pexeso_chu_prastevnik_medvedi.jpg',
    'https://commons.wikimedia.org/wiki/File:Eudia_pavonia_2.jpg',
    'https://commons.wikimedia.org/wiki/File:Treble_Clef_Barnstar.svg',
    'https://commons.wikimedia.org/wiki/File:Projekt_CHU_ke_dni_28_11_2010_clanky.png',
    'https://commons.wikimedia.org/wiki/File:Projekt_CHU_ke_dni_28_11_2010_fotografie.png',
    'https://commons.wikimedia.org/wiki/File:Cesko-kraje.svg',
    'https://commons.wikimedia.org/wiki/File:Railway_network_Czech_Republic.svg',
    'https://commons.wikimedia.org/wiki/File:Barnstar_-_protected_areas_in_the_Czech_Republic_Hires.svg',
    'https://commons.wikimedia.org/wiki/File:Mise_A%C4%8CR_v_polovin%C4%9B_roku_2018.png',
  ];
  var result = [];
  for (var i = 0; i < url.length; i++) {
    let items = await scraping(url[i]);
    if (items.length == 0) {
      console.log(`Error : ${url[i]}`);
    } else {
      result.push(items);
    }
    // console.log(json);
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter((value, index, self) => self.indexOf(value) === index);
  console.log(`Unique result : ${getNotDup.length}`);
  var json = JSON.stringify(getNotDup);
  fs.writeFile(`wikiId.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('The file was saved!');
    return true;
  });
}
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 2000);
    });
  });
}

const isElementVisible = async (page, cssSelector) => {
  await autoScroll(page);
  let visible = true;
  await page.waitForSelector(cssSelector, { visible: true, timeout: 4000 }).catch(() => {
    visible = false;
  });
  return visible;
};

const getLink = async (page) => {
  try {
    console.log('scraping....');
    imagelink = await page.evaluate(() => {
      return [...document.querySelectorAll('.sdms-image-result')].map((a) => {
        let item = a.getAttribute('href');
        return item;
      });
    });
  } catch (error) {
    console.log(error);
    return [];
  }
  return imagelink;
};
main();
