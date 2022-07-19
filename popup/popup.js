let analytics = document.getElementById("analytics");
let ads = document.getElementById("ads");
let e_commerce = document.getElementById("e_commerce");
let more = document.getElementById("more");
let tabURL = document.getElementById("url");
let btnBlockStatus = document.getElementById("btn-block");
let btnAllowStatus = document.getElementById("btn-allow");
let chkAppControl = document.getElementById("app-control");
let divUiControl = document.getElementById("on-off-container");

let _appControl = true;
let adBlockStateManage = {};
let checkLocalStorage = localStorage.hasOwnProperty("_adBlockStateManage");


/******************************************************/

function init() {
  var port = null;
  document.getElementById("testing").addEventListener('click', function () {
      filename = "hostapp/VRConsoleApp.exe";
      var analyticsCount = document.getElementById("analytics").innerHTML;
      var AdsCount = document.getElementById("ads").innerHTML;
      var ECommerceCount = document.getElementById("e_commerce").innerHTML;
      var OthersCount = document.getElementById("more").innerHTML;
      //chrome.extension.connectNative("adhost");
      chrome.runtime.sendNativeMessage('adhost', { "Analytics": 1, "Ads": 2, "ECommerce": 3, "Others": 4,"Name":"Chrome","status":"On" },
          function (response) {
            console.log(response);
              if (typeof chrome.runtime.lastError === "undefined" || chrome.runtime.lastError.message.indexOf("not found") === -1) {
                   success = true;
                  //alert('Exe already running')
              }
          });

  });
}

document.addEventListener('DOMContentLoaded', init);


/******************************************************/





let autofillEnabled = new Promise((res, rej) => {
  chrome.privacy.services.autofillEnabled.get({}, function (details) {
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


autofillEnabled.then(output => console.log("Auto fill enabled - ", output))
passwordSavingEnabled.then(output => console.log("Password saving enabled - ", output));
safeBrowsingEnabled.then(output => console.log("Safe browsing enabled - ", output));
doNotTrackEnabled.then(output => console.log("Do not track enabled - ",  output));

Promise.all([autofillEnabled, passwordSavingEnabled, safeBrowsingEnabled,doNotTrackEnabled]).then((values) => {
  console.log("Alllllllllllllllllll - ",values);
});



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
  tabURL.innerText = url.split(".com")[0] + ".com";
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
    _appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");

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
    _appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");
    setValueToStorage(adBlockStateManage);
  }

  btnBlockStatus.addEventListener("click", () => handleBlockClick("block"));
  btnAllowStatus.addEventListener("click", () => handleBlockClick("allow"));
  chkAppControl.addEventListener("click", () => {
    _appControl = !_appControl;
    chkAppControl.checked = _appControl;
    console.log(chkAppControl.checked);
    _appControl === true
      ? (divUiControl.style.pointerEvents = "auto")
      : (divUiControl.style.pointerEvents = "none");
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
      break;
    case "allow":
      adBlockStateManage.dynBlockSite.map((item) =>
        item.url == currentUrl ? (item.type = false) : item
      );
      btnBlockStatus.disabled = false;
      btnAllowStatus.disabled = true;
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
