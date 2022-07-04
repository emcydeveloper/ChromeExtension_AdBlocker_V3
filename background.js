//Stores the Tab ID with corresponding blocked counts
let getMatchedRuleCounts = [];

chrome.tabs.onUpdated.addListener((getTabDetailsOnUpdate, changeInfo, tab) => {
  // chrome.declarativeNetRequest.GETMATCHEDRULES_QUOTA_INTERVAL = 1;
  // chrome.declarativeNetRequest.MAX_GETMATCHEDRULES_CALLS_PER_INTERVAL = 100;

  switch (changeInfo.status) {
    case "loading":
      chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;
    case "complete":
      getRulesStatus(getTabDetailsOnUpdate, tab);
      break;
    default:
      break;
  }
});

function setBadgeCount(count = 0, tabId) {
  chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
}



function getRulesStatus(getTabDetailsOnUpdate, tab) {

  chrome.declarativeNetRequest.getMatchedRules(
    { tabId: getTabDetailsOnUpdate },
    (matchedRulesInTab) => {
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


function dynamicRulesHandler(getItm)  {
  let deleteItems = [];
  let formRules = [];
  let blockUrls = [];
  chrome.storage.sync.get("dynBlockSite", ({ dynBlockSite }) => {
    if (dynBlockSite.length > 0) {
      dynBlockSite.map((item) => (blockUrls = [...blockUrls, item.url]));
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
  });
}