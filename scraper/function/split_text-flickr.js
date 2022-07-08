var fs = require(`fs`);

function main() {
  var strArray = [
    '2022-05-19T03:26:05.241Z	a9c27314-2043-56dc-8bbb-29eb9ab71bf2	INFO	https://www.flickr.com/photos/sowwg2017/36642881930/',
    '2022-05-19T03:25:59.205Z	c7abbb02-d69d-574e-baae-e1fd6c709900	INFO	https://www.flickr.com/photos/sowwg2017/36231845573/',
    '2022-05-19T03:25:56.028Z	3f64d9d5-0497-5d2e-842f-832abe7cb000	INFO	https://www.flickr.com/photos/sowwg2017/36231850283/',
    '2022-05-19T03:25:55.818Z	d834295e-369a-5cd4-8d93-73a18c7591ab	INFO	https://www.flickr.com/photos/sowwg2017/36898772901/',
    '2022-05-19T03:25:54.896Z	982cd58a-5a57-5c72-83c8-8f75e0a5d10d	INFO	https://www.flickr.com/photos/sowwg2017/36642875880/',
    '2022-05-19T03:25:52.222Z	fd461400-d742-505f-a79d-4eff6db60d71	INFO	https://www.flickr.com/photos/sowwg2017/36851451616/',
    '2022-05-19T03:25:51.319Z	6c01ded1-032c-5cee-9492-842eb9c70191	INFO	https://www.flickr.com/photos/sowwg2017/36898724471/',
    '2022-05-19T03:25:50.518Z	10b98275-8d84-54cb-89e7-d88a3763c9b4	INFO	https://www.flickr.com/photos/sowwg2017/36204635084/',
    '2022-05-19T03:25:50.326Z	c7abbb02-d69d-574e-baae-e1fd6c709900	INFO	https://www.flickr.com/photos/sowwg2017/36231844353/',
    '2022-05-19T03:25:50.047Z	3ae8d412-d203-5b45-9903-8eed68e9b66b	INFO	https://www.flickr.com/photos/sowwg2017/36204629964/',
    '2022-05-19T03:25:49.566Z	ac4df242-ae15-5292-b04d-a8bd14ffafbc	INFO	https://www.flickr.com/photos/sowwg2017/36851432236/',
    '2022-05-19T03:25:49.029Z	afc60077-d370-5084-8410-5a88699bbdaa	INFO	https://www.flickr.com/photos/sowwg2017/36898718381/',
    '2022-05-19T03:25:47.953Z	3f64d9d5-0497-5d2e-842f-832abe7cb000	INFO	https://www.flickr.com/photos/sowwg2017/36204640804/',
    '2022-05-19T03:25:47.635Z	85fd6163-8d31-5987-8f0d-3b9c37d707c9	INFO	https://www.flickr.com/photos/sowwg2017/36898658711/',
    '2022-05-19T03:25:47.316Z	828a9252-67f9-5532-ac73-c8addd10581c	INFO	https://www.flickr.com/photos/sowwg2017/36642852010/',
    '2022-05-19T03:25:47.116Z	d834295e-369a-5cd4-8d93-73a18c7591ab	INFO	https://www.flickr.com/photos/sowwg2017/36231848573/',
    '2022-05-19T03:25:47.028Z	982cd58a-5a57-5c72-83c8-8f75e0a5d10d	INFO	https://www.flickr.com/photos/sowwg2017/37039659995/',
    '2022-05-19T03:25:46.457Z	b07c4135-ab33-5124-9727-1bca11d18f6a	INFO	https://www.flickr.com/photos/sowwg2017/36642816550/',
    '2022-05-19T03:25:46.087Z	0b5f8941-9edb-545b-a94f-d3be243c7975	INFO	https://www.flickr.com/photos/sowwg2017/36485486914/',
    '2022-05-19T03:25:45.161Z	57659cc6-5235-55a6-981d-c639e8d678d9	INFO	https://www.flickr.com/photos/sowwg2017/37150528392/',
    '2022-05-19T03:25:44.703Z	558e4d71-093c-54b5-87cc-178eb3e7aafb	INFO	https://www.flickr.com/photos/sowwg2017/36925683020/',
    '2022-05-19T03:25:44.154Z	ba2e0001-76b0-57e8-9fd0-5afecc5419a6	INFO	https://www.flickr.com/photos/sowwg2017/36485487654/',
    '2022-05-19T03:25:43.158Z	42f5f6a1-7049-56db-bc99-ac5ecaa81ba4	INFO	https://www.flickr.com/photos/sowwg2017/36925684990/',
    '2022-05-19T03:25:43.001Z	3dc97926-bbe7-59e3-bbb9-23d9013d849c	INFO	https://www.flickr.com/photos/sowwg2017/37323460935/',
    '2022-05-19T03:25:42.542Z	6c01ded1-032c-5cee-9492-842eb9c70191	INFO	https://www.flickr.com/photos/sowwg2017/36868778692/',
    '2022-05-19T03:25:42.425Z	10b98275-8d84-54cb-89e7-d88a3763c9b4	INFO	https://www.flickr.com/photos/sowwg2017/36509799023/',
    '2022-05-19T03:25:41.851Z	3ae8d412-d203-5b45-9903-8eed68e9b66b	INFO	https://www.flickr.com/photos/sowwg2017/36642862560/',
    '2022-05-19T03:25:41.559Z	ac4df242-ae15-5292-b04d-a8bd14ffafbc	INFO	https://www.flickr.com/photos/sowwg2017/36642867290/',
    '2022-05-19T03:25:41.373Z	1458fab9-4aea-5aaf-8d85-a046f00a6781	INFO	https://www.flickr.com/photos/sowwg2017/36925688060/',
    '2022-05-19T03:25:40.444Z	afc60077-d370-5084-8410-5a88699bbdaa	INFO	https://www.flickr.com/photos/sowwg2017/36851430476/',
    '2022-05-19T03:25:40.218Z	1c530bc4-1a18-5305-8ca2-513ba0c6ee2b	INFO	https://www.flickr.com/photos/sowwg2017/36925679850/',
    '2022-05-19T03:25:39.552Z	828a9252-67f9-5532-ac73-c8addd10581c	INFO	https://www.flickr.com/photos/sowwg2017/36204617744/',
    '2022-05-19T03:25:37.522Z	b07c4135-ab33-5124-9727-1bca11d18f6a	INFO	https://www.flickr.com/photos/sowwg2017/37150521342/',
    '2022-05-19T03:25:37.480Z	0b5f8941-9edb-545b-a94f-d3be243c7975	INFO	https://www.flickr.com/photos/sowwg2017/37132951986/',
    '2022-05-19T03:25:36.551Z	57659cc6-5235-55a6-981d-c639e8d678d9	INFO	https://www.flickr.com/photos/sowwg2017/37150523942/',
    '2022-05-19T03:25:35.971Z	558e4d71-093c-54b5-87cc-178eb3e7aafb	INFO	https://www.flickr.com/photos/sowwg2017/36509779123/',
    '2022-05-19T03:25:35.555Z	ba2e0001-76b0-57e8-9fd0-5afecc5419a6	INFO	https://www.flickr.com/photos/sowwg2017/36868740052/',
    '2022-05-19T03:25:35.331Z	42f5f6a1-7049-56db-bc99-ac5ecaa81ba4	INFO	https://www.flickr.com/photos/sowwg2017/36925682410/',
    '2022-05-19T03:25:35.262Z	41ddd4fd-6a9f-5188-8ca6-8e02d0471cf7	INFO	https://www.flickr.com/photos/sowwg2017/36925677220/',
    '2022-05-19T03:25:35.190Z	b2b5a3f3-f556-561a-b3f8-f90c4f8cd854	INFO	https://www.flickr.com/photos/sowwg2017/37180347671/',
    '2022-05-19T03:25:35.067Z	3dc97926-bbe7-59e3-bbb9-23d9013d849c	INFO	https://www.flickr.com/photos/sowwg2017/36509780563/',
    '2022-05-19T03:25:34.012Z	fa91e242-675b-5a8d-b3a0-b8bddd8ad7f2	INFO	https://www.flickr.com/photos/sowwg2017/36485473094/',
    '2022-05-19T03:25:32.967Z	82b78194-6623-59e0-a91f-db6bdcf247ae	INFO	https://www.flickr.com/photos/sowwg2017/36925676150/',
    '2022-05-19T03:25:32.688Z	1458fab9-4aea-5aaf-8d85-a046f00a6781	INFO	https://www.flickr.com/photos/sowwg2017/37180361221/',
    '2022-05-19T03:25:31.427Z	1c530bc4-1a18-5305-8ca2-513ba0c6ee2b	INFO	https://www.flickr.com/photos/sowwg2017/36925679310/',
    '2022-05-19T03:25:31.092Z	d7eb1cfd-7d02-5038-9954-4602c7d0dd16	INFO	https://www.flickr.com/photos/sowwg2017/37180350571/',
    '2022-05-19T03:25:26.843Z	b2b5a3f3-f556-561a-b3f8-f90c4f8cd854	INFO	https://www.flickr.com/photos/sowwg2017/36925678670/',
    '2022-05-19T03:25:26.524Z	41ddd4fd-6a9f-5188-8ca6-8e02d0471cf7	INFO	https://www.flickr.com/photos/sowwg2017/36485475264/',
    '2022-05-19T03:25:26.427Z	db4d285b-59a3-50bb-8520-72a4e3632ef5	INFO	https://www.flickr.com/photos/sowwg2017/36509771443/',
    '2022-05-19T03:25:26.253Z	f170617c-3c4f-55c1-a88c-3b83868938be	INFO	https://www.flickr.com/photos/sowwg2017/36485460064/',
    '2022-05-19T03:25:25.923Z	fa91e242-675b-5a8d-b3a0-b8bddd8ad7f2	INFO	https://www.flickr.com/photos/sowwg2017/37150500082/',
    '2022-05-19T03:25:25.777Z	1eeaadab-17da-5532-a1bc-f754ad0b581c	INFO	https://www.flickr.com/photos/sowwg2017/36925665390/',
    '2022-05-19T03:25:25.509Z	39fa1744-cf16-53d7-a0f2-4dbb75c7fef9	INFO	https://www.flickr.com/photos/sowwg2017/37150507512/',
    '2022-05-19T03:25:24.175Z	82b78194-6623-59e0-a91f-db6bdcf247ae	INFO	https://www.flickr.com/photos/sowwg2017/37150496202/',
    '2022-05-19T03:25:23.148Z	d7eb1cfd-7d02-5038-9954-4602c7d0dd16	INFO	https://www.flickr.com/photos/sowwg2017/36509776773/',
    '2022-05-19T03:25:18.039Z	f170617c-3c4f-55c1-a88c-3b83868938be	INFO	https://www.flickr.com/photos/sowwg2017/36509770093/',
    '2022-05-19T03:25:17.817Z	1eeaadab-17da-5532-a1bc-f754ad0b581c	INFO	https://www.flickr.com/photos/sowwg2017/36925664530/',
    '2022-05-19T03:25:17.625Z	db4d285b-59a3-50bb-8520-72a4e3632ef5	INFO	https://www.flickr.com/photos/sowwg2017/36509772543/',
    '2022-05-19T03:25:17.203Z	39fa1744-cf16-53d7-a0f2-4dbb75c7fef9	INFO	https://www.flickr.com/photos/sowwg2017/37150494692/',
  ];
  let spiltText = strArray.map((item) => item.split(`	INFO	`)[1]);

  var json = JSON.stringify(spiltText);
  fs.writeFile(`split-text-flickr-test.json`, json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log(`The file was saved!`);
  });
}
main();
