let analytics = document.getElementById("analytics");
let ads = document.getElementById("ads");
let e_commerce = document.getElementById("e_commerce");
let more = document.getElementById("more");
let tabURL = document.getElementById("url");
// let btnAllowStatus = document.getElementById("allowurl");
// let btnBlockStatus = document.getElementById("blockurl");

window.onload = async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(queryOptions);

  dynamicURLBlock(tab.url);

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

      setValue(
        tab.url,
        getBlockList.filter((items) => {
          return items.tabId == tab.id;
        })
      );
    }
  );
  // return tab;
};

function setValue(url, blockedRule) {
  analytics.innerHTML = blockedRule.filter((item) => {
    return item.rulesetId == "analytics";
  }).length;
  ads.innerHTML = blockedRule.filter((item) => {
    return item.rulesetId == "ads";
  }).length;
  e_commerce.innerHTML = blockedRule.filter((item) => {
    return item.rulesetId == "socialmedia";
  }).length;
  tabURL.innerText = url;
}

function dynamicURLBlock(currentUrl) {
  console.log(currentUrl);
  let btnBlockStatus = document.getElementById("btn-block");
  let btnAllowStatus = document.getElementById("btn-allow");
  // let pStatus = document.getElementById("status");
  // let txtToBlock = document.getElementById("toBlock").innerText;

  // let currentUrl = currentUrl;
  let dynBlockSite = [];
  // localStorage.setItem("_dynBlockSite", JSON.stringify(dynBlockSite));
  if (localStorage._dynBlockSite) {
    dynBlockSite = JSON.parse(localStorage.getItem("_dynBlockSite"));
    btnBlockStatus.disabled = dynBlockSite.some(
      (item) => item.url == currentUrl
    );
    btnAllowStatus.disabled = !btnBlockStatus.disabled;
    console.log("local", dynBlockSite);
  } else {
    btnBlockStatus.disabled = false;
    btnAllowStatus.disabled = !btnBlockStatus.disabled;
    localStorage.setItem("_dynBlockSite", JSON.stringify(dynBlockSite));
  }

  btnBlockStatus.addEventListener("click", () => handleBlockClick("block"));
  btnAllowStatus.addEventListener("click", () => handleBlockClick("allow"));

  function handleBlockClick(getHandler) {
    btnAllowStatus.disabled = !btnAllowStatus.disabled;
    btnBlockStatus.disabled = !btnBlockStatus.disabled;
    // pStatus.innerText = `You chossen to - ${getHandler}`;

    switch (getHandler) {
      case "block":
        dynBlockSite = [
          ...dynBlockSite,
          { url: currentUrl, alteredUrl: currentUrl + "alter", type: true },
        ];
        break;
      case "allow":
        dynBlockSite.map((item) =>
          item.url == currentUrl ? (item.type = false) : item
        );
        break;
      default:
        console.error("Error in switch case while handling block/allow");
    }
    dynBlockSite = dynBlockSite.filter((item) => item.type != false);
    localStorage.setItem("_dynBlockSite", JSON.stringify(dynBlockSite));
    chrome.storage.sync.set({ dynBlockSite });
    console.log(dynBlockSite);
  }
}
