let analytics = document.getElementById("analytics");
let ads = document.getElementById("ads");
let e_commerce = document.getElementById("e_commerce");
let more = document.getElementById("more");
let tabURL = document.getElementById("url");
// let btnBlockStatus = document.getElementById("btn-block");
// let btnAllowStatus = document.getElementById("btn-allow");
let chkAppControl = document.getElementById("app-control");
let divUiControl = document.getElementById("container");
let txtToBlock = document.getElementById("txt-site-to-block");
var radioContainer = document.getElementById("div-radio");
let btnUserInputBlock = document.getElementById("btn-site-to-block");
let btnDynamicUserInput = document.getElementById("dynamic-block-allow");

document.getElementById("blocksite-table").style.display = "block";
document.getElementById("allow-ad-site-table").style.display = "none";

// let _dynBlockSite = [];
// let _allowAdonSites = ["dinamalar", "google", "ganesh"];
let _appControl = true;
let adBlockStateManage = {};
let checkLocalStorage = localStorage.hasOwnProperty("_adBlockStateManage");

btnUserInputBlock.disabled = true;

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

      // setValue(
      //   tab.url,
      //   getBlockList.filter((items) => {
      //     return items.tabId == tab.id;
      //   })
      // );
    }
  );
  getSetLocalStorage(tab.url);
};

// function setValue(url, blockedRule) {
//   analytics.innerHTML = blockedRule.filter((item) => {
//     return item.rulesetId == "analytics";
//   }).length;
//   ads.innerHTML = blockedRule.filter((item) => {
//     return item.rulesetId == "ads";
//   }).length;
//   e_commerce.innerHTML = blockedRule.filter((item) => {
//     return item.rulesetId == "socialmedia";
//   }).length;
//   tabURL.innerText = url;
// }

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
    // _dynBlockSite = dynBlockSite;
    _appControl = adBlockStatus;
    chkAppControl.checked = _appControl;
    // _appControl === true
    //   ? (divUiControl.style.pointerEvents = "auto")
    //   : (divUiControl.style.pointerEvents = "none");

    // btnBlockStatus.disabled = dynBlockSite.some(
    //   (item) => item.url == currentUrl
    // );

    //For future user block to button change on UI
    // let results = adBlockStateManage.dynBlockSite.filter((getItem) =>{
    //   btnBlockStatus.disabled = getText(currentUrl, getItem.url)
    // }
    // );
    // console.log(results);

    // btnAllowStatus.disabled = !btnBlockStatus.disabled;

    tableDisplayBlockedSites(dynBlockSite);
    tableAdAllowedSites(allowAdonSites);
  } else {
    adBlockStateManage = {
      ...adBlockStateManage,
      dynBlockSite: [],
      adBlockStatus: _appControl,
      allowAdonSites: [],
    };
    // btnBlockStatus.disabled = false;
    // btnAllowStatus.disabled = !btnBlockStatus.disabled;
    chkAppControl.checked = _appControl;
    // _appControl === true
    //   ? (divUiControl.style.pointerEvents = "auto")
    //   : (divUiControl.style.pointerEvents = "none");

    // console.log("before syn store in else", adBlockStateManage);
    setValueToStorage(adBlockStateManage);
    tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    tableAdAllowedSites(adBlockStateManage.allowAdonSites);
  }

  // btnBlockStatus.addEventListener("click", () => handleBlockClick("block"));
  // btnAllowStatus.addEventListener("click", () => handleBlockClick("allow"));
  chkAppControl.addEventListener("click", () => {
    _appControl = !_appControl;
    chkAppControl.checked = _appControl;
    console.log(chkAppControl.checked);
    // _appControl === true
      // ? (divUiControl.style.pointerEvents = "auto")
      // : (divUiControl.style.pointerEvents = "none");
    adBlockStateManage = {
      ...adBlockStateManage,
      adBlockStatus: _appControl,
    };
    setValueToStorage(adBlockStateManage);
  });

  txtToBlock.addEventListener("keydown", (getEvent) => {
    if (getEvent.target.value.length > 3) {
      btnUserInputBlock.disabled = false;
      let results = adBlockStateManage.dynBlockSite.filter((getItem) =>
        getText(getItem.url, getEvent.target.value)
      );
      results.length > 0
        ? tableDisplayBlockedSites(results)
        : tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    } else {
      btnUserInputBlock.disabled = true;
      tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
    }
  });

  btnUserInputBlock.addEventListener("click", () => {
    userUrlToBlock = txtToBlock.value;
    if (
      adBlockStateManage.dynBlockSite.some((item) => item.url == userUrlToBlock)
    ) {
      txtToBlock.value = "";
    } else {
      blockAllowHandler("block", userUrlToBlock);
    }
  });

  btnDynamicUserInput.addEventListener("click", () => {
    userUrlToBlock = txtToBlock.value;
    if (btnDynamicUserInput.value == "Sitesblocked") {
      if (
        adBlockStateManage.dynBlockSite.some(
          (item) => item.url == userUrlToBlock
        )
      ) {
        txtToBlock.value = "";
        alert("Alerady Blcoked");
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
      } else {
        adBlockStateManage.allowAdonSites = [
          ...adBlockStateManage.allowAdonSites,
          txtToBlock.value,
        ];
        tableAdAllowedSites(adBlockStateManage.allowAdonSites);
        setValueToStorage(adBlockStateManage);
      }
    }
  });

  // Sitesblocked
  // AllowAdOnSites
  radioContainer.onchange = function (e) {
    switch (e.target.value) {
      case "Sitesblocked":
        document.getElementById("blocksite-table").style.display = "block";
        document.getElementById("allow-ad-site-table").style.display = "none";
        btnDynamicUserInput.value = "Sitesblocked";
        btnDynamicUserInput.innerText = "Block Site";
        tableDisplayBlockedSites(adBlockStateManage.dynBlockSite);
        break;

      case "AllowAdOnSites":
        document.getElementById("blocksite-table").style.display = "none";
        document.getElementById("allow-ad-site-table").style.display = "block";
        btnDynamicUserInput.value = "AllowAdOnSites";
        btnDynamicUserInput.innerText = "Allow Ad";
        tableAdAllowedSites(adBlockStateManage.allowAdonSites);
        //tableAdAllowedSites

        break;

      default:
        console.error("Error in radio");
    }
    // if(e.target.value === 'color')
    // 	document.getElementsByTagName("fieldset")[0].style.backgroundColor = e.target.value;
  };

  function handleBlockClick(getHandler) {
    // btnAllowStatus.disabled = !btnAllowStatus.disabled;
    // btnBlockStatus.disabled = !btnBlockStatus.disabled;
    blockAllowHandler(getHandler, currentUrl);
    // pStatus.innerText = `You chossen to - ${getHandler}`;
  }
  // console.log("_____________adBlockStateManage", adBlockStateManage);
}

