//Stores the Tab ID with corresponding blocked counts
let getMatchedRuleCounts = [];
let _dynBlockSite = [];
let appStatus = true; //False - Disable ad blocker | True - Enable ad blocker
let adOnSite = false; //True - Allows ads on site | False - Disable ads on sites

chrome.storage.sync.get("adBlockStateManage", ({ adBlockStateManage }) => {
  if (typeof adBlockStateManage === "undefined") {
    console.log("Not Available - Setting up value");
    chrome.storage.sync.set(
      {
        adBlockStateManage: {
          dynBlockSite: [],
          adBlockStatus: true,
          allowAdonSites: [],
        },
      },
      () =>
        console.log("Not Available and configured values are - ", {
          dynBlockSite: [],
          adBlockStatus: true,
          allowAdonSites: [],
        })
    );
  } else {
    console.log("Available in Storage - ", adBlockStateManage);
  }
});

chrome.tabs.onUpdated.addListener((getTabIdOnUpdate, changeInfo, currentTabCompleteInfo) => {
  chrome.storage.sync.get(
    "adBlockStateManage",
    function ({ adBlockStateManage }) {
      console.log(
        "chrome.storage.sync.get from background JS",
        adBlockStateManage
      );
      let { dynBlockSite, adBlockStatus, allowAdonSites } = adBlockStateManage;
      _dynBlockSite = [...dynBlockSite];
      appStatus = adBlockStatus;
      // console.log("adOnSite", adOnSite);
      console.log("Current URL from background JS", currentTabCompleteInfo);

      adOnSite = allowAdonSites.some((sites) => {
        console.log("*******adOnSite*******", sites, currentTabCompleteInfo.url, sites == currentTabCompleteInfo.url);
        return sites === tab.url;
      });

      // console.log("adOnSite", adOnSite);

      // console.log("adOnSite", adOnSite);
      // console.log("updated data dynBlockSite", _dynBlockSite);
      // console.log("adBlockStatus from UI", adBlockStatus);
      // console.log("appStatus", appStatus);

      if (appStatus === true && adOnSite === false) {
        console.log("App Enabled");
        enableExtension(getTabIdOnUpdate, changeInfo, currentTabCompleteInfo);
      } else {
        console.log("App disabled");
        disableExtension(currentTabCompleteInfo);
      }
    }
  );
});

function disableExtension(currentTabCompleteInfo) {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: ["ads", "analytics", "socialmedia"],
  });
  setValueToExternal({getMatchedRuleCounts},currentTabCompleteInfo)
}

function enableExtension(getTabIdOnUpdate, changeInfo, currentTabCompleteInfo) {
  // console.log(changeInfo.status);

  switch (changeInfo.status) {
    case "loading":
      // chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;
    case "complete":
      // chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      // chrome.declarativeNetRequest.getDynamicRules(get => console.log("getDynamicRules from background JS - ", get));
      getRulesStatus(getTabIdOnUpdate, currentTabCompleteInfo);
      break;
    default:
      break;
  }
}

function setBadgeCount(count = 0, tabId) {
  chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
}

