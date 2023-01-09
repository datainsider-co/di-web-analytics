(function(window, document, tagName, libUrl, initOptions) {
  var diAnalytics = {};
  var queue = [];
  var getFunctionPushToQueue = function(funcName) {
    return function() {
      queue.push(
        {funcName: funcName, arguments: arguments});
    };
  };
  var diFunctions = [
    'init',
    'setLoggerLevel',
    'autoTrackDom',
    'enterScreenStart',
    'enterScreen',
    'exitScreen',
    'setGlobalConfig',
    'time',
    'track',
    'identify',
    'setUserProfile',
    'viewProduct',
    'search',
    'register',
    'login',
    'logout',
    'destroySession',
    'addToCart',
    'removeFromCart',
    'trackCheckoutProducts',
    'checkout',
    'cancelOrder',
    'returnOrder',
    'notifyUsingCookies',
    'reset',
  ];
  for (var index = 0; index < diFunctions.length; index++) {
    diAnalytics[diFunctions[index]] = getFunctionPushToQueue(diFunctions[index]);
  }
  var newTag = document.createElement(tagName);
  var firstTag = document.getElementsByTagName(tagName)[0];
  newTag.async = 1;
  newTag.src = libUrl;
  firstTag.parentNode.insertBefore(newTag, firstTag);
  window.createDiAnalytics = function() {
    initOptions = arguments;
    return diAnalytics;
  };
  newTag.onload = function() {
    if (initOptions) {
      window.DiAnalytics.init.apply(window.DiAnalytics, initOptions);
      queue.forEach(function(item) {
        if (item.funcName) {
          window.DiAnalytics[item.funcName].apply(window.DiAnalytics,
            item.arguments);
        }
      });
      window.diQueue = [];
    }
  };
})(
  window,
  document,
  'script',
  'https://analytics.datainsider.co/static/js/di-web-analytics/0.8.4/index.js'
);

window.DiAnalytics = window.createDiAnalytics(
  'https://host-api/',
  'api-key',
);
