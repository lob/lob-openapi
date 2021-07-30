"use strict";

require("waypoints/lib/jquery.waypoints.min");
require("waypoints/lib/shortcuts/sticky.min");

const VALID_DOCS_PATHS = [
  "/",
  "/node",
  "/ruby",
  "/python",
  "/php",
  "/java",
  "/elixir",
];

if (VALID_DOCS_PATHS.includes(window.location.pathname)) {
  $(function () {
    // sets active class for language nav
    $(".docs-languages a").each(function () {
      if ($(this).attr("href") === window.location.pathname) {
        $(this).parent().siblings().removeClass("active");
        $(this).parent().addClass("active");
      }
    });

    // sets up sticky nav
    var sectionClass = ".docs-section";
    var currentHash = "";
    var buffer = 2;

    /* eslint-disable no-new */
    new window.Waypoint.Sticky({
      element: $(".docs-sticky"),
    });

    new window.Waypoint.Sticky({
      element: $(".api-nav"),
      wrapper: '<div class="sticky-wrapper" style="display:inline"/>',
    });
    /* eslint-enable no-new */

    $(sectionClass).waypoint({
      offset: buffer,
      continuous: false,
      handler: function (direction) {
        var hash = "";
        if (direction === "down") {
          hash = this.element.id;
        } else {
          hash = $(this.element).prev(sectionClass).attr("id") || "";
        }
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            null,
            null,
            hash === "" ? "" : "#" + hash
          );
        } else {
          window.location.hash = hash;
        }
        currentHash = hash;

        var navItem = $('#api-nav a[href="#' + currentHash + '"]').parent();
        $("#api-nav .active").removeClass("active");
        navItem.addClass("active");

        $(".nav-sub").addClass("hide");
        if (navItem.closest(".nav-sub").length === 0) {
          // main heading
          navItem.next(".nav-sub").removeClass("hide");
        } else {
          // sub heading
          navItem.closest(".nav-sub").removeClass("hide");
        }

        $(".docs-languages a").each(function () {
          var path = $(this).attr("href").replace(/#.*/, "");
          var href = path + (currentHash === "" ? "" : "#" + currentHash);
          $(this).attr("href", href);
        });
      },
    });
  });
}
