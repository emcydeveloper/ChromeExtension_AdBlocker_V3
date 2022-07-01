let getBlockBtn = document.getElementById("get-blocked-info");
let catA = document.getElementById("cat-a");
let catB = document.getElementById("cat-b");
let catC = document.getElementById("cat-c");

// When the button is clicked, inject setPageBackgroundColor into current page
getBlockBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

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
              { ...items.rule, tabId: items.tabId },
            ];
          });
        });
      // alert(getBlockList);
      // chrome.scripting.executeScript({
      //   target: { tabId: tab.id },
      //   function: setValue(
      //     tab.id,
      //     getBlockList.filter((items) => {
      //       return items.tabId == tab.id;
      //     })
      //   ),
      // });

      setValue(
          tab.id,
          getBlockList.filter((items) => {
            return items.tabId == tab.id;
          })
        )
    }
  );
  // alert("getBlockList[0].ruleId");

  // catA.innerHTML +=getBlockList[0].ruleId;
  // catB.innerHTML += " test";
  // catC.innerHTML += " test";

  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: setValue(tab.id,getBlockList.filter((items)=>{return items.tabId==tab.id})),
  // });
});

function setValue(tabId, blockedRule) {
  catA.innerHTML += blockedRule.length;
  catB.innerHTML += " test";
  catC.innerHTML += " test";
}