function blockAllowHandler(getHandler, currentUrl) {
  switch (getHandler) {
    case "block":
      adBlockStateManage.dynBlockSite = [
        ...adBlockStateManage.dynBlockSite,
        { url: currentUrl, alteredUrl: currentUrl + "alter", type: true },
      ];
      // btnAllowStatus.disabled = false;
      // btnBlockStatus.disabled = true;
      break;
    case "allow":
      adBlockStateManage.dynBlockSite.map((item) =>
        item.url == currentUrl ? (item.type = false) : item
      );
      // btnBlockStatus.disabled = false;
      // btnAllowStatus.disabled = true;
      break;
    default:
      console.error("Error in switch case while handling block/allow");
  }
  // let { dynBlockSite, adBlockStatus, allowAdonSites } = adBlockStateManage;
  // console.log("dynBlockSite", adBlockStateManage.dynBlockSite);

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
  let row_1 = document.createElement("tr");
  let heading_1 = document.createElement("th");
  heading_1.innerHTML = "Sr. No.";
  let heading_2 = document.createElement("th");
  heading_2.innerHTML = "URL";
  let heading_3 = document.createElement("th");
  heading_3.innerHTML = "Change Status";

  row_1.appendChild(heading_1);
  row_1.appendChild(heading_2);
  row_1.appendChild(heading_3);
  thead.appendChild(row_1);

  // Creating and adding data to second row of the table
  getBlockedSites.map((item, index) => {
    let row = document.createElement("tr");
    row.setAttribute("id", "tableDisplayBlockedSites" + index);

    let data_1 = document.createElement("td");
    data_1.innerHTML = index;
    data_1.setAttribute("class", "blocksite-row-data");

    let data_2 = document.createElement("td");
    data_2.innerHTML = item;
    data_2.setAttribute("class", "blocksite-row-data");

    let data_3 = document.createElement("td");
    data_3.innerHTML = `<button id=tableDisplayBlockedSites-${item} class="btn-delete-site">Allow</button>`;

    row.appendChild(data_1);
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

    var id = data[0].innerHTML;
    var url = data[1].innerHTML;
    blockAllowHandler("allow", url);
  }
}

function getText(value, toSearchVal) {
  // console.log(value, toSearchVal);
  return (
    value
      .toLowerCase()
      .toString()
      .indexOf(toSearchVal.toLowerCase().toString()) >= 0
  );
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
  let row_1 = document.createElement("tr");
  let heading_1 = document.createElement("th");
  heading_1.innerHTML = "Sr. No.";
  let heading_2 = document.createElement("th");
  heading_2.innerHTML = "URL";
  let heading_3 = document.createElement("th");
  heading_3.innerHTML = "Change Status";

  row_1.appendChild(heading_1);
  row_1.appendChild(heading_2);
  row_1.appendChild(heading_3);
  thead.appendChild(row_1);

  // Creating and adding data to second row of the table
  blockedSites.map((item, index) => {
    let row = document.createElement("tr");
    row.setAttribute("id", "AdAllowedSites" + index);

    let data_1 = document.createElement("td");
    data_1.innerHTML = index;
    data_1.setAttribute("class", "row-data");

    let data_2 = document.createElement("td");
    data_2.innerHTML = item;
    data_2.setAttribute("class", "row-data");

    let data_3 = document.createElement("td");
    data_3.innerHTML = `<button id=tableAdAllowedSites-${item} class="delete-site">Allow</button>`;

    row.appendChild(data_1);
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

    let id = data[0].innerHTML;
    let url = data[1].innerHTML;
    // console.log("allow", url);
    // adBlockStateManage.allowAdonSites = {...adBlockStateManage,allowAdonSites: [...adBlockStateManage.allowAdonSites,adBlockStateManage.allowAdonSites.filter(item => item != url)]}

    adBlockStateManage.allowAdonSites =
      adBlockStateManage.allowAdonSites.filter((item) => item != url);

    setValueToStorage(adBlockStateManage);
    // console.log("final", adBlockStateManage);
  }
}

// console.log(JSON.stringify(adBlockStateManage));
