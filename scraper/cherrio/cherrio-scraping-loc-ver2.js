var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

async function scraping(url) {
  return new Promise((resolve) => {
    request(url, async function (error, response, body) {
      //console.log(`current link : ${url}`);
      if (!body) {
        setTimeout(() => resolve(false), 500);
      }

      var $ = cheerio.load(body);

      var images = $('#select-resource0');

      if (images?.length) {
        console.log('have resource', url);
        resolve(url);
      }
      resolve(false);
    });
  });
}

async function main() {
  var url = [
    'https://www.loc.gov/item/2005681316/',
    'https://www.loc.gov/item/2005681320/',
    'https://www.loc.gov/item/2005681331/',
    'https://www.loc.gov/item/2005681422/',
    'https://www.loc.gov/item/2005689612/',
    'https://www.loc.gov/item/2005689613/',
    'https://www.loc.gov/item/2005689640/',
    'https://www.loc.gov/item/2005689644/',
    'https://www.loc.gov/item/2005689646/',
    'https://www.loc.gov/item/2005689647/',
    'https://www.loc.gov/item/2005691821/',
    'https://www.loc.gov/item/2005691822/',
    'https://www.loc.gov/item/2005691824/',
    'https://www.loc.gov/item/2005693001/',
    'https://www.loc.gov/item/2006676235/',
    'https://www.loc.gov/item/2006676309/',
    'https://www.loc.gov/item/2006676333/',
    'https://www.loc.gov/item/2006677502/',
    'https://www.loc.gov/item/2005687048/',
    'https://www.loc.gov/item/2005687049/',
    'https://www.loc.gov/item/2005685850/',
    'https://www.loc.gov/item/2005685856/',
    'https://www.loc.gov/item/2005685857/',
    'https://www.loc.gov/item/2004672489/',
    'https://www.loc.gov/item/2004672492/',
    'https://www.loc.gov/item/2004672495/',
    'https://www.loc.gov/item/2004672498/',
    'https://www.loc.gov/item/2004672499/',
    'https://www.loc.gov/item/2004672500/',
    'https://www.loc.gov/item/2004672501/',
    'https://www.loc.gov/item/2004676724/',
    'https://www.loc.gov/item/2006679539/',
    'https://www.loc.gov/item/2002712125/',
    'https://www.loc.gov/item/2002712247/',
    'https://www.loc.gov/item/2002712248/',
    'https://www.loc.gov/item/2001701650/',
    'https://www.loc.gov/item/2001701658/',
    'https://www.loc.gov/item/2001701666/',
    'https://www.loc.gov/item/2001701667/',
    'https://www.loc.gov/item/2001701680/',
    'https://www.loc.gov/item/2001701681/',
    'https://www.loc.gov/item/2001701692/',
    'https://www.loc.gov/item/2001701705/',
    'https://www.loc.gov/item/2001701706/',
    'https://www.loc.gov/item/2001701715/',
    'https://www.loc.gov/item/2001699011/',
    'https://www.loc.gov/item/2001699973/',
    'https://www.loc.gov/item/2001699978/',
    'https://www.loc.gov/item/2001699990/',
    'https://www.loc.gov/item/2001699992/',
    'https://www.loc.gov/item/2001699993/',
    'https://www.loc.gov/item/2001700250/',
    'https://www.loc.gov/item/2001700255/',
    'https://www.loc.gov/item/2001700256/',
    'https://www.loc.gov/item/2001700257/',
    'https://www.loc.gov/item/2006686131/',
    'https://www.loc.gov/item/2007675047/',
    'https://www.loc.gov/item/2007675048/',
    'https://www.loc.gov/item/2007680505/',
    'https://www.loc.gov/item/2006680380/',
    'https://www.loc.gov/item/2006680382/',
    'https://www.loc.gov/item/2006680159/',
    'https://www.loc.gov/item/2006680203/',
    'https://www.loc.gov/item/2006683721/',
    'https://www.loc.gov/item/2006683736/',
    'https://www.loc.gov/item/2006683737/',
    'https://www.loc.gov/item/2006683769/',
    'https://www.loc.gov/item/2006683771/',
    'https://www.loc.gov/item/2006683775/',
    'https://www.loc.gov/item/2006683778/',
    'https://www.loc.gov/item/2006683780/',
    'https://www.loc.gov/item/2006683781/',
    'https://www.loc.gov/item/2006683786/',
    'https://www.loc.gov/item/2006683787/',
    'https://www.loc.gov/item/2006683789/',
    'https://www.loc.gov/item/2006683790/',
    'https://www.loc.gov/item/2006691467/',
    'https://www.loc.gov/item/2007676218/',
    'https://www.loc.gov/item/2010646098/',
    'https://www.loc.gov/item/2010651660/',
    'https://www.loc.gov/item/2010651672/',
    'https://www.loc.gov/item/2010651674/',
    'https://www.loc.gov/item/2010651675/',
    'https://www.loc.gov/item/2010651676/',
    'https://www.loc.gov/item/2010651679/',
    'https://www.loc.gov/item/2010651681/',
    'https://www.loc.gov/item/2010651682/',
    'https://www.loc.gov/item/2010651685/',
    'https://www.loc.gov/item/2010651698/',
    'https://www.loc.gov/item/2010651017/',
    'https://www.loc.gov/item/2010651018/',
    'https://www.loc.gov/item/2010651044/',
    'https://www.loc.gov/item/2001696155/',
    'https://www.loc.gov/item/2001696156/',
    'https://www.loc.gov/item/2001696157/',
    'https://www.loc.gov/item/2001696160/',
    'https://www.loc.gov/item/2001696161/',
    'https://www.loc.gov/item/2001696168/',
    'https://www.loc.gov/item/2001695931/',
    'https://www.loc.gov/item/2001695935/',
    'https://www.loc.gov/item/2001695938/',
    'https://www.loc.gov/item/2001695942/',
    'https://www.loc.gov/item/2001695944/',
    'https://www.loc.gov/item/2001695977/',
    'https://www.loc.gov/item/2001695979/',
    'https://www.loc.gov/item/00653123/',
    'https://www.loc.gov/item/2001522615/',
    'https://www.loc.gov/item/00652696/',
    'https://www.loc.gov/item/00652699/',
    'https://www.loc.gov/item/00652623/',
    'https://www.loc.gov/item/00652639/',
    'https://www.loc.gov/item/00652490/',
    'https://www.loc.gov/item/00652491/',
    'https://www.loc.gov/item/00652493/',
    'https://www.loc.gov/item/00652496/',
    'https://www.loc.gov/item/00652499/',
    'https://www.loc.gov/item/00651657/',
    'https://www.loc.gov/item/00652118/',
    'https://www.loc.gov/item/00652139/',
    'https://www.loc.gov/item/00651013/',
    'https://www.loc.gov/item/00651014/',
    'https://www.loc.gov/item/00651016/',
    'https://www.loc.gov/item/00651018/',
    'https://www.loc.gov/item/00651024/',
    'https://www.loc.gov/item/00651034/',
    'https://www.loc.gov/item/00651108/',
    'https://www.loc.gov/item/00651109/',
    'https://www.loc.gov/item/00651110/',
    'https://www.loc.gov/item/00651111/',
    'https://www.loc.gov/item/00651469/',
    'https://www.loc.gov/item/00651470/',
    'https://www.loc.gov/item/00651539/',
    'https://www.loc.gov/item/00650720/',
    'https://www.loc.gov/item/00650721/',
    'https://www.loc.gov/item/00650723/',
    'https://www.loc.gov/item/00650477/',
    'https://www.loc.gov/item/00650608/',
    'https://www.loc.gov/item/00650610/',
    'https://www.loc.gov/item/00650613/',
    'https://www.loc.gov/item/00650625/',
    'https://www.loc.gov/item/2001695798/',
    'https://www.loc.gov/item/2001695469/',
    'https://www.loc.gov/item/2001695475/',
    'https://www.loc.gov/item/2001695480/',
    'https://www.loc.gov/item/2001695485/',
    'https://www.loc.gov/item/2001695489/',
    'https://www.loc.gov/item/2001695493/',
    'https://www.loc.gov/item/2001695497/',
    'https://www.loc.gov/item/2001695499/',
    'https://www.loc.gov/item/00649639/',
    'https://www.loc.gov/item/00649643/',
    'https://www.loc.gov/item/00649668/',
    'https://www.loc.gov/item/00649669/',
    'https://www.loc.gov/item/00649670/',
    'https://www.loc.gov/item/00649675/',
    'https://www.loc.gov/item/00649676/',
    'https://www.loc.gov/item/00649677/',
    'https://www.loc.gov/item/00649678/',
    'https://www.loc.gov/item/00649681/',
    'https://www.loc.gov/item/00649682/',
    'https://www.loc.gov/item/00649683/',
    'https://www.loc.gov/item/00649796/',
    'https://www.loc.gov/item/00649798/',
    'https://www.loc.gov/item/00649801/',
    'https://www.loc.gov/item/00649824/',
    'https://www.loc.gov/item/00649829/',
    'https://www.loc.gov/item/00649839/',
    'https://www.loc.gov/item/00649840/',
    'https://www.loc.gov/item/00649846/',
    'https://www.loc.gov/item/00649856/',
    'https://www.loc.gov/item/00649863/',
    'https://www.loc.gov/item/00649636/',
    'https://www.loc.gov/item/2001696763/',
    'https://www.loc.gov/item/2001696767/',
    'https://www.loc.gov/item/2001696769/',
    'https://www.loc.gov/item/2001697018/',
    'https://www.loc.gov/item/2001697030/',
    'https://www.loc.gov/item/2001697038/',
    'https://www.loc.gov/item/2002695475/',
    'https://www.loc.gov/item/2002695485/',
    'https://www.loc.gov/item/2002695200/',
    'https://www.loc.gov/item/2002695204/',
    'https://www.loc.gov/item/2002695206/',
    'https://www.loc.gov/item/2002695217/',
    'https://www.loc.gov/item/2002695224/',
    'https://www.loc.gov/item/2002695230/',
    'https://www.loc.gov/item/2002695248/',
    'https://www.loc.gov/item/2015647634/',
    'https://www.loc.gov/item/2015647637/',
    'https://www.loc.gov/item/2014645268/',
    'https://www.loc.gov/item/2014645389/',
    'https://www.loc.gov/item/2014645390/',
    'https://www.loc.gov/item/2011645500/',
    'https://www.loc.gov/item/2012648051/',
    'https://www.loc.gov/item/2012648052/',
    'https://www.loc.gov/item/2012648156/',
    'https://www.loc.gov/item/2012648221/',
    'https://www.loc.gov/item/2012648223/',
    'https://www.loc.gov/item/2013646620/',
    'https://www.loc.gov/item/2013646621/',
    'https://www.loc.gov/item/2013646615/',
    'https://www.loc.gov/item/2013646617/',
    'https://www.loc.gov/item/2013646618/',
    'https://www.loc.gov/item/2013646619/',
    'https://www.loc.gov/item/2013645760/',
    'https://www.loc.gov/item/2014649252/',
    'https://www.loc.gov/item/2015647249/',
    'https://www.loc.gov/item/2015647258/',
    'https://www.loc.gov/item/2015647263/',
    'https://www.loc.gov/item/2015647265/',
    'https://www.loc.gov/item/2015647271/',
    'https://www.loc.gov/item/2015647272/',
    'https://www.loc.gov/item/2015647274/',
    'https://www.loc.gov/item/2015647278/',
    'https://www.loc.gov/item/2015647282/',
    'https://www.loc.gov/item/2015647283/',
    'https://www.loc.gov/item/2015647287/',
    'https://www.loc.gov/item/2010651735/',
    'https://www.loc.gov/item/2011648217/',
    'https://www.loc.gov/item/2011645203/',
    'https://www.loc.gov/item/2011648255/',
    'https://www.loc.gov/item/2015646070/',
    'https://www.loc.gov/item/2015646078/',
    'https://www.loc.gov/item/2016647814/',
    'https://www.loc.gov/item/2016647875/',
    'https://www.loc.gov/item/2016647750/',
    'https://www.loc.gov/item/2016647752/',
    'https://www.loc.gov/item/2014646054/',
    'https://www.loc.gov/item/2014646204/',
    'https://www.loc.gov/item/2014646205/',
    'https://www.loc.gov/item/2014646206/',
    'https://www.loc.gov/item/2014646207/',
    'https://www.loc.gov/item/2014646208/',
    'https://www.loc.gov/item/2014648263/',
    'https://www.loc.gov/item/2014648280/',
    'https://www.loc.gov/item/2016646270/',
    'https://www.loc.gov/item/2016646274/',
    'https://www.loc.gov/item/2016646103/',
    'https://www.loc.gov/item/2016646106/',
    'https://www.loc.gov/item/2016649576/',
    'https://www.loc.gov/item/2016649583/',
    'https://www.loc.gov/item/2015651120/',
    'https://www.loc.gov/item/2015650651/',
    'https://www.loc.gov/item/2015650658/',
    'https://www.loc.gov/item/2015650662/',
    'https://www.loc.gov/item/2015650666/',
    'https://www.loc.gov/item/2015650668/',
    'https://www.loc.gov/item/2015650674/',
    'https://www.loc.gov/item/2015650684/',
    'https://www.loc.gov/item/2015650686/',
    'https://www.loc.gov/item/2015650688/',
    'https://www.loc.gov/item/2015650689/',
    'https://www.loc.gov/item/2015650690/',
    'https://www.loc.gov/item/2015650698/',
    'https://www.loc.gov/item/2015650700/',
    'https://www.loc.gov/item/2015650701/',
    'https://www.loc.gov/item/2015650852/',
    'https://www.loc.gov/item/2015650854/',
    'https://www.loc.gov/item/2020638043/',
    'https://www.loc.gov/item/2020638044/',
    'https://www.loc.gov/item/2020630192/',
    'https://www.loc.gov/item/2021635525/',
    'https://www.loc.gov/item/2021635526/',
    'https://www.loc.gov/item/2021638459/',
    'https://www.loc.gov/item/2016651613/',
    'https://www.loc.gov/item/2019630501/',
    'https://www.loc.gov/item/2019630502/',
    'https://www.loc.gov/item/2019630516/',
    'https://www.loc.gov/item/2019630517/',
    'https://www.loc.gov/item/2019630519/',
    'https://www.loc.gov/item/2019630520/',
    'https://www.loc.gov/item/2019647159/',
    'https://www.loc.gov/item/2019647161/',
    'https://www.loc.gov/item/2019647164/',
    'https://www.loc.gov/item/2020630741/',
    'https://www.loc.gov/item/2019632903/',
    'https://www.loc.gov/item/2019632904/',
    'https://www.loc.gov/item/2019632906/',
    'https://www.loc.gov/item/2019632908/',
    'https://www.loc.gov/item/2019632910/',
    'https://www.loc.gov/item/2019632911/',
    'https://www.loc.gov/item/2019632916/',
    'https://www.loc.gov/item/2019632925/',
    'https://www.loc.gov/item/2019630589/',
    'https://www.loc.gov/item/2019630590/',
    'https://www.loc.gov/item/2019630591/',
    'https://www.loc.gov/item/2019630592/',
    'https://www.loc.gov/item/2020632287/',
    'https://www.loc.gov/item/2020632290/',
    'https://www.loc.gov/item/2020632291/',
    'https://www.loc.gov/item/2020632303/',
    'https://www.loc.gov/item/2007686602/',
    'https://www.loc.gov/item/2007686609/',
    'https://www.loc.gov/item/2009633850/',
    'https://www.loc.gov/item/2009633852/',
    'https://www.loc.gov/item/2009633854/',
    'https://www.loc.gov/item/2009633855/',
    'https://www.loc.gov/item/2009633860/',
    'https://www.loc.gov/item/2009633861/',
    'https://www.loc.gov/item/2009633862/',
    'https://www.loc.gov/item/2009633863/',
    'https://www.loc.gov/item/2009633864/',
    'https://www.loc.gov/item/2009633865/',
    'https://www.loc.gov/item/2009633866/',
    'https://www.loc.gov/item/2009633867/',
    'https://www.loc.gov/item/2009633868/',
    'https://www.loc.gov/item/2009633869/',
    'https://www.loc.gov/item/2009633870/',
    'https://www.loc.gov/item/2009633874/',
    'https://www.loc.gov/item/2009633875/',
    'https://www.loc.gov/item/2009633876/',
    'https://www.loc.gov/item/2009633877/',
    'https://www.loc.gov/item/2010645552/',
    'https://www.loc.gov/item/2010645563/',
    'https://www.loc.gov/item/2010645564/',
    'https://www.loc.gov/item/2010645566/',
    'https://www.loc.gov/item/2010645700/',
    'https://www.loc.gov/item/2010645701/',
    'https://www.loc.gov/item/2010645702/',
    'https://www.loc.gov/item/2010645703/',
    'https://www.loc.gov/item/2010645704/',
    'https://www.loc.gov/item/2010645705/',
    'https://www.loc.gov/item/2010645706/',
    'https://www.loc.gov/item/2010645707/',
    'https://www.loc.gov/item/2009633178/',
    'https://www.loc.gov/item/2009633179/',
    'https://www.loc.gov/item/2009633301/',
    'https://www.loc.gov/item/2009633302/',
    'https://www.loc.gov/item/2009633303/',
    'https://www.loc.gov/item/2009633304/',
    'https://www.loc.gov/item/2009633305/',
    'https://www.loc.gov/item/2009633306/',
    'https://www.loc.gov/item/2009633308/',
    'https://www.loc.gov/item/2009633309/',
    'https://www.loc.gov/item/2009633313/',
    'https://www.loc.gov/item/2009633314/',
    'https://www.loc.gov/item/2009633316/',
    'https://www.loc.gov/item/2009633317/',
    'https://www.loc.gov/item/2009633318/',
    'https://www.loc.gov/item/2009633321/',
    'https://www.loc.gov/item/2009633322/',
    'https://www.loc.gov/item/2009633323/',
    'https://www.loc.gov/item/2009633324/',
    'https://www.loc.gov/item/2009633325/',
    'https://www.loc.gov/item/2009633327/',
    'https://www.loc.gov/item/2009633330/',
    'https://www.loc.gov/item/2009633331/',
    'https://www.loc.gov/item/2009633339/',
    'https://www.loc.gov/item/2009633342/',
    'https://www.loc.gov/item/2009633344/',
    'https://www.loc.gov/item/2009633346/',
    'https://www.loc.gov/item/2009633348/',
    'https://www.loc.gov/item/2009633349/',
    'https://www.loc.gov/item/2009655017/',
    'https://www.loc.gov/item/2010645733/',
    'https://www.loc.gov/item/2010645734/',
    'https://www.loc.gov/item/2010645735/',
    'https://www.loc.gov/item/2010645736/',
    'https://www.loc.gov/item/2010645737/',
    'https://www.loc.gov/item/2010645758/',
    'https://www.loc.gov/item/2010645759/',
    'https://www.loc.gov/item/2010645760/',
    'https://www.loc.gov/item/2010645767/',
    'https://www.loc.gov/item/2010645769/',
    'https://www.loc.gov/item/2010645781/',
    'https://www.loc.gov/item/2012647181/',
    'https://www.loc.gov/item/2012647186/',
    'https://www.loc.gov/item/2012647196/',
    'https://www.loc.gov/item/2012647197/',
    'https://www.loc.gov/item/2012647199/',
    'https://www.loc.gov/item/2012647128/',
    'https://www.loc.gov/item/2012647133/',
    'https://www.loc.gov/item/2012646991/',
    'https://www.loc.gov/item/2012646993/',
    'https://www.loc.gov/item/2012646994/',
    'https://www.loc.gov/item/2012646997/',
    'https://www.loc.gov/item/2012646999/',
    'https://www.loc.gov/item/2012647000/',
    'https://www.loc.gov/item/2012647019/',
    'https://www.loc.gov/item/2012647022/',
    'https://www.loc.gov/item/2012647023/',
    'https://www.loc.gov/item/2013648245/',
    'https://www.loc.gov/item/2013648250/',
    'https://www.loc.gov/item/2008677567/',
    'https://www.loc.gov/item/2008677607/',
    'https://www.loc.gov/item/2008677618/',
    'https://www.loc.gov/item/2009631541/',
    'https://www.loc.gov/item/2009631584/',
    'https://www.loc.gov/item/2009630803/',
    'https://www.loc.gov/item/2009630906/',
    'https://www.loc.gov/item/2009630918/',
    'https://www.loc.gov/item/2011645151/',
    'https://www.loc.gov/item/2011645155/',
    'https://www.loc.gov/item/2011645158/',
    'https://www.loc.gov/item/2011645161/',
    'https://www.loc.gov/item/2011645169/',
    'https://www.loc.gov/item/2011645171/',
    'https://www.loc.gov/item/2008676232/',
    'https://www.loc.gov/item/2008675630/',
    'https://www.loc.gov/item/2008675665/',
    'https://www.loc.gov/item/2008675688/',
    'https://www.loc.gov/item/2008677653/',
    'https://www.loc.gov/item/2008677672/',
    'https://www.loc.gov/item/2008677683/',
    'https://www.loc.gov/item/2008677684/',
    'https://www.loc.gov/item/2008677688/',
    'https://www.loc.gov/item/2008677726/',
    'https://www.loc.gov/item/2008677727/',
    'https://www.loc.gov/item/2011661548/',
    'https://www.loc.gov/item/2011661650/',
    'https://www.loc.gov/item/2011661651/',
    'https://www.loc.gov/item/2011661652/',
    'https://www.loc.gov/item/2011661653/',
    'https://www.loc.gov/item/2013645648/',
    'https://www.loc.gov/item/2013645652/',
    'https://www.loc.gov/item/2013645757/',
    'https://www.loc.gov/item/2013645758/',
    'https://www.loc.gov/item/2012649124/',
    'https://www.loc.gov/item/2012649125/',
    'https://www.loc.gov/item/2012649126/',
    'https://www.loc.gov/item/2012649128/',
    'https://www.loc.gov/item/2013650114/',
    'https://www.loc.gov/item/2013650136/',
    'https://www.loc.gov/item/2013650146/',
    'https://www.loc.gov/item/2013650147/',
    'https://www.loc.gov/item/2013650282/',
    'https://www.loc.gov/item/2013650291/',
    'https://www.loc.gov/item/2013650292/',
    'https://www.loc.gov/item/2013650293/',
    'https://www.loc.gov/item/2013650337/',
    'https://www.loc.gov/item/2013650338/',
    'https://www.loc.gov/item/2013650340/',
    'https://www.loc.gov/item/2013650360/',
    'https://www.loc.gov/item/2013650170/',
    'https://www.loc.gov/item/2013650171/',
    'https://www.loc.gov/item/2013650172/',
    'https://www.loc.gov/item/2013650173/',
    'https://www.loc.gov/item/2013650174/',
    'https://www.loc.gov/item/2008680190/',
    'https://www.loc.gov/item/2008678800/',
    'https://www.loc.gov/item/2008680580/',
    'https://www.loc.gov/item/2008680581/',
    'https://www.loc.gov/item/2009632925/',
    'https://www.loc.gov/item/2009632928/',
    'https://www.loc.gov/item/2009632930/',
    'https://www.loc.gov/item/2009632931/',
    'https://www.loc.gov/item/2009632936/',
    'https://www.loc.gov/item/2009632937/',
    'https://www.loc.gov/item/2009632938/',
    'https://www.loc.gov/item/2009632939/',
    'https://www.loc.gov/item/2009632940/',
    'https://www.loc.gov/item/2009632942/',
    'https://www.loc.gov/item/2009632943/',
    'https://www.loc.gov/item/2009632944/',
    'https://www.loc.gov/item/2009632945/',
    'https://www.loc.gov/item/2009632947/',
    'https://www.loc.gov/item/2009632948/',
    'https://www.loc.gov/item/2009632949/',
    'https://www.loc.gov/item/2009633140/',
    'https://www.loc.gov/item/2009633143/',
    'https://www.loc.gov/item/2009632215/',
    'https://www.loc.gov/item/2019642075/',
    'https://www.loc.gov/item/2019642079/',
    'https://www.loc.gov/item/2019642080/',
    'https://www.loc.gov/item/cph30456/',
    'https://www.loc.gov/item/95517256/',
    'https://www.loc.gov/item/95517420/',
    'https://www.loc.gov/item/95514416/',
    'https://www.loc.gov/item/95514647/',
    'https://www.loc.gov/item/95513789/',
    'https://www.loc.gov/item/95513804/',
    'https://www.loc.gov/item/95512251/',
    'https://www.loc.gov/item/95510102/',
    'https://www.loc.gov/item/95511443/',
    'https://www.loc.gov/item/95514178/',
    'https://www.loc.gov/item/96508813/',
    'https://www.loc.gov/item/96503966/',
    'https://www.loc.gov/item/95506948/',
    'https://www.loc.gov/item/95506959/',
    'https://www.loc.gov/item/95504102/',
    'https://www.loc.gov/item/94506810/',
    'https://www.loc.gov/item/94506869/',
    'https://www.loc.gov/item/94506880/',
    'https://www.loc.gov/item/94506925/',
    'https://www.loc.gov/item/94510896/',
    'https://www.loc.gov/item/94511028/',
    'https://www.loc.gov/item/94510107/',
    'https://www.loc.gov/item/94510117/',
    'https://www.loc.gov/item/94512329/',
    'https://www.loc.gov/item/96500535/',
    'https://www.loc.gov/item/94506109/',
    'https://www.loc.gov/item/94506130/',
    'https://www.loc.gov/item/93513221/',
    'https://www.loc.gov/item/94500293/',
    'https://www.loc.gov/item/93506539/',
    'https://www.loc.gov/item/93509908/',
    'https://www.loc.gov/item/94505573/',
    'https://www.loc.gov/item/94505657/',
    'https://www.loc.gov/item/94504244/',
    'https://www.loc.gov/item/94504623/',
  ];
  var result = [];
  console.log(url.length);
  for (var i = 0; i < url.length; i++) {
    var scrapingImg = await scraping(url[i]);
    console.log(`current : ${url[i]}`);
    // if (scrapingImg == false) {
    //   console.log(`Error : ${url[i]}`);
    // }
    if (scrapingImg) {
      result = [...result, scrapingImg];
    }
  }
  console.log('result : ' + result.length);
  var json = JSON.stringify(result);

  fs.writeFile(`check-loc-noresource5.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
    return true;
  });
}

main();
