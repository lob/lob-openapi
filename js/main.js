"use strict";
/* main */
(function () {
  window.Lob = {};
  window.Lob.url = window.location.origin;
  window.Lob.pathname = window.location.pathname;
  window.Lob.qs = {};
})();

$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  // parse query params
  var href = window.location.href.replace(window.location.hash, "");
  var index = href.indexOf("?") + 1;
  if (index > 0) {
    var qs = href.slice(index);
    var params = qs.split("&");
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split("=");
      window.Lob.qs[param[0]] = param[1];
    }
  }
});

require("./analytics");
require("./nav");
