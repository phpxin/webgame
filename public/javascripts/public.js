function appendChat(html){
    $("#room-chat").append(html);
    $('#room-chat-body').scrollTop(parseInt($('#room-chat').height()));
}