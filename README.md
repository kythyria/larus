larus
=====

Web-based application for real-time collaborative editing of structured (XML) data, sans locking.

This is very pre-alpha! Very very!

Dependencies
------------
You need [http://socket.io/](socket.io) and [http://expressjs.com/](express) for the server to even run;
install them from npm while in src/

    cd src && npm install socket.io express
  
Running the server
------------------
This is even more pre-alpha than the client; it should be able to serve the client. Currently hardcoded to listen
on port 8080:

    node server.js

and then visit http://&lt;servername&gt;:8080/demo.html
