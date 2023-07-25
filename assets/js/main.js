/*
	Future Imperfect by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {
  skel.breakpoints({
    xlarge: "(max-width: 1680px)",
    large: "(max-width: 1280px)",
    medium: "(max-width: 980px)",
    small: "(max-width: 736px)",
    xsmall: "(max-width: 480px)",
  });

  $(function () {
    var $window = $(window),
      $body = $("body"),
      $menu = $("#menu"),
      $shareMenu = $("#share-menu"),
      $sidebar = $("#sidebar"),
      $main = $("#main");

    // Disable animations/transitions until the page has loaded.
    $body.addClass("is-loading");

    $window.on("load", function () {
      window.setTimeout(function () {
        $body.removeClass("is-loading");
      }, 100);
    });

    // Fix: Placeholder polyfill.
    $("form").placeholder();

    // Prioritize "important" elements on medium.
    skel.on("+medium -medium", function () {
      $.prioritize(
        ".important\\28 medium\\29",
        skel.breakpoint("medium").active
      );
    });

    // IE<=9: Reverse order of main and sidebar.
    if (skel.vars.IEVersion <= 9) $main.insertAfter($sidebar);

    $menu.appendTo($body);
    $shareMenu.appendTo($body);

    $menu.panel({
      delay: 500,
      hideOnClick: true,
      hideOnEscape: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: "right",
      target: $body,
      visibleClass: "is-menu-visible",
    });

    $shareMenu.panel({
      delay: 500,
      hideOnClick: true,
      hideOnEscape: true,
      hideOnSwipe: true,
      resetScroll: true,
      resetForms: true,
      side: "right",
      target: $body,
      visibleClass: "is-share-visible",
    });

    // Search (header).
    var $search = $("#search"),
      $search_input = $search.find("input");

    $body.on("click", '[href="#search"]', function (event) {
      event.preventDefault();

      // Not visible?
      if (!$search.hasClass("visible")) {
        // Reset form.
        $search[0].reset();

        // Show.
        $search.addClass("visible");

        // Focus input.
        $search_input.focus();
      }
    });

    $search_input
      .on("keydown", function (event) {
        if (event.keyCode == 27) $search_input.blur();
      })
      .on("blur", function () {
        window.setTimeout(function () {
          $search.removeClass("visible");
        }, 100);
      });

    // Intro.
    var $intro = $("#intro");

    // Move to main on <=large, back to sidebar on >large.
    skel
      .on("+large", function () {
        $intro.prependTo($main);
      })
      .on("-large", function () {
        $intro.prependTo($sidebar);
      });

    // Animate the images, cycling through them
    const images = [
      "img/main/me-1.png",
      "img/main/me-2.png",
      "img/main/me-3.png",
      "img/main/me-4.png",
      "img/main/me-5.png",
    ];
    let index = 0;
    const img = $(".fade-swap");
    const carouselInterval = 15000;

    function cycleImages() {
      img.eq(index).fadeOut(150, function () {
        index = (index + 1) % images.length;
        img.eq(index).fadeIn(150);

        // Ensure that all other images are hidden
        img.not(img.eq(index)).hide();
      });
    }

    img.not(":first").hide();
    setInterval(cycleImages, carouselInterval);

    if (hljs) {
      hljs.highlightAll();
    }

    // After 1 second, update the headings with the table counts
    setTimeout(function () {
      if (document.URL.includes("speaking")) {
        const updateTableHeadingWithTableCount = (headerSelector, tableSelector) => {
          // Get the table row counts
          const table = document.querySelector(tableSelector);
          const rows = table.querySelectorAll("tr").length;

          // Update the corresponding header
          const header = document.querySelector(headerSelector);
          if (rows > 0) {
            header.innerHTML += ` (${rows})`;
          }
          header.style.color = "#3c3b3b";
          header.title = header.innerText;
        };

        updateTableHeadingWithTableCount(
          "#file-speaking-md-readme > article > h2:nth-child(1)",
          "#file-speaking-md-readme > article > table:nth-child(2) > tbody"
        );

        updateTableHeadingWithTableCount(
          "#file-speaking-md-readme > article > h2:nth-child(3)",
          "#file-speaking-md-readme > article > table:nth-child(4) > tbody"
        );
      }
    }, 1000);
  });
})(jQuery);

!(function (t) {
  "use strict";
  "function" == typeof define && define.amd
    ? define(["jquery"], t)
    : "object" == typeof exports
    ? (module.exports = t(require("jquery")))
    : t(jQuery);
})(function (t) {
  "use strict";
  function e(e, s, n) {
    if (!e || !1 in e) return void i(n);
    t('link[href="' + e.stylesheet + '"]').length ||
      t(document.head).append(
        '<link href="' + e.stylesheet + '" rel="stylesheet">'
      );
    var r = e.div.replace(/id="[^"]*"/, "");
    n.$gist.html(r);
  }
  function i(t) {
    var e = t.url.replace(".json", "").replace("?file=", "#file-");
    t.$gist.html('<a href="' + e + '" target="_blank">View gist</a>');
  }
  function s(e) {
    return this.each(function () {
      var i = t(this),
        s = i.data("gist-initialized"),
        r = t.extend({}, n.DEFAULTS, i.data(), "object" == typeof e && e);
      s || i.data("gist-initialized", (s = new n(this, r)));
    });
  }
  var n = function (e, i) {
    (this.options = i), (this.$gist = t(e)), this.request();
  };
  (n.DEFAULTS = { timeout: 1e3, success: e, error: i }),
    (n.prototype.request = function () {
      var e = this,
        i = this.$gist.data("gist"),
        s = this.$gist.data("file") || !1,
        n = "https://gist.github.com/" + i + ".json";
      s && (n += "?file=" + s),
        t.ajax({
          url: n,
          dataType: "jsonp",
          cache: !0,
          beforeSend: function (t) {
            (t.url = n), (t.$gist = e.$gist);
          },
          timeout: e.options.timeout,
          success: e.options.success,
          error: e.options.error,
        });
    });
  var r = t.fn.gist;
  (t.fn.gist = s),
    (t.fn.gist.Constructor = n),
    (t.fn.gist.noConflict = function () {
      return (t.fn.gist = r), this;
    });
});
