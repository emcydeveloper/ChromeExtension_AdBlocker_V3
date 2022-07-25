let tabURL = document.getElementById("url");
let chkAppControl = document.getElementById("app-control");
let divUiControl = document.getElementById("container");
let txtToBlock = document.getElementById("txt-site-to-block");
var radioContainer = document.getElementById("div-radio");
// let btnUserInputBlock = document.getElementById("btn-site-to-block");
let btnDynamicUserInput = document.getElementById("dynamic-block-allow");

const dContainer = document.querySelector("#TabsSystem");

dContainer.querySelectorAll(".TabButton").forEach(
  (tab) =>
    (tab.onclick = (_) => {
      dContainer.dataset.tab = tab.dataset.tab;
    })
);

document.getElementById("blocksite-table").style.display = "block";
document.getElementById("allow-ad-site-table").style.display = "none";

btnDynamicUserInput.value = "Sitesblocked";
btnDynamicUserInput.innerText = "Block";
// btnUserInputBlock.disabled = true;
btnDynamicUserInput.disabled = true;

let _appControl = true;
let adBlockStateManage = {};
let checkLocalStorage = localStorage.hasOwnProperty("_adBlockStateManage");

window.onload = async function getCurrentTab() {
  console.log("window.onload")
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
    }
  );
  getSetLocalStorage(tab.url);
};

function getSetLocalStorage(currentUrl) {

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

    tableDisplayBlockedSites(dynBlockSite);
    tableAdAllowedSites(allowAdonSites);
  } else {
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: [],
      adBlockStatus: _appControl,
      allowAdonSites: [],
    };

    chkAppControl.checked = _appControl;

    setValueToStorage(adBlockStateManage);
    tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    tableAdAllowedSites(adBlockStateManage.allowAdonSites);
  }

  chkAppControl.addEventListener("click", () => {
    _appControl = !_appControl;
    chkAppControl.checked = _appControl;
    console.log(chkAppControl.checked);

    adBlockStateManage = {
      ...adBlockStateManage,
      adBlockStatus: _appControl,
    };
    setValueToStorage(adBlockStateManage);
  });

  txtToBlock.addEventListener("keyup", (getEvent) => {
    // console.log("txtToBlock.addEventListener",getEvent)
    if (getEvent.target.value.length > 3) {
      // btnUserInputBlock.disabled = false;
      btnDynamicUserInput.disabled = false;
      let results = adBlockStateManage.dynBlockSite.filter((getItem) =>
        getText(getItem.url, getEvent.target.value)
      );
      results.length > 0
        ? tableDisplayBlockedSites(results)
        : tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    } else {
      // btnUserInputBlock.disabled = true;
      btnDynamicUserInput.disabled = true;
      tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    }
  });

  btnDynamicUserInput.addEventListener("click", () => {
    userUrlToBlock = txtToBlock.value;
    if (btnDynamicUserInput.value == "Sitesblocked") {
      // console.log("Block Webstie",   adBlockStateManage.dynBlockSite.some((item) => item.url == userUrlToBlock))
      if (
        adBlockStateManage.dynBlockSite.some(
          (item) => item.url == userUrlToBlock
        )
      ) {
        txtToBlock.value = "";
        alert("Alerady Blcoked");
        tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
      } else {
        blockAllowHandler("block", userUrlToBlock);
      }
    }
    if (btnDynamicUserInput.value == "AllowAdOnSites") {
      if (
        adBlockStateManage.allowAdonSites.some((item) => item == userUrlToBlock)
      ) {
        txtToBlock.value = "";
        alert("Alerady Blcoked");
        tableAdAllowedSites(adBlockStateManage.allowAdonSites);
      } else {
        adBlockStateManage.allowAdonSites = [
          ...adBlockStateManage.allowAdonSites,
          txtToBlock.value,
        ];
        tableAdAllowedSites(adBlockStateManage.allowAdonSites);
        setValueToStorage(adBlockStateManage);
      }
    }
    txtToBlock.value = "";
    btnDynamicUserInput.disabled = true;
  });

  // Sitesblocked
  // AllowAdOnSites
  radioContainer.onchange = function (e) {
    txtToBlock.value = "";
    btnDynamicUserInput.disabled = true;
    switch (e.target.value) {
      case "Sitesblocked":
        document.getElementById("blocksite-table").style.display = "block";
        document.getElementById("allow-ad-site-table").style.display = "none";
        btnDynamicUserInput.value = "Sitesblocked";
        btnDynamicUserInput.innerText = "Block";
        tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
        break;

      case "AllowAdOnSites":
        document.getElementById("blocksite-table").style.display = "none";
        document.getElementById("allow-ad-site-table").style.display = "block";
        btnDynamicUserInput.value = "AllowAdOnSites";
        btnDynamicUserInput.innerText = "Allow";
        tableAdAllowedSites(adBlockStateManage.allowAdonSites);
        break;

      default:
        console.error("Error in radio button");
    }
  };
}

