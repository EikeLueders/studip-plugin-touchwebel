$(document).bind "mobileinit", ()->
  $.mobile.ajaxEnabled = false
  $.mobile.linkBindingEnabled = false
  $.mobile.hashListeningEnabled = false
  $.mobile.pushStateEnabled = false
  #$.mobile.autoInitializePage = false

  $('div[data-role="page"]').live 'pagehide', (event, ui)->
    $(event.currentTarget).remove()