function getRulesStatus(getTabIdOnUpdate, currentTabCompleteInfo) {
  console.log(
    "Inside getRulesStatus complete - ",
    getTabIdOnUpdate,
    currentTabCompleteInfo
  );
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ads", "analytics", "socialmedia"],
  });
  chrome.declarativeNetRequest.getMatchedRules(
    { tabId: getTabIdOnUpdate },
    (matchedRulesInTab) => {
      // console.log("matchedRulesInTab", matchedRulesInTab);
      if (matchedRulesInTab != undefined) {
        let matchedRuleCount = matchedRulesInTab.rulesMatchedInfo.length;

        setBadgeCount(matchedRuleCount, getTabIdOnUpdate);

        let found = getMatchedRuleCounts.some(
          (item) => item.tabId === getTabIdOnUpdate
        );

        if (!found) {
          getMatchedRuleCounts = [
            ...getMatchedRuleCounts,
            {
              tabId: currentTabCompleteInfo.id,
              URL: currentTabCompleteInfo.url,
              matchedCount: matchedRuleCount,
              matchedRules: matchedRulesInTab.rulesMatchedInfo,
            },
          ];
        }

        if (found) {
          getMatchedRuleCounts.map((item, index) => {
            if (item.tabId == getTabIdOnUpdate) {
              getMatchedRuleCounts[index].URL = currentTabCompleteInfo.url;
              getMatchedRuleCounts[index].matchedCount = matchedRuleCount;
              getMatchedRuleCounts[index].matchedRules =
                matchedRulesInTab.rulesMatchedInfo;
            }
          });
        }

        chrome.storage.sync.set({ getMatchedRuleCounts });
        setValueToExternal({ getMatchedRuleCounts }, currentTabCompleteInfo);
      } else {
        console.error("Rule test limit exceed - ", matchedRulesInTab);
        console.error("Captured Data - ", getMatchedRuleCounts);
      }
    }
  );
}

function setValueToExternal({ getMatchedRuleCounts }, currentTabCompleteInfo) {
  /*****************************/
  console.log("getMatchedRuleCounts to Db - ", getMatchedRuleCounts);
  let getBlockList = [];
  getMatchedRuleCounts
    .filter((getRules) => {
      return getRules.matchedRules.length > 0;
    })

    .map((firstItems) => {
      console.log("items - ", firstItems);
      firstItems.matchedRules.map((items) => {
        getBlockList = [
          ...getBlockList,
          { ...items.rule, tabId: items.tabId, tabUrl: firstItems.URL },
        ];
      });
    });
  console.log("getBlockList - ", getBlockList);
  setValue(
    currentTabCompleteInfo.url,
    getBlockList.filter((items) => {
      return (
        items.tabId == currentTabCompleteInfo.id &&
        items.tabUrl == currentTabCompleteInfo.url
      );
    }),sendDataExternalDb
  );
  /*****************************/
}

async function securityPreference(){

  let autofillCreditCardEnabled = new Promise((res, rej) => {
    chrome.privacy.services.autofillCreditCardEnabled.get({}, function (details) {
      res(details.value);
    });
  });
  
  let passwordSavingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.passwordSavingEnabled.get({}, function (details) {
      res(details.value);
    });
  });
  
  let safeBrowsingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.safeBrowsingEnabled.get({}, function (details) {
      res(details.value);
    });
  });
  
  let doNotTrackEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.doNotTrackEnabled.get({}, function (details) {
      res(details.value);
    });
  });
  
  let hyperlinkAuditingEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.hyperlinkAuditingEnabled.get({}, function (details) {
      res(details.value);
    });
  });
  
  // autofillCreditCardEnabled.then((output) =>console.log("Auto fill credit card enabled - ", output));
  // passwordSavingEnabled.then((output) =>console.log("Password saving enabled - ", output));
  // safeBrowsingEnabled.then((output) =>console.log("Safe browsing enabled - ", output));
  // doNotTrackEnabled.then((output) =>console.log("Do not track enabled - ", output));
  // hyperlinkAuditingEnabled.then((output) =>console.log("Do not track enabled - ", output));
  
  // return Promise.all([autofillCreditCardEnabled,passwordSavingEnabled,safeBrowsingEnabled,doNotTrackEnabled,hyperlinkAuditingEnabled]);
  
  return Promise.all([autofillCreditCardEnabled,passwordSavingEnabled,safeBrowsingEnabled,doNotTrackEnabled,hyperlinkAuditingEnabled,]).then((values) => {
   return ({autofillCreditCardEnabled: values[0],passwordSavingEnabled: values[1],safeBrowsingEnabled: values[2],doNotTrackEnabled: values[3],hyperlinkAuditingEnabled: values[4]})
   });
  
  // Promise.all([autofillCreditCardEnabled,passwordSavingEnabled,safeBrowsingEnabled,doNotTrackEnabled,hyperlinkAuditingEnabled,]).then((values) => {
  //   console.log({autofillCreditCardEnabled: values[0],passwordSavingEnabled: values[1],safeBrowsingEnabled: values[2],doNotTrackEnabled: values[3],hyperlinkAuditingEnabled: values[4]})
  // });
  }

