/**
 * Created by Administrator on 10/17/2014.
 */
var socketIo = require("socket.io"),
    io;
var wakandaPlan = require('flowtacServer/dataTransfer/wakandaPlan');
// Each connection gets its own socket
var onConnection = function(socket){
    console.log("Got a connection");
    socket.on("message",function(incoming){
        var msg = JSON.parse(incoming);  // message comes in as string so we turn it into an object
        var msgOut = {
            type    : "",
            content : null
        };

        // All of the messages coming from the client have a unique responseId so the client will know which request
        // a response it receives is for.
        if(typeof msg._responseId === 'number'){
            handleClientRequest(socket, msg); // see below
            return null;
        }

        if(msg.type == "planData"){
            wakandaPlan.processPlanData(msg.content);
            return null;
        }

        // This was written first and is here to support data transfer from Wakanda
        //switch(msg.type){
        //    case "planData":
        //        wakandaPlan.processPlanData(msg.content);
        //        break;
        //
        //    case "statesData":
        //        adminDb.actionRequest({
        //            action : "loadStates",
        //            states : msg.content
        //        });
        //        break;
        //    case "zipCodeData":
        //        adminDb.actionRequest({
        //            action   : "loadZipCodes",
        //            zipCodes : msg.content
        //        });
        //        break;
        //    case "quickListData":
        //        adminDb.actionRequest({
        //            action     : "loadQuickLists",
        //            quickLists : msg.content
        //        });
        //        break;
        //    case "serviceData":
        //        adminDb.actionRequest({
        //            action     : "loadServices",
        //            dataTypes  : msg.content.dataTypes,
        //            services   : msg.content.services
        //        });
        //        break;
        //}
    });
};

var sendMessage = function(socket, msgOut){
    var buf = JSON.stringify(msgOut);
//    console.log('Sending: ' + buf);
    socket.send(buf);
};

var handleClientRequest = function(socket, msgIn){
    var msgOut = {
        _responseId : msgIn._responseId,
        type        : msgIn.type,
        content     : null
    };

    // Just routes the message based on the type
    switch (msgIn.type){
        case "echoTest":
            msgOut.content = msgIn.content.toUpperCase();
            sendMessage(socket, msgOut);
            break;

        case 'mongoose':
//            mongoooseHandler.requestHandler(socket, msgIn); // in mongooseRequests.coffee
            break;
    }
};

// hapi plugin registration
exports.register = function(server, options, next) {
    // this is the hapi specific binding
    io = socketIo.listen(server.listener);

    io.sockets.on('connection', function(socket) {
        onConnection(socket);
    });

    next();
};

exports.register.attributes = {
    name    : "flowtacApi",
    version : "0.0.1"
};