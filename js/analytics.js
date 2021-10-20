"use strict";

/**
 * Replaces all dashes with an underscore. Use it to keep dynamic event names
 * consistent.
 * @param {String} string
 * @return {String}
 */
var dashToUnderscore = function (string) {
  return string.replace(/-/g, "_");
};

/**
 * Returns value of the URL paramater named sParam
 * @param {String} sParam
 * @returns {String}
 */
let getUrlParams = function (sParam) {
  const sPageURL = window.location.search.substring(1);
  const sURLVariables = sPageURL.split("&");
  for (let i = 0; i < sURLVariables.length; i++) {
    const sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] === sParam) {
      console.log(sParameterName[1]);
      return sParameterName[1];
    }
  }
};

/**
 * Tracks a page view or hash change as an event in Segment based on the
 * current url path. We use this instead of .page() so we can use our
 * naming convention and select which page views show up in Amplitude.
 */
const trackView = function () {
  const path = window.location.pathname;
  const hash = window.location.hash;
  let eventName = undefined;
  let eventProperties = {};
  let result = /(products|pricing|solutions|legal)\/([^\/]*)$/.exec(path);
  const printAndMailResult = /products\/([^\/]*)\/([^\/]*)/.exec(path);

  if (result) {
    var section = result[1];
    var product = result[2];

    eventName = section + "." + product + ".view";
  } else if (printAndMailResult) {
    product = printAndMailResult[1];
    var type = printAndMailResult[2];

    eventName = "products." + product + "." + type + ".view";
  } else if (/sla/.test(path)) {
    result = /sla\/([^\/]*)$/.exec(path);

    if (result) {
      eventName = "legal.sla." + result[1] + ".view";
    } else {
      eventName = "legal.sla.view";
    }
  } else if (path === "/") {
    eventName = "home.view";
  } else if (/sales/.test(path)) {
    eventName = "sales.contact.view";
  } else if (/integrations/.test(path)) {
    result = /integrations\/(.*)/.exec(path);

    if (result) {
      eventName = "integrations." + result[1] + ".view";
    } else {
      eventName = "integrations.view";
    }
  } else if (/guides/.test(path)) {
    eventName = "guides.view";
    result = /guides\/([^\/]*)\/([^\/]*)/.exec(path);

    if (result) {
      eventProperties.article = dashToUnderscore(result[2]);
      eventProperties.section = dashToUnderscore(result[1]);
    }
  } else if (/careers/.test(path)) {
    result = /careers\/(.*)/.exec(path);
    if (result && result[0].indexOf("apply") !== -1) {
      eventName = "careers.job.apply.view";
      eventProperties.id = $(".job-application button").data("id");
      eventProperties.title = $(".job-application button").data("title");
    } else if (result) {
      eventName = "careers.job.view";
      eventProperties.id = $(".individual-job a").data("id");
      eventProperties.title = $(".individual-job a").data("title");
    } else if (hash && hash === "#openings") {
      eventName = "careers.openings.view";
    } else {
      eventName = "careers.view";
    }
  } else if (/template-gallery/.test(path)) {
    result = /template-gallery\/(.*)/.exec(path);

    if (result) {
      eventName = "gallery_templates.template.view";
      eventProperties.id = $(".thumbnail-hover button").data("template");
      eventProperties.name = $(".thumbnail-hover button").data("name");
    } else {
      eventName = "gallery_templates.view";
    }
  } else if (/support\/faq/.test(path)) {
    eventName = "support.faq.view";

    if (hash && hash.length) {
      eventProperties.article = dashToUnderscore(hash.substr(1));
    }
  } else if (/support/.test(path)) {
    if (/pricing/.test(path)) {
      eventName = "pricing.support.view";
    } else if (hash && hash.length) {
      eventName = "support." + hash.substr(1) + ".view";
    } else {
      eventName = "support.view";
    }
  } else if (/docs/.test(path)) {
    eventName = "docs.view";

    if (hash && hash.length) {
      eventProperties.article = dashToUnderscore(hash.substr(1));
    }

    result = /docs\/(.*)/.exec(path);
    if (result) {
      eventProperties.language = result[1];
    } else {
      eventProperties.language = "curl";
    }
  }

  if (eventName) {
    window.analytics.track(dashToUnderscore(eventName), eventProperties);
  }
};

