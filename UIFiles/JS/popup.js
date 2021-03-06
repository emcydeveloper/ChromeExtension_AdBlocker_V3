let analytics = document.getElementById("analytics");
let ads = document.getElementById("ads");
let e_commerce = document.getElementById("e_commerce");
let more = document.getElementById("more");
let tabURL = document.getElementById("url");
let btnBlockStatus = document.getElementById("btn-block");
let btnAllowStatus = document.getElementById("btn-allow");
let chkAppControl = document.getElementById("app-control");
let divUiControl = document.getElementById("on-off-container");
let graphImage = document.getElementById("img-securityPreference");
let onOffImage = document.getElementById("onoff");
//pointer-events
let _appControl = true;
let adBlockStateManage = {};
let checkLocalStorage = localStorage.hasOwnProperty("_adBlockStateManage");

//../images/Off.png || ../images/On.png
// btnBlockStatus.disabled === true ? btnBlockStatus.style.cursor = "cursor" :btnBlockStatus.style.cursor = "pointer"
// btnAllowStatus.disabled === true ? btnBlockStatus.style.cursor = "cursor" :btnBlockStatus.style.cursor = "pointer"

function setOnOffUi(value) {
  value
    ? (onOffImage.src = "../images/On.png")
    : (onOffImage.src = "../images/Off.png");
  value
    ? (divUiControl.style.pointerEvents = "auto")
    : (divUiControl.style.pointerEvents = "none");
}

async function securityPreference() {
  let autofillCreditCardEnabled = new Promise((res, rej) => {
    chrome.privacy.services.autofillCreditCardEnabled.get({}, (details) => {
      res(details.value);
    });
  });

  let passwordSavingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.passwordSavingEnabled.get({}, (details) => {
      res(details.value);
    });
  });

  let safeBrowsingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.safeBrowsingEnabled.get({}, (details) => {
      res(details.value);
    });
  });

  let doNotTrackEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.doNotTrackEnabled.get({}, (details) => {
      res(details.value);
    });
  });

  let hyperlinkAuditingEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.hyperlinkAuditingEnabled.get({}, (details) => {
      res(details.value);
    });
  });

  return Promise.all([
    autofillCreditCardEnabled,
    passwordSavingEnabled,
    safeBrowsingEnabled,
    doNotTrackEnabled,
    hyperlinkAuditingEnabled,
  ]).then((values) => {
    return {
      values,
      // autofillCreditCardEnabled: values[0],passwordSavingEnabled: values[1],safeBrowsingEnabled: values[2],doNotTrackEnabled: values[3],hyperlinkAuditingEnabled: values[4]
    };
  });
}

function setGraphImage(count) {
  switch (count) {
    case 0:
      graphImage.src = "../images/graph0.png";
      break;

    case 1:
      graphImage.src = "../images/graph1.png";
      break;

    case 2:
      graphImage.src = "../images/graph2.png";
      break;

    case 3:
      graphImage.src = "../images/graph3.png";
      break;

    case 4:
      graphImage.src = "../images/graph4.png";
      break;

    case 5:
      graphImage.src = "../images/graph5.png";
      break;

    default:
      console.error("Error while setting graph images");
  }
}

