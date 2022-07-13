let getRules = [];

async function fetchRules() {
  let fetchAnalyticsRules = await fetch("../analytics.json");
  let fetchAdsRules = await fetch("../ads.json");
  let fetchSocialMediaRules = await fetch("../socialmedia.json");

  let analyticsRules = await fetchAnalyticsRules.json();
  let adsRules = await fetchAdsRules.json();
  let socialMediaRules = await fetchSocialMediaRules.json();

  analyticsRules.map(
    (items) =>
      (getRules = [
        ...getRules,
        { id: items.id, ruleSet: "analytics", url: items.condition.urlFilter },
      ])
  );

  adsRules.map(
    (items) =>
      (getRules = [
        ...getRules,
        { id: items.id, ruleSet: "ads", url: items.condition.urlFilter },
      ])
  );

  socialMediaRules.map(
    (items) =>
      (getRules = [
        ...getRules,
        {
          id: items.id,
          ruleSet: "socialmedia",
          url: items.condition.urlFilter,
        },
      ])
  );
}

window.onload = async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(queryOptions);
  await fetchRules();
  console.log("*******************************", getRules);
  console.log("tab", tab);

  chrome.storage.sync.get(
    "getMatchedRuleCounts",
    ({ getMatchedRuleCounts }) => {
      let getBlockList = [];
      getMatchedRuleCounts
        .filter((getRules) => {
          return getRules.matchedRules.length > 0;
        })
        .map((items) => {
          items.matchedRules.map((items) => {
            getBlockList = [
              ...getBlockList,
              { ...items.rule, tabId: items.tabId, tabUrl: items.URL },
            ];
          });
        });

      let setvalue = getBlockList.filter((items) => {
        return items.tabId == tab.id;
      });
      console.log("getBlockList", getBlockList);
      displayBlockList(setvalue);
    }
  );
};

function displayBlockList(getList) {
  console.log("getList", getList);

  let adsHtml = null;
  let analyticsHtml = null;
  let socialmediaHtml = null;

  let formHTML = "";

  let ads = getList.filter((item) => {
    return item.rulesetId == "ads";
  });
  let analytics = getList.filter((item) => {
    return item.rulesetId == "analytics";
  });
  let socialmedia = getList.filter((item) => {
    return item.rulesetId == "socialmedia";
  });

  if (ads.length > 0) {
    let getMe = getRuleUrl(ads);
    console.log("getMe", getMe);
    adsHtml = `<div id = "adurl-blocked-getMe"><h3 id="head-adurl-blocked">Ads</h3>`;
    adsHtml += getMe.map((item) => {
      return `<p>${item.url}</p>`;
    });
    formHTML = adsHtml + "</div>";
  }

  if (analytics.length > 0) {
    let getMe = getRuleUrl(analytics);
    analyticsHtml = `<div id = "adurl-blocked-analytics"><h3 id="head-adurl-blocked">Analytics</h3>`;
    analyticsHtml += getMe.map((item) => {
      return `<p>${item.url}</p>`;
    });
    formHTML += analyticsHtml + "</div>";
  }

  if (socialmedia.length > 0) {
    let getMe = getRuleUrl(socialmedia);
    socialmediaHtml = `<div id = "adurl-blocked-socialmedia"><h3 id="head-adurl-blocked">Social media</h3>`;
    socialmediaHtml += getMe.map((item) => {
      return `<p>${item.url}</p>`;
    });
    formHTML += socialmediaHtml + "</div>";
  }

  console.log("adsHtml", adsHtml);
  console.log("analyticsHtml", analyticsHtml);
  console.log("socialmediaHtml", socialmediaHtml);

  document.getElementById("dynamic-blocked-url-items").innerHTML =
    formHTML.replace(/,/g, "");
}

function getRuleUrl(list) {
  console.log("getRuleUrl", list);

  let setRuleUrl = list.map((item) => {
    let [abc] = getRules.filter((it) => {
      return it.id == item.ruleId && item.rulesetId == it.ruleSet;
    });
    return abc;
  });
  return setRuleUrl;
}