async function setValue(url, blockedRule,sendDataExternalDb) {
  let analytics = blockedRule.filter((item) => {
    return item.rulesetId == "analytics";
  }).length;
  let ads = blockedRule.filter((item) => {
    return item.rulesetId == "ads";
  }).length;
  let e_commerce = blockedRule.filter((item) => {
    return item.rulesetId == "socialmedia";
  }).length;
  let tabURL = urlTrim(url);

  let preference = await securityPreference()

  let dataToDb = {
    Analytics: analytics,
    Ads: ads,
    ECommerce: e_commerce,
    Others: 0,
    Name: "Chrome",
    url: tabURL,
    extensionStatus: appStatus,
    // securityPreference: await securityPreference(),
    ...preference
  }
  sendDataExternalDb(dataToDb);
}

function sendDataExternalDb(dataToDb){
  console.log("Data to be sent to external exe for local DB - ",dataToDb);
  chrome.runtime.sendNativeMessage(
    "com.test.msgconsole",
    dataToDb,
    getStatus
  );
}

function getStatus() {
  if (
    typeof chrome.runtime.lastError === "undefined" ||
    chrome.runtime.lastError.message.indexOf("not found") === -1
  ) {
    console.log("Data sent to external exe for local DB");
  } else {
    console.error(
      "Messaging - chrome.runtime.lastError ",
      chrome.runtime.lastError,
      "||",
      chrome.runtime.lastError.message
    );
  }
}

function getText(value, toSearchVal) {
  // console.log("getText", value, toSearchVal);
  return (
    value
      .toLowerCase()
      .toString()
      .indexOf(toSearchVal.toLowerCase().toString()) >= 0
  );
}

function urlTrim(url) {
  return url.split(".com")[0] + ".com";
}




// function updateDynamicRules(deleteItems, formRules) {
//   chrome.declarativeNetRequest.updateDynamicRules({
//     removeRuleIds: deleteItems,
//     addRules: formRules,
//   });
// }

// function dynamicRulesHandler(getItm) {
//   let deleteItems = [];
//   let formRules = [];
//   // let blockUrls = ["goo"];
//   let blockUrls = [];

//   let dynBlockSite = _dynBlockSite;
//   console.log("dynBlockSite", dynBlockSite);
//   if (dynBlockSite.length > 0) {
//     dynBlockSite.map((item) => (blockUrls = [...blockUrls, item.url]));
//     // if (dynBlockSite.length) {
//     console.log("URLS to block : ", blockUrls);
//     getItm.map((itm) => {
//       deleteItems = [...deleteItems, itm.id];
//     });

//     blockUrls.forEach((domain, index) => {
//       let id = index + 1;
//       formRules = [
//         ...formRules,
//         {
//           id: id,
//           priority: 1,
//           action: { type: "block" },
//           condition: { urlFilter: domain, resourceTypes: ["main_frame"] },
//         },
//       ];
//     });

//     updateDynamicRules(deleteItems, formRules);
//     // chrome.declarativeNetRequest.getDynamicRules((a) =>console.log(a));
//   } else {
//     getItm.map((itm) => {
//       deleteItems = [...deleteItems, itm.id];
//     });

//     blockUrls.forEach((domain, index) => {
//       let id = index + 1;
//       formRules = [
//         ...formRules,
//         {
//           id: id,
//           priority: 1,
//           action: { type: "block" },
//           condition: { urlFilter: domain, resourceTypes: ["main_frame"] },
//         },
//       ];
//     });

//     updateDynamicRules(deleteItems, formRules);
//   }
// }
