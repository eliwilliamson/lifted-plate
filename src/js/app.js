// conditionally load the best lazy-loading version
(function(w, d){
    var b = d.getElementsByTagName('body')[0];
    var s = d.createElement("script");
    var v = !("IntersectionObserver" in w) ? "8.17.0" : "10.20.1";
    s.async = true; // This includes the script as async. See the "recipes" section for more information about async loading of LazyLoad.
    s.src = "https://cdn.jsdelivr.net/npm/vanilla-lazyload@" + v + "/dist/lazyload.min.js";
    w.lazyLoadOptions = {
      elements_selector: "*, .lazy",
      to_webp: true,
      load_delay: 50
    };
    b.appendChild(s);
}(window, document));

// nav scroll listener
var hero = document.getElementById("hero");
var ourStory = document.getElementById("our-story");
var occasions = document.getElementById("occasions");
var contactUs = document.getElementById("contact-us");

var ourStoryLink = document.getElementById("our-story-link");
var occasionsLink = document.getElementById("occasions-link");
var contactUsLink = document.getElementById("contact-us-link");

var prevBtn = document.getElementById("prev-btn");
var nextBtn = document.getElementById("next-btn");

var sectionCounter = document.getElementById("index");
var progressBar = document.getElementById("active-bar");

var heroWatcher = scrollMonitor.create( hero );
var ourStoryWatcher = scrollMonitor.create( ourStory );
var occasionsWatcher = scrollMonitor.create( occasions );
var contactUsWatcher = scrollMonitor.create( contactUs );

var activeSection = "hero";

heroWatcher.enterViewport(function() {
  nextBtn.setAttribute("data-scroll", "our-story");
  prevBtn.disabled = true;
  sectionCounter.textContent="00";
  progressBar.style.height = "0";
});

ourStoryWatcher.enterViewport(function() {
  prevBtn.setAttribute("data-scroll", "hero");
  nextBtn.setAttribute("data-scroll", "occasions");
  occasionsLink.classList.remove('active');
  contactUsLink.classList.remove('active');
  ourStoryLink.classList.add('active');
  prevBtn.disabled = false;
  sectionCounter.textContent="01";
  progressBar.style.height = "33.3%";
});
ourStoryWatcher.exitViewport(function() {
  ourStoryLink.classList.remove('active');
});

occasionsWatcher.enterViewport(function() {
  prevBtn.setAttribute("data-scroll", "our-story");
  nextBtn.setAttribute("data-scroll", "contact-us");
  ourStoryLink.classList.remove('active');
  contactUsLink.classList.remove('active');
  occasionsLink.classList.add('active');
  sectionCounter.textContent="02";
  progressBar.style.height = "66.6%";
});
occasionsWatcher.exitViewport(function() {
  occasionsLink.classList.remove('active');
});

contactUsWatcher.enterViewport(function() {
  prevBtn.setAttribute("data-scroll", "occasions");
  ourStoryLink.classList.remove('active');
  occasionsLink.classList.remove('active');
  contactUsLink.classList.add('active');
  nextBtn.disabled = true;
  sectionCounter.textContent="03";
  progressBar.style.height = "100%";
});
contactUsWatcher.exitViewport(function() {
  nextBtn.disabled = false;
  contactUsLink.classList.remove('active');
});

// scrolling nav functionality
$(document).ready(function() {
  var $root = $('html, body');

  $('a[href^="#"]').click(function () {
      $root.animate({
          scrollTop: $( $.attr(this, 'href') ).offset().top
      }, 1000);

      return false;
  });
});

// carousel functionality
var carouselContainer = document.getElementById("carousel");
var carouselProgressBar = document.getElementById("carousel-active-bar");
var carouselBtn = document.getElementsByClassName("carousel-btn");
var activeIndex = 1;

function moveCarousel(e) {
  var direction = e.toElement.getAttribute('class');
  var containerWidth = carouselContainer.offsetWidth;
  var windowWidth = window.innerWidth;
  var scrollOffset = carouselContainer.scrollLeft;

  if (windowWidth < 768) {
    var cardWidth = windowWidth - 48;
  } else if (windowWidth < 1064) {
    var cardWidth = 350;
  } else {
    var cardWidth = containerWidth / 5;
  }

  if (direction.includes("prev-slide")) { // previous slide
    activeIndex = activeIndex - 1;

    if (carouselBtn[1].disabled) {
      carouselBtn[1].disabled = false;
    }
    carouselContainer.scrollLeft = scrollOffset - cardWidth;
    if (scrollOffset < cardWidth) {
      this.disabled = true;
    }
  } else { // next slide
    activeIndex = activeIndex + 1;

    if (carouselBtn[0].disabled) {
      carouselBtn[0].disabled = false;
    }

    carouselContainer.scrollLeft = scrollOffset + cardWidth;

    if (activeIndex == 5) {
      this.disabled = true;
    }
  }

  carouselProgressBar.style.width = ((activeIndex / 5) * 100) + "%";
}

for (var i = 0; i < carouselBtn.length; i++) {
  carouselBtn[i].addEventListener('click', moveCarousel, false);
}

// form submitted notification
var notification = document.getElementById("notification");

if(window.location.href.indexOf("thank-you") > -1) {
  notification.classList.add('active');
}

// init form validation
$("form").validate();
