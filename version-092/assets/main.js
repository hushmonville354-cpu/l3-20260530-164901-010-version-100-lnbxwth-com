(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      if (slides.length > 1) {
        timer = window.setInterval(function () {
          setHero(active + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setHero(i);
        startHero();
      });
    });

    setHero(0);
    startHero();

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
      var input = filterRoot.querySelector("[data-filter-input]");
      var category = filterRoot.querySelector("[data-filter-category]");
      var year = filterRoot.querySelector("[data-filter-year]");
      var region = filterRoot.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var categoryValue = category ? category.value : "";
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-genre") || ""
          ].join(" ").toLowerCase();

          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;

          card.classList.toggle("is-filtered", !(matchesKeyword && matchesCategory && matchesYear && matchesRegion));
        });
      }

      [input, category, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    }
  });
})();
