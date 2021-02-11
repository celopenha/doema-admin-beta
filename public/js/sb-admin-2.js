(function($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(window).width() > 768) {
      $("#img-navbar").attr("src", "/img/shopping_crianca400.png");
      $("#img-navbar-2").css("display", "none");
    };
    if ($(".sidebar").hasClass("toggled")) {
        $('.sidebar .collapse').collapse('hide');
        $("#img-navbar").attr("src", "/img/shopping_crianca200.png");
        $("#img-navbar-2").css("display", "block");
    };
  });
  
  if ($(window).width() < 768) {
    $("#img-navbar").attr("src", "/img/shopping_crianca400.png");
    $("#img-navbar-2").css("display", "block");
  };

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
      $("#img-navbar").attr("src", "/img/shopping_crianca400.png");
      $("#img-navbar-2").css("display", "block");
    } else {
      if (!$(".sidebar").hasClass("toggled")) {
        $("#img-navbar").attr("src", "/img/shopping_crianca200.png");
        $("#img-navbar-2").css("display", "none");
      };
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

  
  // Implementa o "capitalaze" no texto dos input com o atributo "treatment=capitalize"
  $("input[type=text][treatment=capitalize]").keypress(function(e) {
    const invalidos = ["de", "do", "da", "e"];

    let novoTexto = $(this)
      .val()
      .split(" ")
      .map(palavra => invalidos.includes(palavra) || palavra.length < 2 ? 
          palavra : 
          palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
      .join(" ");

    $(this).val(novoTexto);
  });


})(jQuery); // End of use strict