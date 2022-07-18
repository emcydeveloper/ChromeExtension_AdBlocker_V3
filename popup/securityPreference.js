let toggleAutofillEnabled = document.getElementById("autofillEnabled");
let togglePasswordSavingEnabled = document.getElementById("passwordSavingEnabled");
let toggleSafeBrowsingEnabled = document.getElementById("safeBrowsingEnabled");
let toggleDoNotTrackEnabled = document.getElementById("doNotTrackEnabled");


let autofillEnabled = new Promise((res, rej) => {
    chrome.privacy.services.autofillEnabled.get({}, function (details) {
        toggleAutofillEnabled.checked = details.value;
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
  
  
//   autofillEnabled.then(output => {console.log("Auto fill enabled - ", output);});
//   passwordSavingEnabled.then(output => {console.log("Password saving enabled - ", output);});
//   safeBrowsingEnabled.then(output => {console.log("Safe browsing enabled - ", output);});
//   doNotTrackEnabled.then(output => {console.log("Do not track enabled - ",  output);});
  
//   Promise.all([autofillEnabled, passwordSavingEnabled, safeBrowsingEnabled,doNotTrackEnabled]).then((values) => {
//     // console.log("Alllllllllllllllllll - ",values);
//   });

  

  toggleAutofillEnabled.addEventListener("change",()=>{
    chrome.privacy.services.autofillEnabled.get({}, function(details) {
        console.log(details.levelOfControl,details.value);
        if (details.levelOfControl === 'controlled_by_this_extension' || 'controllable_by_this_extension') {
          chrome.privacy.services.autofillEnabled.set({ value: toggleAutofillEnabled.checked }, function() {
            if (chrome.runtime.lastError === undefined) {
              console.log("toggleAutofillEnabled Hooray, it worked!");
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