(function ($) {
  $(document).ready(function () {
    window.analytics.ready(function () {
      trackView();

      $(window).on("hashchange", function () {
        trackView();
      });

      /* Event tracking from url params */
      if (getUrlParams("event")) {
        window.analytics.track(decodeURI(getUrlParams("event")));
      }

      /* CTA Clicks */
      $(".analytics-cta").click(function () {
        const href = $(this).attr("href");
        var location = $(this).data("location");
        var product = $(this).data("product");
        var plan = $(this).data("plan");
        var solution = $(this).data("solution");
        var destination = $(this).data("destination");

        if (/register/.test(href)) {
          window.analytics.track("Clicked Register CTA", {
            location: location,
          });
        } else if (/pricing/.test(href)) {
          window.analytics.track("Clicked Full Pricing CTA", {
            location: location,
            product: product,
          });
        } else if (
          /settings\/plans/.test(href) ||
          /settings\/editions/.test(href)
        ) {
          window.analytics.track("Clicked Try Plan CTA", {
            plan: plan,
            product: product,
          });
        } else if (/sales/.test(href)) {
          window.analytics.track("Clicked Contact Sales CTA", {
            product: product,
            location: location,
          });
        } else if (/solutions/.test(href)) {
          window.analytics.track("Clicked Solutions CTA", {
            solution: solution,
            location: location,
          });
        } else if (/special-offers/.test(href)) {
          window.analytics.track("Clicked " + destination + " CTA", {
            solution: solution,
            location: location,
          });
        } else if (
          /docs\.google\.com.*1FAIpQLSdAkRXK4iCNSlpBLBYuUXSZw4DFySATYrOb1yvfE4V4kN_KlQ/.test(
            href
          )
        ) {
          window.analytics.track("Clicked Apply Startups Free CTA", {
            solution: solution,
            location: location,
          });
        }
      });

      /* Solution Banner Clicks */
      $(".solution-callout.solution a").click(function () {
        window.analytics.track("solutions.payment-collections.banner.click", {
          url: $(this).data("url"),
        });
      });

      $(".solution-callout.home a").click(function () {
        window.analytics.track("home.banner.click", {
          url: $(this).data("url"),
        });
      });

      /* Partner CTA Clicks */
      $("#partner-cta").click(function () {
        window.analytics.track("footer.partner-form.click");
      });

      /* FAQ Clicks */
      $(".faq-list a").click(function () {
        window.analytics.track("Clicked FAQ List Question", {
          question: $(this).text(),
        });
      });

      $(".top-faq-question").click(function () {
        if ($(this).attr("aria-expanded") !== "true") {
          window.analytics.track("Expanded Top FAQ Question", {
            question: $(this).text(),
          });
        }
      });

      /* Career Page Clicks */
      $(
        ".careers-header a, .careers-people a, .careers-life-content a, .banner-button"
      ).click(function () {
        window.analytics.track("careers.click", {
          link: $(this).attr("href"),
        });
      });

      $(".openings-jobs a").click(function () {
        window.analytics.track("careers.job.click", {
          id: $(this).data("id"),
          title: $(this).data("title"),
        });
      });

      $(".individual-job a").click(function () {
        window.analytics.track("careers.job.apply", {
          id: $(this).data("id"),
          title: $(this).data("title"),
        });
      });

      $(".job-application button").click(function () {
        window.analytics.track("careers.job.apply.submit", {
          id: $(this).data("id"),
          title: $(this).data("title"),
        });
      });

      /* Resources Section Clicks */
      $(".guides-nav-collapse li a").click(function () {
        window.analytics.track("Clicked Guides Article", {
          article: $(this).text(),
        });
      });

      $(".integration-container a").click(function () {
        window.analytics.track("Clicked Integration", {
          integration: $(this).data("integration"),
        });
      });

      $(".gallery-template-mail-type, .gallery-template-use-case").click(
        function () {
          window.analytics.track("gallery_templates.toggle", {
            group_by: $(this).data("group"),
          });
        }
      );

      $(".thumbnail-hover a").click(function () {
        window.analytics.track("gallery_templates.click", {
          id: $(this).data("id"),
          name: $(this).data("name"),
        });
      });

      $(".thumbnail-hover button").click(function () {
        var action = $(this).data("action");
        var resource = $(this).data("resource");
        var selectedSize = $("input[name=template-size]:checked").val();
        var properties = {
          id: $(this).data("template"),
          name: $(this).data("name"),
          size: selectedSize || $(this).data("size"),
        };

        if (resource === "postcards") {
          properties.file = $(this).data("position");
        }

        window.analytics.track(
          "gallery_templates.template." + action,
          properties
        );
      });

      $(".radio label input").click(function () {
        window.analytics.track("gallery_templates.template.toggle", {
          id: $(".thumbnail-hover button").data("template"),
          name: $(".thumbnail-hover button").data("name"),
          size: $("input[name=template-size]:checked").val(),
        });
      });

      /* Case Study CTA Clicks */
      $(".analytics-case-studies").click(function () {
        window.analytics.track("Clicked Case Study CTA", {
          company: $(this).data("company"),
        });
      });

      $("#primary_line").on("autocomplete:selected", function () {
        window.analytics.track(
          "products.address_verification.suggestions.select"
        );
      });

      $("#primary_line").on("autocomplete:cursorchanged", function () {
        window.analytics.track(
          "products.address_verification.suggestions.change_cursor"
        );
      });

      $("#primary_line").on("autocomplete:opened", function () {
        window.analytics.track(
          "products.address_verification.suggestions.view"
        );
      });

      $("#primary_line").on("autocomplete:updated", function () {
        window.analytics.track(
          "products.address_verification.suggestions.update"
        );
      });
    });
  });
})(jQuery);