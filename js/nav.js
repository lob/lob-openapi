"use strict";

const MOBILE_WIDTH = 991;

$(function () {
  $(".nav-dropdown").on({
    mouseenter: function () {
      if ($(window).width() > MOBILE_WIDTH) {
        const wId = this.getAttribute("data-w-id");
        $("#" + wId).addClass("w--open");
        const selector = $("#" + wId).attr("aria-controls");
        $("#" + selector).addClass("w--open");
      }
    },
    mouseleave: function () {
      if ($(window).width() > MOBILE_WIDTH) {
        const wId = this.getAttribute("data-w-id");
        $("#" + wId).removeClass("w--open");
        const selector = $("#" + wId).attr("aria-controls");
        $("#" + selector).removeClass("w--open");
      }
    },
    click: function () {
      if ($(window).width() <= MOBILE_WIDTH) {
        const wId = this.getAttribute("data-w-id");
        const isOpen = $("#" + wId).hasClass("w--open");
        $(".w--open").removeClass("w--open");

        if (!isOpen) {
          $("#" + wId).addClass("w--open");
          const selector = $("#" + wId).attr("aria-controls");
          $("#" + selector).addClass("w--open");
        }
      }
    },
  });

  $(".menu-icon").on("click", function (e) {
    e.stopPropagation();
    $(".w-nav-overlay").removeClass("nav-menu-mobile-hide");
    $(".w-nav-overlay").addClass("nav-menu-mobile-show");
    $(".nav-menu-wrapper-4")
      .removeClass("nav-menu-mobile-hide")
      .addClass("nav-menu-mobile-show");
    $(".menu-cross-icon").css({
      transform:
        "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
      visibility: "visible",
    });
    $(".menu-icon").css("visibility", "hidden");
  });

  $(".menu-cross-icon").on("click", function (e) {
    e.stopPropagation();
    $(".w-nav-overlay")
      .removeClass("nav-menu-mobile-show")
      .addClass("nav-menu-mobile-hide");
    $(".nav-menu-wrapper-4")
      .removeClass("nav-menu-mobile-show")
      .addClass("nav-menu-mobile-hide");
    $(".menu-cross-icon").css({
      transform:
        "translate3d(100%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
      visibility: "hidden",
    });
    $(".menu-icon").css("visibility", "visible");
  });
});
