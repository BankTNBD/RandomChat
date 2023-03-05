$(function () {
    "use strict";

    var content = $('#chat')
    var input = $('#input')
    var status = $('#status')

    window.WebSocket = window.WebSocket || window.MozWebSocket;
    content.html('<a href="http://randomchat.iambanky.com/">Visit http://randomchat.iambanky.com</a>')
    if (!window.WebSocket) {
        content.html($('<p>', {
            text: 'Sorry, but your browser doesn\'t '
                + 'support WebSockets.'
        }))
        input.hide()
        $('span').hide()
        return
    }

    //Your Server WebSocket
    var connection = new WebSocket('ws://server.iambanky.com:3000')

    connection.onopen = function () {
        content.html('')
        if (localStorage.name === undefined || localStorage.color === undefined ) {
            input.removeAttr('disabled')
            status.text('Choose name:')
        }
        if (localStorage.name !== undefined && localStorage.color !== undefined) {
            status.text(localStorage.name + ': ').css(localStorage.color)
            $('#color').val(localStorage.color)
            input.removeAttr('disabled').focus()

            connection.send(`{ "name": "${localStorage.name}", "color": "${localStorage.color}"}`);
        }
    }

    connection.onerror = function (error) {
        content.html('<p>Sorry, but there\'s some problem with your connection or the server is down.</p> <a href="http://randomchat.iambanky.com/">Visit http://randomchat.iambanky.com</a>')
    }

    connection.onmessage = function (message) {
        try {
            if (localStorage.name !== undefined && localStorage.color != undefined) {
                status.text(localStorage.name + ':').css("color", localStorage.color)
            }
            var json = JSON.parse(message.data)
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data)
            return
        }
        if (json.type == 'history') {
            for (var i = 0; i < json.data.length; i++) {
                addMessage(json.data[i].author, json.data[i].text,
                    json.data[i].color, new Date(json.data[i].time))
            }
        } else if (json.type == 'message') {
            input.removeAttr('disabled');
            addMessage(json.data.author, json.data.text,
                json.data.color, new Date(json.data.time))
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json)
        }
    };

    input.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val()
            if (!msg) {
                return
            }

            if (localStorage.name === undefined || localStorage.color === undefined) {
                localStorage.name = msg;
                localStorage.color = $('#color').val()
                connection.send(`{ "name": "${localStorage.name}", "color": "${localStorage.color}"}`);
                status.text(localStorage.name + ':').css("color", localStorage.color)
                $(this).val('')
            } else {
                connection.send(`{ "msg": "${msg}"}`)
                $(this).val('')
            } 
        }
    })

    setInterval(function () {
        if (connection.readyState !== 1) {
            status.text('Error')
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                + 'with the WebSocket server.');
        }
    }, 3000)

    function addMessage(author, message, color, dt) {
        content.append('<p><span class="historyChat" style="color:' + color + '"><b>' + author + '</b></span> @ ' +
            + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
            + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
            + ': <b>' + urlFind(message) + '</b></p>')
        content.scrollTop(content.prop("scrollHeight"))
    }

    function urlFind(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
          return '<a href="' + url + '">' + url + '</a>';
        })
    }

    $("#clearUser").click(function(){
        localStorage.clear()
        location.reload()
      })

    $("#sendButton").click(function(){
        var msg = input.val()
            if (!msg) {
                return
            }

            if (localStorage.name === undefined || localStorage.color === undefined) {
                localStorage.name = msg;
                localStorage.color = $('#color').val()
                connection.send(`{ "name": "${localStorage.name}", "color": "${localStorage.color}"}`);
                status.text(localStorage.name + ':').css("color", localStorage.color)
                input.val('')
            } else {
                connection.send(`{ "msg": "${msg}"}`)
                input.val('')
            } 
    })
})