function blockAllowHandler(getHandler, currentUrl) {
  switch (getHandler) {
    case "block":
      adBlockStateManage.dynBlockSite = [
        ...adBlockStateManage.dynBlockSite,
        { url: currentUrl, alteredUrl: currentUrl + "alter", type: true },
      ];
      chrome.declarativeNetRequest.getDynamicRules(dynamicRulesHandler);
      break;

    case "allow":
      adBlockStateManage.dynBlockSite.map((item) =>
        item.url == currentUrl ? (item.type = false) : item
      );
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
    // dynBlockSite: _dynBlockSite,
    adBlockStatus: _appControl,
    // allowAdonSites: adBlockStateManage.allowAdonSites,
  };
  tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
  setValueToStorage(adBlockStateManage);
}

function updateDynamicRules(deleteItems, formRules) {
  console.log("deleteItems - ", deleteItems);
  console.log("formRules - ", formRules);
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

function setValueToStorage(adBlockStateManage) {
  localStorage.setItem(
    "_adBlockStateManage",
    JSON.stringify(adBlockStateManage)
  );
  console.log("before syn store ", adBlockStateManage);

  chrome.storage.sync.set({ adBlockStateManage }, (value) =>
    console.log("Chrome storage sync set  - ", value)
  );
  tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
  tableAdAllowedSites(adBlockStateManage.allowAdonSites);
}
//td_ClassName - blocksite-row-data,btn-delete-site "blocksite-table"
function tableDisplayBlockedSites(blockedSites) {
  document.getElementById("blocksite-table").innerHTML = "";

  let getBlockedSites = blockedSites.map((item) => item.url);

  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);
  document.getElementById("blocksite-table").appendChild(table);

  // Creating and adding data to first row of the table
  // let row_1 = document.createElement("tr");
  // let heading_1 = document.createElement("th");
  // heading_1.innerHTML = "Sr. No.";
  // let heading_2 = document.createElement("th");
  // heading_2.innerHTML = "URL";
  // let heading_3 = document.createElement("th");
  // heading_3.innerHTML = "Change Status";

  // row_1.appendChild(heading_1);
  // row_1.appendChild(heading_2);
  // row_1.appendChild(heading_3);
  // thead.appendChild(row_1);

  // Creating and adding data to second row of the table
  getBlockedSites.map((getUrl, index) => {
    let row = document.createElement("tr");
    row.setAttribute("id", "tableDisplayBlockedSites" + index);

    // let data_1 = document.createElement("td");
    // data_1.innerHTML = index;
    // data_1.setAttribute("class", "blocksite-row-data");

    let data_2 = document.createElement("td");
    data_2.innerHTML = getUrl;
    data_2.setAttribute("class", "blocksite-row-data");

    let data_3 = document.createElement("td");
    // data_3.innerHTML = `<button id=tableDisplayBlockedSites-${item} class="btn-delete-site">Delete</button>`;
    data_3.innerHTML = `<i  id=tableDisplayBlockedSites-${getUrl} class="btn-delete-site fa fa-trash-o"></i>`;

    // row.appendChild(data_1);
    row.appendChild(data_2);
    row.appendChild(data_3);
    tbody.appendChild(row);
  });

  let getDeleteSite = document.querySelectorAll(".btn-delete-site");
  // console.log("getDeleteSite", getDeleteSite);

  getDeleteSite.forEach((id) => {
    // console.log("id", id);
    document.getElementById(id.id).addEventListener("click", handleSiteDelete);
  });

  function handleSiteDelete(e) {
    // console.log(e);
    var rowId = e.target.parentNode.parentNode.id;
    var data = document
      .getElementById(rowId)
      .querySelectorAll(".blocksite-row-data");
    // console.log("**********************", rowId, data);

    // var id = data[0].innerHTML;
    var url = data[0].innerHTML;
    blockAllowHandler("allow", url);
  }
}

