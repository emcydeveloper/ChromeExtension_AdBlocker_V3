//Stores the Tab ID with corresponding blocked counts
let getMatchedRuleCounts = [];
let _dynBlockSite = [];
let appStatus = true; //False - Disable ad blocker | True - Enable ad blocker
let adOnSite = false; //True - Allows ads on site | False - Disable ads on sites

// chrome.storage.sync.clear("adBlockStateManage")

chrome.tabs.onUpdated.addListener((getTabDetailsOnUpdate, changeInfo, tab) => {
  chrome.storage.sync.get(
    "adBlockStateManage",
    function ({ adBlockStateManage }) {
      console.log(
        "chrome.storage.sync.get from background",
        adBlockStateManage
      );
      let { dynBlockSite, adBlockStatus, allowAdonSites } = adBlockStateManage;
      _dynBlockSite = [...dynBlockSite];
      appStatus = adBlockStatus;
      console.log("adOnSite", adOnSite);
      console.log("Current URL from background", tab);

      adOnSite = allowAdonSites.some((sites) => {
        console.log("*******adOnSite TEsting***********",sites,tab.url,sites==tab.url);
        return sites === tab.url;
        // "ganesh"==="ganesh"
      });
      // console.log("|||||||||||||||||||||||||||||||||||||||",allowAdonSites.length > 0)

      // if(allowAdonSites.length > 0) {
      //   console.log("|||||||||||||||||||||||||||||||||||||||")
      //   allowAdonSites.map((sites) => {
      //     console.log("******************", tab.url, sites);
      //     adOnSite = getText(tab.url, sites);
      //     // return sites === tab.url;
      //     // "ganesh"==="ganesh"
      //   });
      // } else {
      //   adOnSite = false;
      // }

      console.log("adOnSite", adOnSite);

      console.log("adOnSite", adOnSite);
      console.log("updated data dynBlockSite", _dynBlockSite);
      console.log("adBlockStatus from UI", adBlockStatus);
      console.log("appStatus", appStatus);

      if (appStatus === true && adOnSite === false) {
        console.log("App Enabled");
        enableExtension(getTabDetailsOnUpdate, changeInfo, tab);
      } else {
        console.log("App disabled");
        disableExtension();
      }
    }
  );
});

function disableExtension() {
  chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: ["ads", "analytics", "socialmedia"],
  });
}

function enableExtension(getTabDetailsOnUpdate, changeInfo, tab) {
  console.log(changeInfo.status);

  switch (changeInfo.status) {
    case "loading":
      // chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;
    case "complete":
      chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      getRulesStatus(getTabDetailsOnUpdate, tab);
      break;
    default:
      break;
  }
}

function setBadgeCount(count = 0, tabId) {
  chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
}

function getRulesStatus(getTabDetailsOnUpdate, tab) {
  console.log("Inside getRulesStatus complete");
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ads", "analytics", "socialmedia"],
  });
  chrome.declarativeNetRequest.getMatchedRules(
    { tabId: getTabDetailsOnUpdate },
    (matchedRulesInTab) => {
      console.log("matchedRulesInTab", matchedRulesInTab);
      if (matchedRulesInTab != undefined) {
        let matchedRuleCount = matchedRulesInTab.rulesMatchedInfo.length;

        setBadgeCount(matchedRuleCount, getTabDetailsOnUpdate);

        let found = getMatchedRuleCounts.some(
          (item) => item.tabId === getTabDetailsOnUpdate
        );

        if (!found) {
          getMatchedRuleCounts = [
            ...getMatchedRuleCounts,
            {
              tabId: tab.id,
              URL: tab.url,
              matchedCount: matchedRuleCount,
              matchedRules: matchedRulesInTab.rulesMatchedInfo,
            },
          ];
        }

        if (found) {
          getMatchedRuleCounts.map((item, index) => {
            if (item.tabId == getTabDetailsOnUpdate) {
              getMatchedRuleCounts[index].URL = tab.url;
              getMatchedRuleCounts[index].matchedCount = matchedRuleCount;
              getMatchedRuleCounts[index].matchedRules =
                matchedRulesInTab.rulesMatchedInfo;
            }
          });
        }

        chrome.storage.sync.set({ getMatchedRuleCounts });
      } else {
        console.error("Rule test limit exceed - ", matchedRulesInTab);
        console.error("Captured Data - ", getMatchedRuleCounts);
      }
    }
  );
}

function updateDynamicRules(deleteItems, formRules) {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: deleteItems,
    addRules: formRules,
  });
}

function dynamicRulesHandler(getItm) {
  let deleteItems = [];
  let formRules = [];
  // let blockUrls = ["goo"];
  let blockUrls = [];

  let dynBlockSite = _dynBlockSite;
  console.log("dynBlockSite", dynBlockSite);
  if (dynBlockSite.length > 0) {
    dynBlockSite.map((item) => (blockUrls = [...blockUrls, item.url]));
    // if (dynBlockSite.length) {
    console.log("URLS to block : ", blockUrls);
    getItm.map((itm) => {
      deleteItems = [...deleteItems, itm.id];
    });

    blockUrls.forEach((domain, index) => {
      let id = index + 1;
      formRules = [
        ...formRules,
        {
          id: id,
          priority: 1,
          action: { type: "block" },
          condition: { urlFilter: domain, resourceTypes: ["main_frame"] },
        },
      ];
    });

    updateDynamicRules(deleteItems, formRules);
    // chrome.declarativeNetRequest.getDynamicRules((a) =>console.log(a));
  } else {
    getItm.map((itm) => {
      deleteItems = [...deleteItems, itm.id];
    });

    blockUrls.forEach((domain, index) => {
      let id = index + 1;
      formRules = [
        ...formRules,
        {
          id: id,
          priority: 1,
          action: { type: "block" },
          condition: { urlFilter: domain, resourceTypes: ["main_frame"] },
        },
      ];
    });

    updateDynamicRules(deleteItems, formRules);
  }
}

function getText(value, toSearchVal) {
  console.log("getText", value, toSearchVal);
  return (
    value
      .toLowerCase()
      .toString()
      .indexOf(toSearchVal.toLowerCase().toString()) >= 0
  );
}
