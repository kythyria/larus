define("socketiopipe", ["mutation", "address"],function(Mutation, Address){
	return function()
	{
		var self = this;
		var socket = io.connect('http://berigora.net:8080/');
		
		self.emitChange(mut)
		{
			socket.emit("inchange",JSON.stringify(mut));
		}

		socket.on("outchange",function(data){
			var rawmut = JSON.parse(data);
			self.handleChange(Mutation.revivify(rawmut));
		});
	};
});