window.onload = async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(queryOptions);

  let preference = await securityPreference();

  console.log("Security Preference Values - ", preference.values);

  setGraphImage(preference.values.filter((count) => count === true).length);

  chrome.storage.sync.get(
    "getMatchedRuleCounts",
    ({ getMatchedRuleCounts }) => {
      let getBlockList = [];
      getMatchedRuleCounts
        .filter((getRules) => {
          return getRules.matchedRules.length > 0;
        })
        .map((firstItems) => {
          firstItems.matchedRules.map((items) => {
            getBlockList = [
              ...getBlockList,
              { ...items.rule, tabId: items.tabId, tabUrl: firstItems.URL },
            ];
          });
        });
      console.log("getBlockList - ", getBlockList);
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
  tabURL.innerText = urlTrim(url);
}

function urlTrim(url) {
  return url.split(".com")[0] + ".com";
}

function getSetLocalStorage(currentUrl) {
  console.log("From UI - Current URL", currentUrl);

  if (checkLocalStorage === true) {
    let { dynBlockSite, adBlockStatus, allowAdonSites } = JSON.parse(
      localStorage.getItem("_adBlockStateManage")
    );
    console.log(
      "|**********Data from Local storage***********|",
      dynBlockSite,
      adBlockStatus,
      allowAdonSites
    );
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: dynBlockSite,
      adBlockStatus: adBlockStatus,
      allowAdonSites: allowAdonSites,
    };
    _appControl = adBlockStatus;
    chkAppControl.checked = _appControl;
    setOnOffUi(_appControl);
    btnBlockStatus.disabled = dynBlockSite.some(
      (item) => item.url == currentUrl
    );

    //For future user block to button change on UI
    // let results = adBlockStateManage.dynBlockSite.filter((getItem) =>{
    //   btnBlockStatus.disabled = getText(currentUrl, getItem.url)
    // }
    // );
    // console.log(results);

    btnAllowStatus.disabled = !btnBlockStatus.disabled;
  } else {
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: [],
      adBlockStatus: _appControl,
      allowAdonSites: [],
    };
    btnBlockStatus.disabled = false;
    btnAllowStatus.disabled = !btnBlockStatus.disabled;
    chkAppControl.checked = _appControl;
    // _appControl === true
    //   ? (divUiControl.style.pointerEvents = "auto")
    //   : (divUiControl.style.pointerEvents = "none");
    setOnOffUi(_appControl);
    setValueToStorage(adBlockStateManage);
  }

  btnBlockStatus.addEventListener("click", () => handleBlockClick("block"));
  btnAllowStatus.addEventListener("click", () => handleBlockClick("allow"));
  chkAppControl.addEventListener("click", () => {
    _appControl = !_appControl;
    chkAppControl.checked = _appControl;
    setOnOffUi(_appControl);
    adBlockStateManage = {
      ...adBlockStateManage,
      adBlockStatus: _appControl,
    };

    setValueToStorage(adBlockStateManage);
  });

  function handleBlockClick(getHandler) {
    btnAllowStatus.disabled = !btnAllowStatus.disabled;
    btnBlockStatus.disabled = !btnBlockStatus.disabled;
    blockAllowHandler(getHandler, currentUrl);
  }
}

function blockAllowHandler(getHandler, currentUrl) {
  switch (getHandler) {
    case "block":
      adBlockStateManage.dynBlockSite = [
        ...adBlockStateManage.dynBlockSite,
        { url: currentUrl, alteredUrl: currentUrl + "alter", type: true },
      ];
      btnAllowStatus.disabled = false;
      btnBlockStatus.disabled = true;
      chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;

    case "allow":
      adBlockStateManage.dynBlockSite.map((item) =>
        item.url == currentUrl ? (item.type = false) : item
      );
      btnBlockStatus.disabled = false;
      btnAllowStatus.disabled = true;
      chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;

    default:
      console.error("Error in switch case while handling block/allow");
  }

  adBlockStateManage.dynBlockSite = adBlockStateManage.dynBlockSite.filter(
    (item) => item.type != false
  );

  adBlockStateManage = {
    ...adBlockStateManage,
    adBlockStatus: _appControl,
  };
  setValueToStorage(adBlockStateManage);
}

function dynamicRulesHandler(getItm) {
  let deleteItems = [];
  let formRules = [];
  // let blockUrls = ["goo"];
  let blockUrls = [];

  let dynBlockSite = adBlockStateManage.dynBlockSite;
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

function updateDynamicRules(deleteItems, formRules) {
  console.log("deleteItems - ", deleteItems);
  console.log("formRules - ", formRules);
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: deleteItems,
    addRules: formRules,
  });
}

function setValueToStorage(adBlockStateManage) {
  localStorage.setItem(
    "_adBlockStateManage",
    JSON.stringify(adBlockStateManage)
  );
  console.log("before syn store ", adBlockStateManage);

  chrome.storage.sync.set({ adBlockStateManage }, (value) =>
    console.log("Chrome storage sync set  - ", value)
  );
}

function getText(value, toSearchVal) {
  return (
    value
      .toLowerCase()
      .toString()
      .indexOf(toSearchVal.toLowerCase().toString()) >= 0
  );
}
