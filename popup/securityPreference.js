let toggleAutofillCreditCardEnabled = document.getElementById("autofillCreditCardEnabled");
let togglePasswordSavingEnabled = document.getElementById("passwordSavingEnabled");
let toggleSafeBrowsingEnabled = document.getElementById("safeBrowsingEnabled");
let toggleDoNotTrackEnabled = document.getElementById("doNotTrackEnabled");
let toggleHyperlinkAuditingEnabled = document.getElementById("hyperlinkAuditingEnabled");

$(document).ready(function(){
  $("#td-autofillCreditCardEnabled").hover(function(){
    $("#brief-items").text("If enabled, Chrome offers to automatically fill in credit card forms.");
    }, function(){
    $("#brief-items").text("");
  });
});

$(document).ready(function(){
  $("#td-passwordSavingEnabled").hover(function(){
    $("#brief-items").text("If enabled, the password manager will ask if you want to save passwords.");
    }, function(){
    $("#brief-items").text("");
  });
});

$(document).ready(function(){
  $("#td-safeBrowsingEnabled").hover(function(){
    $("#brief-items").text("If enabled, Chrome does its best to protect you from phishing and malware.");
    }, function(){
    $("#brief-items").text("");
  });
});

$(document).ready(function(){
  $("#td-doNotTrackEnabled").hover(function(){
    $("#brief-items").text("If enabled, Chrome sends 'Do Not Track' header with your requests. ");
    }, function(){
    $("#brief-items").text("");
  });
});

$(document).ready(function(){
  $("#td-hyperlinkAuditingEnabled").hover(function(){
    $("#brief-items").text("If enabled, Chrome sends auditing pings when requested by a website");
    }, function(){
    $("#brief-items").text("");
  });
});

let autofillCreditCardEnabled = new Promise((res, rej) => {
    chrome.privacy.services.autofillCreditCardEnabled.get({}, function (details) {
      toggleAutofillCreditCardEnabled.checked = details.value;
      res(details.value);
    });
  });
  
  let passwordSavingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.passwordSavingEnabled.get({}, function (details) {
        togglePasswordSavingEnabled.checked = details.value;
      res(details.value);
    });
  });
  
  let safeBrowsingEnabled = new Promise((res, rej) => {
    chrome.privacy.services.safeBrowsingEnabled.get({}, function (details) {
        toggleSafeBrowsingEnabled.checked = details.value;
      res(details.value);
    });
  });
  
  let doNotTrackEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.doNotTrackEnabled.get({}, function (details) {
        toggleDoNotTrackEnabled.checked = details.value;
      res(details.value);
    });
  });

  let hyperlinkAuditingEnabled = new Promise((res, rej) => {
    chrome.privacy.websites.hyperlinkAuditingEnabled.get({}, function (details) {
      toggleHyperlinkAuditingEnabled.checked = details.value;
      res(details.value);
    });
  });
  
  // toggleHyperlinkAuditingEnabled
//   autofillEnabled.then(output => {console.log("Auto fill enabled - ", output);});
//   passwordSavingEnabled.then(output => {console.log("Password saving enabled - ", output);});
//   safeBrowsingEnabled.then(output => {console.log("Safe browsing enabled - ", output);});
//   doNotTrackEnabled.then(output => {console.log("Do not track enabled - ",  output);});
  
//   Promise.all([autofillEnabled, passwordSavingEnabled, safeBrowsingEnabled,doNotTrackEnabled]).then((values) => {
//     // console.log("Alllllllllllllllllll - ",values);
//   });

  

toggleAutofillCreditCardEnabled.addEventListener("change",()=>{
    chrome.privacy.services.autofillCreditCardEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controlled_by_this_extension' || 'controllable_by_this_extension') {
          chrome.privacy.services.autofillCreditCardEnabled.set({ value: toggleAutofillCreditCardEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("toggleAutofillCreditCardEnabled Hooray, it worked!");
            } else {
              console.log("Sadness!", chrome.runtime.lastError);
            }
          });
        }
      });
})

togglePasswordSavingEnabled.addEventListener("change",()=>{

    chrome.privacy.services.passwordSavingEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controlled_by_this_extension' || 'controllable_by_this_extension') {
          chrome.privacy.services.passwordSavingEnabled.set({ value: togglePasswordSavingEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("togglePasswordSavingEnabled Hooray, it worked!");
            } else {
              console.log("Sadness!", chrome.runtime.lastError);
            }
          });
        }
      });

})

toggleSafeBrowsingEnabled.addEventListener("change",()=>{
  chrome.privacy.services.safeBrowsingEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controlled_by_this_extension' || 'controllable_by_this_extension') {
          chrome.privacy.services.safeBrowsingEnabled.set({ value: toggleSafeBrowsingEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("toggleSafeBrowsingEnabled Hooray, it worked!");
            } else {
              console.log("Sadness!", chrome.runtime.lastError);
            }
          });
        }
      });

})

toggleDoNotTrackEnabled.addEventListener("change",()=>{
    chrome.privacy.websites.doNotTrackEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controllable_by_this_extension' || 'controlled_by_this_extension') {
            chrome.privacy.websites.doNotTrackEnabled.set({ value: toggleDoNotTrackEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("toggleDoNotTrackEnabled Hooray, it worked!");
            } else {
              console.log("Sadness!", chrome.runtime.lastError);
            }
          });
        }
      });

})

// toggleHyperlinkAuditingEnabled

toggleHyperlinkAuditingEnabled.addEventListener("change",()=>{
  chrome.privacy.websites.hyperlinkAuditingEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controlled_by_this_extension' || 'controllable_by_this_extension') {
          chrome.privacy.websites.hyperlinkAuditingEnabled.set({ value: toggleHyperlinkAuditingEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("toggleHyperlinkAuditingEnabled Hooray, it worked!");
            } else {
              console.log("Sadness!", chrome.runtime.lastError);
            }
          });
        }
      });

})