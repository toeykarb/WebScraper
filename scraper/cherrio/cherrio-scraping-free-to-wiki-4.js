var fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scraping(url) {
  // try {
  const browser = await puppeteer.launch({
    headless: true,
    // devtools: true,
  });
  const page = await browser.newPage();
  let imagelink = [];
  try {
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.goto(url);

    console.log("current link : ", url);
    imagelink = await page.evaluate(
      "[...document.querySelectorAll('#wn .tcase>a')].map(a => a.getAttribute('href'))"
    );
    // imagelink = await page.evaluate(() => {
    //   [...document.querySelectorAll("#wn .tcase>a")].map((a) => {
    //     var test = "";
    //     if (a.textContent.toLowerCase() == "wikimedia") {
    //       test = a.getAttribute("href");
    //     }
    //     return test;
    //   });
    // });
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close();
  }
  return imagelink;
}

async function main() {
  var result = [];
  var url = [
    "https://free-images.com/display/jean_baptiste_jupille_dessin.html",
    "https://free-images.com/display/jean_de_paleologu_jules.html",
    "https://free-images.com/display/jenaro_perez_villaamil_view.html",
    "https://free-images.com/display/jesus_christ_faith_cross.html",
    "https://free-images.com/display/jewish_children_with_their_0.html",
    "https://free-images.com/display/jimmy_carter_with_robert_0.html",
    "https://free-images.com/display/johannes_ritter_1622_1700.html",
    "https://free-images.com/display/johannes_verspronck_portret_van.html",
    "https://free-images.com/display/john_constable_hove_beach.html",
    "https://free-images.com/display/john_f_kennedy.html",
    "https://free-images.com/display/john_fiechter_house.html",
    "https://free-images.com/display/john_frederick_lewis_street_0.html",
    "https://free-images.com/display/john_ormerod_scarlett_thursby.html",
    "https://free-images.com/display/john_p_parker_house.html",
    "https://free-images.com/display/john_speed_wales.html",
    "https://free-images.com/display/jose_de_ribera_054.html",
    "https://free-images.com/display/josephhuddartzh_jpeg.html",
    "https://free-images.com/display/jstalin_secretary_general_cccp_0.html",
    "https://free-images.com/display/jtf_guantanamo_detainees_kneel.html",
    "https://free-images.com/display/jug_740_bc_staatliche.html",
    "https://free-images.com/display/jura_lake_belvedere_panorama.html",
    "https://free-images.com/display/jurij_subic_janez_vajkard.html",
    "https://free-images.com/display/kangaroo_young_animal_zoo.html",
    "https://free-images.com/display/kantaji_temple_1870s.html",
    "https://free-images.com/display/kashima_stadium_4.html",
    "https://free-images.com/display/kc_135_stratotanker.html",
    "https://free-images.com/display/key_keychain_close_up.html",
    "https://free-images.com/display/3_marc_in_snow_0.html",
    "https://free-images.com/display/apple_norms_size_standards.html",
    "https://free-images.com/display/bibliotekarien_genomlyst_skoklosters_slo.html",
    "https://free-images.com/display/bibliotekarien_grovkittad_for_konserveri.html",
    "https://free-images.com/display/bibliotekarien_i_slapljus_skoklosters.html",
    "https://free-images.com/display/bibliotekarien_i_uv_ljus.html",
    "https://free-images.com/display/bibliotekarien_innan_konservering_skoklo.html",
    "https://free-images.com/display/concorde_british_airways.html",
    "https://free-images.com/display/construction_industry_crane_leaves.html",
    "https://free-images.com/display/easter_eggs_1.html",
    "https://free-images.com/display/eye_wildlife.html",
    "https://free-images.com/display/four_roger_puta_sunset_0.html",
    "https://free-images.com/display/gifts_packages_made_loop.html",
    "https://free-images.com/display/grass_green_weeds.html",
    "https://free-images.com/display/happy_panda.html",
    "https://free-images.com/display/houses_village_boats_harbor.html",
    "https://free-images.com/display/houses_village_italy_architecture.html",
    "https://free-images.com/display/love_cookies.html",
    "https://free-images.com/display/pixella15063.html",
    "https://free-images.com/display/pixella15954.html",
    "https://free-images.com/display/red_panda_109.html",
    "https://free-images.com/display/star_alliance_737_881_0.html",
    "https://free-images.com/display/teatro_san_carlo_large.html",
    "https://free-images.com/display/the_city_awakens.html",
    "https://free-images.com/display/une_turquoise_sur_la.html",
    "https://free-images.com/display/via_6764_november_1981.html",
    "https://free-images.com/display/via_6764_train_134.html",
    "https://free-images.com/display/via_6770_at_burlington.html",
    "https://free-images.com/display/via_6780_train_133.html",
    "https://free-images.com/display/vue_sur_le_vieux_0.html",
    "https://free-images.com/display/008_protest_in_munich.html",
    "https://free-images.com/display/1463_pleydenwurff_portait_eines.html",
    "https://free-images.com/display/1492_signorelli_portrait_an.html",
    "https://free-images.com/display/1559_aertsen_marktstueck_mit.html",
    "https://free-images.com/display/160528_n_of476_170.html",
    "https://free-images.com/display/1669_leemans_stillleben_mit.html",
    "https://free-images.com/display/16_2_8_2005.html",
    "https://free-images.com/display/1724_de_lisle_map.html",
    "https://free-images.com/display/1771_bonne_map_arabia.html",
    "https://free-images.com/display/1797_tiepolo_pulcinellas_vater.html",
    "https://free-images.com/display/17_9_3_1964.html",
    "https://free-images.com/display/1823_blechen_baume_im.html",
    "https://free-images.com/display/1823_volcker_blumenstilleben_anagoria.html",
    "https://free-images.com/display/1827_volcker_stilleben_mit.html",
    "https://free-images.com/display/1828_eddy_map_new.html",
    "https://free-images.com/display/1835_david_burr_map.html",
    "https://free-images.com/display/1838_waldmuller_blick_auf.html",
    "https://free-images.com/display/1859_menzel_wolkenstudie_anagoria.html",
    "https://free-images.com/display/1868_bishop_pocket_map.html",
    "https://free-images.com/display/1870_feuerbach_ruhende_nymphe.html",
    "https://free-images.com/display/1875_boecklin_sirenen_anagoria.html",
    "https://free-images.com/display/1875_monticelli_anstreicher_an.html",
    "https://free-images.com/display/1878_logerot_map_paris.html",
    "https://free-images.com/display/1879_stanford_pocket_map.html",
    "https://free-images.com/display/1881_liebermann_freistunde_im.html",
    "https://free-images.com/display/1888_hodler_bildnis_helene.html",
    "https://free-images.com/display/1889_rohlfs_berkaer_landstrasse.html",
    "https://free-images.com/display/1890_bacon_pocket_map.html",
    "https://free-images.com/display/1891_gauguin_tahitianische_fischerinnen.html",
    "https://free-images.com/display/1893_holder_die_kindheit.html",
    "https://free-images.com/display/1893_rohlfs_chaussee_nach.html",
    "https://free-images.com/display/1900_baum_weiden_am.html",
    "https://free-images.com/display/1909_roederstein_portrait_jakob.html",
    "https://free-images.com/display/1911_marc_liegender_hund.html",
    "https://free-images.com/display/1912_macke_walterchens_spielsachen.html",
    "https://free-images.com/display/1914_rohlfs_versuchung_christi.html",
    "https://free-images.com/display/1918_muller_adam_und.html",
    "https://free-images.com/display/1928_mueller_zigeunerpferd_am.html",
    "https://free-images.com/display/1930_kolle_selbstbildnis_anagoria.html",
    "https://free-images.com/display/2005_06_15_hardegg_0.html",
    "https://free-images.com/display/20121011remich3.html",
    "https://free-images.com/display/2012_gay_pride_parade.html",
    "https://free-images.com/display/2012_gay_pride_parade_1.html",
    "https://free-images.com/display/2012_gay_pride_parade_3.html",
    "https://free-images.com/display/2012_gay_pride_parade_6.html",
    "https://free-images.com/display/2012_gay_pride_parade_9.html",
    "https://free-images.com/display/2014_07_28_eidul_3.html",
    "https://free-images.com/display/20160526_duisburg_835_29083394163.html",
    "https://free-images.com/display/20160611_duisburg_250_29626555961.html",
    "https://free-images.com/display/20160611_duisburg_2_29596628472.html",
    "https://free-images.com/display/5214_germantown_ave.html",
    "https://free-images.com/display/5263_forepark.html",
    "https://free-images.com/display/7_man_in_suit.html",
    "https://free-images.com/display/8799_104_001.html",
    "https://free-images.com/display/8799_104_009.html",
    "https://free-images.com/display/8799_104_015.html",
    "https://free-images.com/display/8799_104_017.html",
    "https://free-images.com/display/a_bull_moose_animal.html",
    "https://free-images.com/display/a_close_up_view_0.html",
    "https://free-images.com/display/a_close_up_view_2.html",
    "https://free-images.com/display/a_close_up_view_3.html",
    "https://free-images.com/display/a_close_view_bloodroot.html",
    "https://free-images.com/display/a_curious_pacific_walrus.html",
    "https://free-images.com/display/a_group_stunning_maple.html",
    "https://free-images.com/display/a_long_union_pacific.html",
    "https://free-images.com/display/a_red_leaf_stands.html",
    "https://free-images.com/display/a_view_many_yellow.html",
    "https://free-images.com/display/a_walrus_cow_odobenus.html",
    "https://free-images.com/display/a_waterbuck_photo_taken.html",
    "https://free-images.com/display/a_welsh_sunset_river.html",
    "https://free-images.com/display/abbaye_de_bonnecombe.html",
    "https://free-images.com/display/abolish_child_slavery.html",
    "https://free-images.com/display/acacia_tree_on_sunrise.html",
    "https://free-images.com/display/acton_house_in_eaton.html",
    "https://free-images.com/display/aerial_view_civic_district.html",
    "https://free-images.com/display/africa_personal_tribe_tribal.html",
    "https://free-images.com/display/african_culture.html",
    "https://free-images.com/display/afrika_map_1689.html",
    "https://free-images.com/display/aichi_val_df_st.html",
    "https://free-images.com/display/airacobra_p39_assembly_loc.html",
    "https://free-images.com/display/aircraft_airport_salzburg_1089973.html",
    "https://free-images.com/display/airport_airline_sri_lanka.html",
    "https://free-images.com/display/airport_lublin_terminal_tickets.html",
    "https://free-images.com/display/airport_lublin_terminal_tickets_0.html",
    "https://free-images.com/display/airport_plane_flight_278052.html",
    "https://free-images.com/display/airport_tenerife_runway_aircraft.html",
    "https://free-images.com/display/airport_tunisia_airport_at.html",
    "https://free-images.com/display/albrecht_durer_jesus_among.html",
    "https://free-images.com/display/alexander_justice_samuel_pepys_0.html",
    "https://free-images.com/display/alexandre_de_riquer_composition_0.html",
    "https://free-images.com/display/alexandria_virginia_masons_519530.html",
    "https://free-images.com/display/alexandria_virginia_masons_519532.html",
    "https://free-images.com/display/alona_beach_palmtree.html",
    "https://free-images.com/display/alumni_hall_1889_sun.html",
    "https://free-images.com/display/amalie_kaercher_flower_still.html",
    "https://free-images.com/display/amelie_dieterle.html",
    "https://free-images.com/display/american_pitbull_001.html",
    "https://free-images.com/display/an_atlantic_salmon_parr.html",
    "https://free-images.com/display/andrew_graham_murray_vanity.html",
    "https://free-images.com/display/anerkendelsesagfoereren.html",
    "https://free-images.com/display/annonciation_grandes_heures_anne.html",
    "https://free-images.com/display/anton_karinger_triglav_iz.html",
    "https://free-images.com/display/apadana_winged_man.html",
    "https://free-images.com/display/apple_lisa_macintosh_xl.html",
    "https://free-images.com/display/aramides_axillaris_1902.html",
    "https://free-images.com/display/archibald_russel_ponape_slv.html",
    "https://free-images.com/display/armchair_prime_minister_vouli.html",
    "https://free-images.com/display/arras_lynx_unicorn_detail.html",
    "https://free-images.com/display/arthropod_giant_tausendf_c3.html",
    "https://free-images.com/display/aspen_maroon_bells_colorado.html",
    "https://free-images.com/display/assassin_bug_on_green.html",
    "https://free-images.com/display/assembling_b_25_bombers.html",
    "https://free-images.com/display/atari_800_computer_fr.html",
    "https://free-images.com/display/athanasios_karantz_ou_las.html",
    "https://free-images.com/display/aucklandzoo_1035.html",
    "https://free-images.com/display/aulacorhynchus_coeruleicinctis_1847.html",
    "https://free-images.com/display/aurelio_figueiredo_beach_in.html",
    "https://free-images.com/display/auto_accident_winter_snow.html",
    "https://free-images.com/display/avenue_196335.html",
    "https://free-images.com/display/babur_drunken.html",
    "https://free-images.com/display/badlands_national_park_in.html",
    "https://free-images.com/display/badminton_estate_map_volume_1.html",
    "https://free-images.com/display/baguette_177858.html",
    "https://free-images.com/display/balance_rock_arches.html",
    "https://free-images.com/display/ball_court_at_monte.html",
    "https://free-images.com/display/barbed_cactus_plant.html",
    "https://free-images.com/display/bare_tree_sunset.html",
    "https://free-images.com/display/barn_along_road_in.html",
    "https://free-images.com/display/barn_autumn_long_shadow.html",
    "https://free-images.com/display/barren_ground_caribou_grazing.html",
    "https://free-images.com/display/basa_3k_7_349_57.html",
    "https://free-images.com/display/baseball_game_score.html",
    "https://free-images.com/display/battle_spottsylvania_by_thure.html",
    "https://free-images.com/display/beach_grasses_at_sunrise_0.html",
    "https://free-images.com/display/beach_in_bali_6.html",
    "https://free-images.com/display/bee_on_flower2.html",
    "https://free-images.com/display/beethoven.html",
    "https://free-images.com/display/benedikt_lergetporer_girl_in.html",
    "https://free-images.com/display/bernhard_strigel_bildnis_hans.html",
    "https://free-images.com/display/bertuch_fabelwesen.html",
    "https://free-images.com/display/bianca_cappello_et_son.html",
    "https://free-images.com/display/bible_rosary_prayer_pray.html",
    "https://free-images.com/display/bicycles_bicycle_parking_734793.html",
    "https://free-images.com/display/big_brown_bear_ursus.html",
    "https://free-images.com/display/bik_1967.html",
    "https://free-images.com/display/billie_holiday_0001_original.html",
    "https://free-images.com/display/bison_rests_in_grass.html",
    "https://free-images.com/display/blue_cohosh_caulophyllum_thalictroides.html",
    "https://free-images.com/display/blue_spruce_196660.html",
    "https://free-images.com/display/bobcat_crouched_beside_dried.html",
    "https://free-images.com/display/boeing_757_israeli_airlines.html",
    "https://free-images.com/display/bogarub_victoria_amazonica_blute.html",
    "https://free-images.com/display/bohinj_2919866046_o.html",
    "https://free-images.com/display/bolton_school_campus.html",
    "https://free-images.com/display/book_ordinary_boxwood_branches.html",
    "https://free-images.com/display/border_collie_662716.html",
    "https://free-images.com/display/borse_wien_01.html",
    "https://free-images.com/display/boy_on_porch_general.html",
    "https://free-images.com/display/branch_with_lot_apples_0.html",
    "https://free-images.com/display/breeding_cheetah.html",
    "https://free-images.com/display/bridge_c3_a7obandede_erzurum.html",
    "https://free-images.com/display/bromo_semeru_sunrise_landscape.html",
    "https://free-images.com/display/brown_bears_ursus_middendorffi.html",
    "https://free-images.com/display/brun_jagermeister_porsche_962c.html",
    "https://free-images.com/display/bryce_in_early_july.html",
    "https://free-images.com/display/bubo_virginianus_nacurutu_otter.html",
    "https://free-images.com/display/buddha_buddhists_meditate_wat.html",
    "https://free-images.com/display/buddhists_monks_orange_robes.html",
    "https://free-images.com/display/budha_monk_gold_buddhism_0.html",
    "https://free-images.com/display/bufo_periglenes2_cropped.html",
    "https://free-images.com/display/bulgaria_airport_987548.html",
    "https://free-images.com/display/bull_moose_in_vegetation.html",
    "https://free-images.com/display/bullshark.html",
    "https://free-images.com/display/burning_wood_in_brazier.html",
    "https://free-images.com/display/buttercup_close_summer_yellow.html",
    "https://free-images.com/display/cable_car_gondola_aerial.html",
    "https://free-images.com/display/cactus_with_big_thorns.html",
    "https://free-images.com/display/caligula_met_14_37_0.html",
    "https://free-images.com/display/calyptura_cristata.html",
    "https://free-images.com/display/canada_goose_with_gosling.html",
    "https://free-images.com/display/captains_handshake.html",
    "https://free-images.com/display/car_crash_1.html",
    "https://free-images.com/display/caribou_full_face_placement.html",
    "https://free-images.com/display/carlo_tessarini.html",
    "https://free-images.com/display/carp_keser_fishing_south.html",
    "https://free-images.com/display/cashion_maricopa_county_arizona_3.html",
    "https://free-images.com/display/caspar_david_friedrich_039.html",
    "https://free-images.com/display/centerville_california_farm_families_5.html",
    "https://free-images.com/display/cerkev_svetega_roka_pri.html",
    "https://free-images.com/display/cervus_canadensis_usfws.html",
    "https://free-images.com/display/chain_590773.html",
    "https://free-images.com/display/changwon_soccer_center_2.html",
    "https://free-images.com/display/charles_murray_pitman_vanity.html",
    "https://free-images.com/display/chasseur_dafrique_bataille_de.html",
    "https://free-images.com/display/cheetah_with_cubs_masaai.html",
    "https://free-images.com/display/chile_andes_train_642722.html",
    "https://free-images.com/display/chimney_corner_by_henry.html",
    "https://free-images.com/display/chinese_south_sea.html",
    "https://free-images.com/display/chinese_temple_asia_religion.html",
    "https://free-images.com/display/christophe_colomb_devant_le_5.html",
    "https://free-images.com/display/chrysler_building_spire_manhattan.html",
    "https://free-images.com/display/church_interior_0.html",
    "https://free-images.com/display/church_island_bled_lake.html",
    "https://free-images.com/display/church_place_village_faith.html",
    "https://free-images.com/display/churchill_wildlife_management_area_0.html",
    "https://free-images.com/display/churchill_wildlife_management_area_1.html",
    "https://free-images.com/display/churchill_wildlife_management_area_12.html",
    "https://free-images.com/display/churchill_wildlife_management_area_17.html",
    "https://free-images.com/display/churchill_wildlife_management_area_4.html",
    "https://free-images.com/display/churchill_wildlife_management_area_5.html",
    "https://free-images.com/display/churchill_wildlife_management_area_6.html",
    "https://free-images.com/display/churchill_wildlife_management_area_9.html",
    "https://free-images.com/display/circus_poster_alabama_fsa.html",
    "https://free-images.com/display/cityscape_night_pudong_bund.html",
    "https://free-images.com/display/civil_rights_march_on_46.html",
    "https://free-images.com/display/civil_rights_march_on_48.html",
    "https://free-images.com/display/civil_rights_march_on_69.html",
    "https://free-images.com/display/civil_rights_march_on_70.html",
    "https://free-images.com/display/claude_lorrain_009.html",
    "https://free-images.com/display/claude_monet_poplars_at.html",
  ];

  for (var i = 0; i < url.length; i++) {
    var scrapingImg = await scraping(url[i]);
    if (scrapingImg == false) {
      console.log(`\x1b[31m\x1b[43m Error : ${url}  \x1b[0m`);
    }
    result = [...result, ...scrapingImg];
    // result = [...result, ...scrapingImg];

    console.log("complete ...... : " + result.length);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`All result : ${result.length}`);
  const getNotDup = result.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  console.log(`Unique result : ${getNotDup.length}`);
  // var json = JSON.stringify(getNotDup);
  var json = JSON.stringify(result);
  // console.log(json);
  fs.writeFile("data/wiki/new-free-image-03.json", json, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log("The file was saved!");
    return true;
  });
}

main();
