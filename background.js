//Stores the Tab ID with corresponding blocked counts
let getMatchedRuleCounts = [];

chrome.tabs.onUpdated.addListener((getTabDetailsOnUpdate, changeInfo, tab) => {
  // chrome.declarativeNetRequest.GETMATCHEDRULES_QUOTA_INTERVAL = 1;
  // chrome.declarativeNetRequest.MAX_GETMATCHEDRULES_CALLS_PER_INTERVAL = 100;

  console.log(changeInfo.status);
  // chrome.declarativeNetRequest.updateDynamicRules()
  if (changeInfo.status === "loading") {
    chrome.declarativeNetRequest.getDynamicRules((a) =>
      console.log("Before Deleting ***********************************", a)
    );
    let deleteItems = [];
    let formRules = [];
    let blockUrls = [];
    // let _blockUrls = ["https://www.google.com/"];

    chrome.declarativeNetRequest.getDynamicRules((getItm) => {
      chrome.storage.sync.get("dynBlockSite", ({dynBlockSite}) => {

        if(dynBlockSite.length>0){
          dynBlockSite.map((item) => blockUrls = [...blockUrls, item.url]);
          console.log("URLS to block : ", blockUrls);
          getItm.map((itm) => {
            deleteItems = [...deleteItems, itm.id];
          });
          console.log("deleteItems~~~~~~~~~~~~~~~~", deleteItems);
    
          console.log("Deleting/Adding Rules");
    
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
          console.log("formRules",formRules);
          chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: deleteItems, addRules: formRules });
          chrome.declarativeNetRequest.getDynamicRules((a) =>
            console.log(
              "After block rule updated ***********************************",
              a
            )
          );
        }else{
          getItm.map((itm) => {
            deleteItems = [...deleteItems, itm.id];
          });
          console.log("deleteItems~~~~~~~~~~~~~~~~", deleteItems);
    
          console.log("Deleting/Adding Rules");
    
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
          console.log("formRules",formRules);
          chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: deleteItems, addRules: formRules });
          chrome.declarativeNetRequest.getDynamicRules((a) =>
            console.log(
              "After block rule updated ***********************************",
              a
            )
          );
        }
      });
 
    });
  }

  if (changeInfo.status === "complete") {
    console.log(changeInfo);
    chrome.declarativeNetRequest.getMatchedRules(
      { tabId: getTabDetailsOnUpdate },
      (matchedRulesInTab) => {
        if (matchedRulesInTab != undefined) {
          let matchedRuleCount = matchedRulesInTab.rulesMatchedInfo.length;

          console.log(
            "Tab ID: ",
            getTabDetailsOnUpdate,
            "|| Rules Matched: ",
            matchedRulesInTab.rulesMatchedInfo
          );

          setBadgeCount(matchedRuleCount, getTabDetailsOnUpdate);

          console.log("Before Found - ", getMatchedRuleCounts);
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
          console.log("Tab Updated", getMatchedRuleCounts);
          chrome.storage.sync.set({ getMatchedRuleCounts });
        } else {
          console.log("Rule test limit exceed - ", matchedRulesInTab);
          console.log("Captured Data - ", getMatchedRuleCounts);
        }
      }
    );
  }
});

function setBadgeCount(count = 0, tabId) {
  chrome.action.setBadgeText({ text: count.toString(), tabId: tabId });
}
