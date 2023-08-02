(function () {
  if (document.querySelector(".handle-hide")) {
    document
      .querySelector(".handle-hide")
      .addEventListener("click", function () {
        let audioList = document.querySelectorAll(".audio-container");
        console.log(audioList);
        audioList.forEach(function (item) {
          item.style.display = "none";
        });
      });
  }
  if (document.querySelector(".handle-show")) {
    document
      .querySelector(".handle-show")
      .addEventListener("click", function () {
        let audioList = document.querySelectorAll(".audio-container");
        console.log(audioList);
        audioList.forEach(function (item) {
          item.style.display = "block";
        });
      });
  }
  if (document.querySelector(".article-list-item")) {
    document.querySelectorAll(".article-list-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        console.log(e.originalTarget.innerHTML);
        console.log(window.location.hostname);
        console.log(window.location.port);
        console.log(window.location.protocol);
        let url =
          window.location.protocol +
          "//" +
          window.location.hostname +
          ":" +
          window.location.port +
          "/article/china/daily/" +
          e.originalTarget.innerHTML;
        console.log(url);
        window.location.href = url;
      });
    });
  }
  if (document.querySelector(".block-item-container")) {
    document.querySelectorAll(".block-item-container").forEach(function (item) {
      item.addEventListener("click", function (e) {
        if (e.target.getAttribute("data-id")) {
          let url =
            window.location.protocol +
            "//" +
            window.location.hostname +
            ":" +
            window.location.port +
            "/article/china/daily/" +
            e.target.getAttribute("data-id");
          console.log(url);
          window.location.href = url;
        }
      });
    });
  }
  if (document.querySelector(".page-item")) {
    document.querySelectorAll(".page-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        console.log(e.target.innerHTML);
        let url =
          window.location.protocol +
          "//" +
          window.location.hostname +
          ":" +
          window.location.port +
          "/article/china/daily/list/" +
          e.target.innerHTML;
        console.log(url);
        window.location.href = url;
      });
    });
  }
})();