function tableAdAllowedSites(blockedSites) {
  document.getElementById("allow-ad-site-table").innerHTML = "";
  // console.log(blockedSites);

  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");
  table.appendChild(thead);
  table.appendChild(tbody);
  document.getElementById("allow-ad-site-table").appendChild(table);

  // Creating and adding data to first row of the table
  // let row_1 = document.createElement("tr");
  // let heading_1 = document.createElement("th");
  // heading_1.innerHTML = "Sr. No.";
  // let heading_2 = document.createElement("th");
  // heading_2.innerHTML = "URL";
  // let heading_3 = document.createElement("th");
  // heading_3.innerHTML = "Change Status";

  // row_1.appendChild(heading_1);
  // row_1.appendChild(heading_2);
  // row_1.appendChild(heading_3);
  // thead.appendChild(row_1);

  // Creating and adding data to second row of the table
  blockedSites.map((getUrl, index) => {
    let row = document.createElement("tr");
    row.setAttribute("id", "AdAllowedSites" + index);

    // let data_1 = document.createElement("td");
    // data_1.innerHTML = index;
    // data_1.setAttribute("class", "row-data");

    let data_2 = document.createElement("td");
    data_2.innerHTML = getUrl;
    data_2.setAttribute("class", "row-data");

    let data_3 = document.createElement("td");
    // data_3.innerHTML = `<button id=tableAdAllowedSites-${item} class="delete-site">Delete</button>`;
    data_3.innerHTML = `<i  id=tableAdAllowedSites-${getUrl} class="delete-site fa fa-trash-o"></i>`;

    // row.appendChild(data_1);
    row.appendChild(data_2);
    row.appendChild(data_3);
    tbody.appendChild(row);
  });

  let getDeleteSite = document.querySelectorAll(".delete-site");

  getDeleteSite.forEach((id) => {
    document.getElementById(id.id).addEventListener("click", handleSite);
  });

  function handleSite(e) {
    let rowId = e.target.parentNode.parentNode.id;

    let data = document.getElementById(rowId).querySelectorAll(".row-data");

    // console.log(data);

    // let id = data[0].innerHTML;
    let url = data[0].innerHTML;
    // console.log("allow", url);
    // adBlockStateManage.allowAdonSites = {...adBlockStateManage,allowAdonSites: [...adBlockStateManage.allowAdonSites,adBlockStateManage.allowAdonSites.filter(item => item != url)]}

    adBlockStateManage.allowAdonSites =
      adBlockStateManage.allowAdonSites.filter((item) => item != url);

    setValueToStorage(adBlockStateManage);
    // console.log("final", adBlockStateManage);
  }
}

// console.log(JSON.stringify(adBlockStateManage));
function getText(value, toSearchVal) {
  // console.log(value, toSearchVal);
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
