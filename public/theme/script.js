$(function () {

  $('[data-toggle="tooltip"]').tooltip()

  $('.toggleHashSearch').click(function(e){
    e.preventDefault();
    $('#search').slideToggle();
  })


})
