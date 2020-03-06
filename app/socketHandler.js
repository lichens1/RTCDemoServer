
const client_list = [];

module.exports = function(io, streams) {

  io.on('connection', function(client) {
    console.log('-- ' + client.id + ' joined --');

    client_list.push(client);

    client.emit("id", client.id);

    client.on('message', function (details) {
      var otherClient = io.sockets.connected[details.to];

      console.log('--给  ' + details.to + '  发送消息类型 --' + details.type + otherClient);

      if (!otherClient) {
        return;
      }
        delete details.to;
        details.from = client.id;
        otherClient.emit('message', details);
    });
      
    client.on('readyToStream', function(options) {

      client_list.forEach(socketClient => {
        if(client.id != socketClient.id){
          console.log('告诉 ' + socketClient.id + ', ' + client.id + '已经在聊天室');
          socketClient.emit("call", client.id);
        }
      });

      console.log('-- ' + client.id + ' is ready to stream --options.name -- '  + options.name);
      streams.addStream(client.id, options.name); 
    });
    
    client.on('update', function(options) {
      streams.update(client.id, options.name);
    });

    function leave() {
      console.log('-- ' + client.id + ' left --');
      client_list.splice(client_list.indexOf(client), 1); 
      streams.removeStream(client.id);
    }

    client.on('disconnect', leave);
    client.on('leave', leave);
  });
}; 