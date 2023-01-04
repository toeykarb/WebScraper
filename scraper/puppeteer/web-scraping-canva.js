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
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);

  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  // Pass the Chrome Test.
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.navigator.chrome = {
      runtime: {},
      // etc.
    };
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = (parameters) =>
      parameters.name === "notifications"
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "plugins", {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });
};

(async (config = {}) => {
  let cookies = [
    {
      domain: ".canva.com",
      expirationDate: 1659079784.547585,
      hostOnly: false,
      httpOnly: true,
      name: "__cf_bm",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "c5DrDFxIXbz_SuhlwO3zzju4KDHHuWOgutWOwcgJFGg-1659077984-0-AW9fDAjSCPUVUlLWbXX9Fvcc7ZD5oTGC8woX6C7pKOpL8BzDxTA85K+FZ2vbv7tB/5VATos7jLr/lHNStHDb02i3laixFTjENqNnwzvaj2nNe124m55TgQGY6l7MXLT2LG3eG5Yhkz7u59qnRnSlpW7xZeyIYv3m82ASesQxXYBs",
      id: 1,
    },
    {
      domain: ".canva.com",
      hostOnly: false,
      httpOnly: true,
      name: "__cfruid",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: true,
      storeId: "0",
      value: "24b52baef1f48353a49b07b431e0f9316962f150-1659076074",
      id: 2,
    },
    {
      domain: ".canva.com",
      expirationDate: 2117034001,
      hostOnly: false,
      httpOnly: false,
      name: "__cid",
      path: "/",
      sameSite: "lax",
      secure: false,
      session: false,
      storeId: "0",
      value:
        "3tqe6TKc0t8UkON7nGe-f8WN9RqCSzEHgUSOGpFEm0qlwSUZBkfoN5pxjSSWA2EazUb4RUvj0h_w14cS3UiFZeYxyHX4Lel242uwNLJkrVfjJ-x09iv2crlkzHT2Iek6zyXmOs0XpUKidbVFs3HaLatkxGryKOBN5ybOc_ZrsCm1arYsomzOUtYJyTaiKOxx52TCf-Ev6jOiB-1o7SngNbN0tjSyarU0smTWe-Ql93OtcbYtrHezdop2tiy2dOd4sTOGHQlEERK6drZ4tiC1KB5YzHT2Iek6yzbsaaIU93WiC_V_7APJOscq4nPsISEOs2u0NbN9siquZLIgsnS_KrJkxFctTIWvo4Ezc0lEVhtfy3v9gq-G7ckC7TCYu4dST0QTGjCHKhpViTSCUUREqEPwNJI_9Dx9OyPUS8L1hRqCRCetOvMyseYC4VzgEzWq-jzBWk421ZeSQoUKgkSOGn0",
      id: 3,
    },
    {
      domain: ".canva.com",
      expirationDate: 2117034001,
      hostOnly: false,
      httpOnly: false,
      name: "__cuid",
      path: "/",
      sameSite: "lax",
      secure: false,
      session: false,
      storeId: "0",
      value: "a98ac16f5a504ad3ade6fc1df1dab086",
      id: 4,
    },
    {
      domain: ".canva.com",
      expirationDate: 1659078024,
      hostOnly: false,
      httpOnly: false,
      name: "_dc_gtm_UA-37190734-9",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "1",
      id: 5,
    },
    {
      domain: ".canva.com",
      expirationDate: 1666853986,
      hostOnly: false,
      httpOnly: false,
      name: "_fbp",
      path: "/",
      sameSite: "lax",
      secure: false,
      session: false,
      storeId: "0",
      value: "fb.1.1643169120749.1990231798",
      id: 6,
    },
    {
      domain: ".canva.com",
      expirationDate: 1722149985,
      hostOnly: false,
      httpOnly: false,
      name: "_ga",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "GA1.2.535949036.1657879257",
      id: 7,
    },
    {
      domain: ".canva.com",
      expirationDate: 1722149985,
      hostOnly: false,
      httpOnly: false,
      name: "_ga_EPWEMH6717",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "GS1.1.1659077965.10.1.1659077985.0",
      id: 8,
    },
    {
      domain: ".canva.com",
      expirationDate: 1659164385,
      hostOnly: false,
      httpOnly: false,
      name: "_gid",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "GA1.2.718918088.1659056188",
      id: 9,
    },
    {
      domain: ".canva.com",
      expirationDate: 1659164385,
      hostOnly: false,
      httpOnly: false,
      name: "_uetsid",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "46f44d300ed911ed82061380b1203389",
      id: 10,
    },
    {
      domain: ".canva.com",
      expirationDate: 1692773985,
      hostOnly: false,
      httpOnly: false,
      name: "_uetvid",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "5b6b7290a33911ec82bff9b393e10c61",
      id: 11,
    },
    {
      domain: ".canva.com",
      expirationDate: 1689436197,
      hostOnly: false,
      httpOnly: false,
      name: "ab.storage.deviceId.320f7332-8571-45d7-b342-c54192dae547",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value:
        "%7B%22g%22%3A%227a7cb136-2586-93d4-03df-3eb85a78f2f8%22%2C%22c%22%3A1657879257100%2C%22l%22%3A1657879257100%7D",
      id: 12,
    },
    {
      domain: ".canva.com",
      expirationDate: 1690634924,
      hostOnly: false,
      httpOnly: false,
      name: "ab.storage.sessionId.320f7332-8571-45d7-b342-c54192dae547",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value:
        "%7B%22g%22%3A%220c985a6b-950d-1b8c-67ac-e7fcb35b3883%22%2C%22e%22%3A1659079784778%2C%22c%22%3A1659077984779%2C%22l%22%3A1659077984779%7D",
      id: 13,
    },
    {
      domain: ".canva.com",
      expirationDate: 1690615424,
      hostOnly: false,
      httpOnly: false,
      name: "ab.storage.userId.320f7332-8571-45d7-b342-c54192dae547",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value:
        "%7B%22g%22%3A%22UAFHwfSGvdc%22%2C%22c%22%3A1659058484413%2C%22l%22%3A1659058484413%7D",
      id: 14,
    },
    {
      domain: ".canva.com",
      expirationDate: 1689925325,
      hostOnly: false,
      httpOnly: false,
      name: "amp_fef1e8",
      path: "/",
      sameSite: "lax",
      secure: false,
      session: false,
      storeId: "0",
      value: "7547ad16-8720-474c-87f9-054a9f68a76dR...1g8fr3l4g.1g8fr9pg1.9.2.b",
      id: 15,
    },
    {
      domain: ".canva.com",
      expirationDate: 1716971807.673962,
      hostOnly: false,
      httpOnly: true,
      name: "brwsr",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "4c82f4ba-e7cf-11ec-842a-57a184443048",
      id: 16,
    },
    {
      domain: ".canva.com",
      expirationDate: 1690612737.219081,
      hostOnly: false,
      httpOnly: false,
      name: "CAI",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "20064c82-6324-4bdf-8076-0d8010804439",
      id: 17,
    },
    {
      domain: ".canva.com",
      expirationDate: 1678844264.981246,
      hostOnly: false,
      httpOnly: true,
      name: "cf_clearance",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "3H68aOkc_HaciQKtNw4R9t5.u9pdywM1h6o7sT4Sr20-1647304664-0-250",
      id: 18,
    },
    {
      domain: ".canva.com",
      expirationDate: 1661669982.36323,
      hostOnly: false,
      httpOnly: false,
      name: "CS",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "1",
      id: 19,
    },
    {
      domain: ".canva.com",
      expirationDate: 1674629982.363287,
      hostOnly: false,
      httpOnly: false,
      name: "CTC",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "eyJBIjoxNjM2NjQwNTc4OTM0LCJCIjoxNjU5MDc3OTgyMjA0LCJEIjp0cnVlLCJFIjp0cnVlLCJGIjp0cnVlLCJHIjp0cnVlLCJIIjpmYWxzZSwiSSI6WzE1XSwiSiI6WzddfQ==",
      id: 20,
    },
    {
      domain: ".canva.com",
      expirationDate: 1661669982.363252,
      hostOnly: false,
      httpOnly: true,
      name: "CUI",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "RmrXdLFpba0UHK7c1cMKolEehPScUQK-DPcnxkyTQk3la1vGIpRHNH8weB5X1aI0WXG9kA",
      id: 21,
    },
    {
      domain: ".canva.com",
      expirationDate: 1661736457.027711,
      hostOnly: false,
      httpOnly: false,
      name: "FPAU",
      path: "/",
      sameSite: "unspecified",
      secure: true,
      session: false,
      storeId: "0",
      value: "1.2.1319249880.1653960457",
      id: 22,
    },
    {
      domain: ".canva.com",
      expirationDate: 1722149986.167033,
      hostOnly: false,
      httpOnly: true,
      name: "FPID",
      path: "/",
      sameSite: "unspecified",
      secure: true,
      session: false,
      storeId: "0",
      value: "FPID2.2.CNBXGE1eYL9kIeGuvVfvm6%2B6doXmbBy%2BoLGhS4hgF%2Bc%3D.1643169120",
      id: 23,
    },
    {
      domain: ".canva.com",
      expirationDate: 1659128188.360046,
      hostOnly: false,
      httpOnly: false,
      name: "FPLC",
      path: "/",
      sameSite: "unspecified",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "QhqkMraVQvw9Iye8W98oqnNvO1SaGA59ygvODxobKVI64mk6kn8FfvVrXxylMjVpvNbpmeDlMUMnbRxPBBdu0oP92wCVCZGk6HjE%2BQfTggRG%2B2VVR82jvpaqWwQdng%3D%3D",
      id: 24,
    },
    {
      domain: ".www.canva.com",
      expirationDate: 1680762725,
      hostOnly: false,
      httpOnly: false,
      name: "__stripe_mid",
      path: "/",
      sameSite: "strict",
      secure: true,
      session: false,
      storeId: "0",
      value: "f699dec1-124d-422a-a520-021bd3ceefa8eefda5",
      id: 25,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1661669982.363201,
      hostOnly: true,
      httpOnly: true,
      name: "CAZ",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "fSY5c0dBMS56xOEGVgIWjjBVdxk0tmLekMMlpLzTkgEK3Ux5dthFR5TnJ9j-1CpY-HQ_9ZABw5suTnEe6Cp33l4PU_9Nk_O7z2cILuUXnWfibWG8o4FKL0E2J5CEzMUC8yXkTeFum-JJn2wIVsvvsg_IqoCl9KM2OqKPY22pSAMMbwwvIfd4raN4QdC-XrZF3jdiG7D8-CmLi2_zrWdR5qEDTkkXRLVjOc7tK8arKUEDAHQYxxK_imkH-10_4KJRntT4qqazJA8uwUcVJD8cY47_RJtrQrzrFNTZkhG4VghlNwcrY2k_nfgY1M0UCt7lBdQsESsr_TjzR2kmM2r5vA8crZgRPYlRei0J9_pYRjuSFHJt3xa8cPg52-aj6xS6-5BSRUj9FQl0HfY_uo-zGLjJ70foHEy42FWGLeP2QP2b0SIpFPbn4wMJh9WWBu2eUL32GGDYnU4IDDkaPSD99_XxMgI5xSG86EV7gzh9ozTx2xidw_uj6m3rNQpRHMWdvaW79n2sQ9w_FP7DfdE2ogakRzWyyNno-apYaNfzx-WdaHtNRV2NBCQw7e3mnqGte2gpJqnTfD9FUpXPuZJoKlys3MnLw4m8Tqo0oAGLZBCsoDOsK9S7BF0bB2cJWjeMGJXh4SZrvsdQBVyzi9dzQWDWqanEMAzJakK5CX80e7z3iFAZINVHgfrRB1y40k0qAIgAHWyC9bX0s-6duwUdZzGdclq3YsqtY5TeooavgaLnu3Ii4ZxvyQmr0it5i7B-OT9pFBofDxsxdIQOTBFMcrbh33CeVjNRxo6A_gopiWNIrwPwoffXRpJ-VMoVmS1cqzuBGr6mLKRhekCtP_QSx6p8RUWPifUD7pIX-Qta6nujNzZHd3S3xTtkgH0g0FHgVDDZ-kbfkf39PesVmdAeKYtL2kJERqJHHt0j1FBMzmmDFDzNf0jYXUF6OWiYj-BUgoIrs1r7I6QVDf6M_W-q0F7N6kN_L1JL_jcSuajWSyMgPdU8x7hblbm-NZ-KXjvUnY3vy3eCMTmCsyNgKHFVbAMV0x5GVE1R5ClOmjS1SRjGx-9TMfM7GOf-AX6Taf9KQGqkCN22OvWn2eEHYzotkEI4gaB9z7m6XnVuadrEF9_cQxk7TGWtUkUzV616KUDe0yAK7dJzP76joSfrYhf7yw4DuDOcUwTJ7q4BIpapCz8rHII22j0WzZp5XMnQbVTkzv4iFasvoEEXIALNM_bLKNF1VZDjhXSkiqY0uyW_kjEFV97bBAWnEOnnnbuMrkZOpuBs-QLaoTR0mugxQVlIAeCx1H4NAEEaGJaMV9yo6f65igl4Lh1M0y3ZA-EjLwy0eNeOXv6flZsajuCDN7x_g56PKEG-tTOwQinZxGY5i5xp9DmJ9fCtOmzEVR3l7HzMsUy7jXc1_nCZy9y3RWDNr1u6rCcn29X285QemTSFTnuRyqd6RUhZm-LmAB17FfzMRJrsTKkr_neO5s4KqAkxWFCQgmvpGiOZgox4rMzbswSQkre0JpCTdHKWE_vi2y8a9Og4GRlXLvlJypdAZrOpAbSGl9QKp00nooZqfSwMQM90KxWa9sbyoHyRbE36tOwZu0iziuQYzL4YBjkpt8U5Cc7P4N3I5pq5h-20aZUatgd7qgi7LmITkeGVoNPOS8MjYPGBsDzfHdHi3Ak_qFBr52z1ysWFy_z_2ONp6wOsnSL7YNjVG5A-B3wHJhohetnYJrROJnx8ff3GoDySFeANvk83G2DV8JRABTtlLHo8y835RF71",
      id: 26,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1661669982.363112,
      hostOnly: true,
      httpOnly: true,
      name: "CB",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "BAFHwVxlp5U",
      id: 27,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1659088782.721865,
      hostOnly: true,
      httpOnly: true,
      name: "CCK",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "2b7_IS6vW40uJTLdtJwCnA",
      id: 28,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1674705118.38336,
      hostOnly: true,
      httpOnly: true,
      name: "CDI",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "b103778c-3474-4afb-bfaf-b425d6288089",
      id: 29,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1661669982.363174,
      hostOnly: true,
      httpOnly: true,
      name: "CID",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "9D-YDri17pBUjyXvEgXmHVUUsRFpneAWPfube5wdSiajCO5GUoKPW996DsR6lbUvOrKg7yjPpGbVlCIcMOzFf2_QV11b7X5edtJ1Ova0zX7eAXu3",
      id: 30,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1661669982.363271,
      hostOnly: true,
      httpOnly: true,
      name: "CL",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value: "en",
      id: 31,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1659088782.721808,
      hostOnly: true,
      httpOnly: true,
      name: "CPA",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: "0",
      value:
        "Z0hZxVycfqP7hMboCeSB_ZgpfUtUgxvwT8gCyI97m_ay3zVjSH6wiR8ITpGN69aM-N2RUkEGJCPqFBKa2cerTBitnUbvOmsFKI42KBC_MsvI8FlRUiW9ik2aGzZjpEQag6kGXTZsGNHtMXK4CNDd_Uu8b6IGj7QVfZ08sbwDGdWHB0Pz5U4rHCGAgmvt5X2Wxt9Bx-Svo1YlZi9iSYb3TpcUEryONYvkC9b2SMiz9RZiRUdh6s7tGCNEhXeG8p2eVeCsjt-X615oFVHvKsJOGzr8z5X0boX7Vv6EfaOVzqzR-xau8E7BeCggnvlT-0hS-yQMmsBSpMmKFmjBpyVdhOiPwFxN2SfC7yXuauc-a994vvRHZ8hRh0CEQcY34xGiBiaYqf1ls3ahp26I94WQMaAs8YEI58T8dGJoSanp72fhN0TUx8c0vr73Vvgco2thCGjyVhZKAbcP_m9WL7Ahu_VWchCyHA5xqiPUqwAzfd-enYHBTZ2RNCyvvXhcfLdXK0846h1yImDWaq9BdzuXmpx8NgVt1fMfvjXbXgtp-BnONSGZ",
      id: 32,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1674615056,
      hostOnly: true,
      httpOnly: false,
      name: "g_state",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: '{"i_t":1659144959689,"i_l":1,"i_p":1659070256867}',
      id: 33,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1659079785,
      hostOnly: true,
      httpOnly: false,
      name: "gtm_custom_user_engagement",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: '{"lock":"yes","page":1,"landingPageURL":"https://www.canva.com/","newSession":"yes"}',
      id: 34,
    },
    {
      domain: "www.canva.com",
      expirationDate: 1659092385,
      hostOnly: true,
      httpOnly: false,
      name: "gtm_custom_user_engagement_lock_4",
      path: "/",
      sameSite: "unspecified",
      secure: false,
      session: false,
      storeId: "0",
      value: "yes",
      id: 35,
    },
  ];

  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: false,
    devtools: true,
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  // await page.setViewport({ width: 2000, height: 1500, deviceScaleFactor: 1 });

  await page.goto(
    "https://www.canva.com/p/templates/EAFFu8ly1V8-cream-green-orange-illustrated-5-facts-about-cat-infographic",
    {
      waitUntil: ["networkidle0", "domcontentloaded"],
    }
  );
  const data = {
    tags: ["canva", "canva templates", "template", "cat"],
  };
  var imageLink = await page.evaluate(
    "document.querySelector('.CdDD1g') ? document.querySelector('.CdDD1g').getAttribute('src') : '';"
  );
  if (!data.imageLink) {
    return {
      statusCode: 200,
      body: {
        message: `Image link not present on page - skip scraping`,
      },
    };
  }
  var checkPaidTemplate = await page.evaluate(
    "document.querySelector('._8VoL_g .USE2Rg') ? document.querySelector('._8VoL_g .USE2Rg').innerText.toLowerCase() : '';"
  );
  if (checkPaidTemplate.includes("paid")) {
    data.tags.push("canva paid");
  } else if (checkPaidTemplate.includes("pro")) {
    data.tags.push("canva premium");
  } else {
    data.tags.push("canva free");
  }
  await browser.close();
})();
