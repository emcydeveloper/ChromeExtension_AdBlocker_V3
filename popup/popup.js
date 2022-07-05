let analytics = document.getElementById("analytics");
let ads = document.getElementById("ads");
let e_commerce = document.getElementById("e_commerce");
let more = document.getElementById("more");
let tabURL = document.getElementById("url");
let btnBlockStatus = document.getElementById("btn-block");
let btnAllowStatus = document.getElementById("btn-allow");
let chkAppControl = document.getElementById("app-control");
let divUiControl = document.getElementById("container");
// divUiControl.style.pointerEvents= 'none';
// divUiControl.disabled = true;
// let btnAllowStatus = document.getElementById("allowurl");
// let btnBlockStatus = document.getElementById("blockurl");
let dynBlockSite = [];
let _allowAdonSites = ["https://www.dinamalar.com/"]
let appControl = true;
let adBlockStateManage = {};
let checkLocalStorage = localStorage.hasOwnProperty("_adBlockStateManage");

window.onload = async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(queryOptions);
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
  getSetLocalStorage(tab.url);
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

function getSetLocalStorage(currentUrl) {
  console.log(currentUrl);

  if (checkLocalStorage === true) {
    let { dynBlockSite, adBlockStatus, allowAdonSites } = JSON.parse(
      localStorage.getItem("_adBlockStateManage")
    );
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: dynBlockSite,
      adBlockStatus: adBlockStatus,
      allowAdonSites: allowAdonSites,
    };
    appControl = adBlockStatus;
    chkAppControl.checked = appControl;
    appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");
    console.log(btnBlockStatus.disabled);
    btnBlockStatus.disabled = dynBlockSite.some(
      (item) => item.url == currentUrl
    );
    btnAllowStatus.disabled = !btnBlockStatus.disabled;
  } else {
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: dynBlockSite,
      adBlockStatus: appControl,
      allowAdonSites: _allowAdonSites,
    };
    btnBlockStatus.disabled = false;
    btnAllowStatus.disabled = !btnBlockStatus.disabled;
    chkAppControl.checked = appControl;
    appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");

    console.log("before syn store in else", adBlockStateManage);
    setValueToStorage(adBlockStateManage);

  }


  btnBlockStatus.addEventListener("click", () => handleBlockClick("block"));
  btnAllowStatus.addEventListener("click", () => handleBlockClick("allow"));
  chkAppControl.addEventListener("click", () => {
    appControl = !appControl;
    chkAppControl.checked = appControl;
    appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");
    adBlockStateManage = {
      ...adBlockStateManage,
      adBlockStatus: appControl,
    };
    setValueToStorage(adBlockStateManage);
  });

  function handleBlockClick(getHandler) {
    btnAllowStatus.disabled = !btnAllowStatus.disabled;
    btnBlockStatus.disabled = !btnBlockStatus.disabled;
    blockAllowHandler(getHandler, currentUrl);
    // pStatus.innerText = `You chossen to - ${getHandler}`;
  }
}

function blockAllowHandler(getHandler, currentUrl) {
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
  // let { dynBlockSite, adBlockStatus, allowAdonSites } = adBlockStateManage;
  console.log("dynBlockSite", dynBlockSite);

  dynBlockSite = dynBlockSite.filter((item) => item.type != false);

  adBlockStateManage = {
    ...adBlockStateManage,
    dynBlockSite: dynBlockSite,
    adBlockStatus: appControl,
    allowAdonSites: _allowAdonSites,
  };

  setValueToStorage(adBlockStateManage);
}

function setValueToStorage(adBlockStateManage) {
  localStorage.setItem(
    "_adBlockStateManage",
    JSON.stringify(adBlockStateManage)
  );
  console.log("before syn store inside switch", adBlockStateManage);

  chrome.storage.sync.set({ adBlockStateManage }, (value) =>
    console.log("Chrome storage sync set inside switch - ", value)
  );
}
