
var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('./app/models/user'),
    Conversation = require('./app/models/conversations'),
    config = require('./config/database'),
    port = process.env.PORT || 3000,
    jwt = require('jwt-simple'),
    cors = require('cors');


//var User = mongoose.model('myuser', userSchema);

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(cors());
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.static(__dirname + '/client/app'));

console.log(__dirname);




//server.listen(app.get('port'), function(){});
//server.listen(8080);

var users = {};

io.on('connection', function(socket){

   console.log("A user is connected");

    socket.on('registerUser', function(user){

        users[user] = socket.id;

        console.log(users);
    });

    socket.on('newConvCreated', function(infoConv){

        var room = infoConv.convId;

        for(var i=0; i < infoConv.ids.length; i++){

            if(io.sockets.connected[users[infoConv.ids[i]]] !== undefined){

                io.sockets.connected[users[infoConv.ids[i]]].join(room);
            }
        }

        socket.broadcast.to(room).emit("conversationCreated", infoConv.convObj);
    });

    socket.on('newGroupCreated', function(infoGroup){

        var room = infoGroup.convId;

        for (var i=0; i< infoGroup.ids.length; i++){ // Adding 3 users that will be in recently created group

            if(io.sockets.connected[users[infoGroup.ids[i]]] !== undefined) {

                io.sockets.connected[users[infoGroup.ids[i]]].join(room);
            }
        }

        socket.broadcast.to(room).emit("groupCreated", infoGroup.convObj);

    });

    socket.on('userAddedToConv', function(infoContact){

        console.log(infoContact);
        console.log("All Rooms");
        console.log(io.sockets.adapter.rooms); // Log all rooms

        var room = infoContact.conv;

        if(users[infoContact.ids[0]] !== undefined) { //Checks is the user we're adding to the group has a registered socket id
            io.sockets.connected[users[infoContact.ids[0]]].join(room);// Join user to group room
            io.to(users[infoContact.ids[0]]).emit('userAddedToGroup', infoContact.conversation);// Notify by adding the group to the conversations list of recently added user
        }

        socket.broadcast.to(room).emit('newConvAdded', infoContact);

    });

    socket.on('createRooms', function(rooms){

        var namespace = '/';
        console.log('create rooms executed');
        for (var i=0; i < rooms.length; i++){

         socket.join(rooms[i]);

            //console.log(io.nsps[namespace].adapter.rooms[rooms[i]]);

        }

        //socket.join('575b15fbe772393a651fee01');

        //console.log('printing :');

        //var roomName = '575b15fbe772393a651fee01';

        //for (var socketId in io.nsps[namespace].adapter.rooms[roomName]) {
        //    console.log(socketId);
        //}
    });

    console.log(socket.id);
    //console.log(io.nsps[namespace].adapter.rooms[roomName]);// Log socket ids in selected room

    //socket.broadcast.to('575b15fbe772393a651fee01').emit('newConvAdded', 'user connected');
    //socket.broadcast.emit('newConvAdded', 'user connected');



    socket.on('disconnect', function(){

       console.log('got disconnect');
    });

    socket.on('forceDisconnect', function(){

        console.log('logging force disconnect');
       socket.disconnect();
    });


});

io.on('disconnect', function(socket){

    console.log('user disconnected');
});



app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(morgan());
app.use(passport.initialize());


app.use(function(req,res, next){

    if(req.method=='OPTIONS'){
        //res.header("Access-Control-Allow-Origin", "*");
        //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        //res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");

        res.status(204).end();
    }else{
        //res.header("Access-Control-Allow-Origin", "*");
        next();
    }
    //res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    //
    //next();

});



app.get('/', function(req, res) {

    res.send('Hello! The API is at http://localhost:' + port + '/api');

});

mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {

    console.log('here !!!!!!!');

    if (!req.body.username || !req.body.password || !req.body.name) {
        res.json({success: false, msg: 'Please pass name and password.'});

    } else {
        var newUser = new User(req.body);
        //{
        //    username: req.body.username,
        //        password: req.body.password,
        //    name : req.body.name,
        //    image : req.body.image
        //}


        // save the user
        newUser.save(function(err, user) {


            if (err) {

                return res.json({success: false, msg: 'Username already exists.'});

            }

            var token = jwt.encode(user, config.secret);

            res.json({success: true, msg: 'Successful created new user.',
                token : 'JWT' + token, user: user});

        });
    }
});

apiRoutes.post('/authenticate', function(req, res){

    User.findOne({

        username: req.body.username
    }).populate('conversations').exec(function (err, user){

        if(err) throw err;

        if(!user) {

            res.send({success:false, msg: 'Authentication failed.'});

        } else{

            user.comparePassword( req.body.password, function (err, isMatch){

                if(isMatch && !err){

                    var token = jwt.encode(user, config.secret);

                    res.json({success: true, token: 'JWT' + token, user: user});

                }else {

                    // change status
                    res.json({success: false, msg: 'Authentication failed.'});
                }
            });
        }
    });

});

apiRoutes.get('/getallcontacts/:id' ,function(req, res){

    User.find({ _id : {$ne: req.params.id }}, 'name image', function(err, users){

        if(err) throw err;

        else{

            res.json({ users: users})
        }
    });

});

apiRoutes.post('/createconv', function(req, res){

    //if (!req.body.username || !req.body.password || !req.body.name) {

        var newConv = new Conversation({

            isgroup : req.body.isgroup,
            image: req.body.image,
            name : req.body.name,
            namereq : req.body.namereq,
            imagereq : req.body.imagereq,
            requestby : req.body.requestby,
            gotrequest : req.body.gotrequest,
            members : req.body.members,
            membersname : req.body.membersname,
            confirmed : req.body.confirmed

        });
        // save the user

        newConv.save(function(err, conv) {


            if (err) {

                return res.json({success: false, msg: 'Failed to create new conversation'});

            }

            console.log(req.body.ids);
            User.update(

                { _id : { $in: req.body.ids }},

                {$addToSet: {"conversations": conv._id }},

                {multi : true},
                //{safe: true, upsert: true, new : true},

                function(err, user) {

                    if(err){

                        console.log(err);
                    }
                    else {
                        console.log(user);
                        console.log('previous the emit socket');

                        //io.emit('message', conv);

                        res.json({success: true, msg: 'Successful created new conversation.', conv: conv});
                    }
                }
            );

        });
});

apiRoutes.post('/addtoconv', function(req, res){


    console.log(req.body.ids);
    User.update(

        { _id : { $in: req.body.ids}},
        {
            $addToSet : {"conversations" : req.body.conv}
        },

        function(err, user){

            if(err) { return console.log(err)}

            else if (user.nModified !== 0){

                Conversation.update(
                    { _id : { $in: req.body.conv}},

                    {
                        $addToSet : {"members" : req.body.members},
                        $set : {"membersname" : req.body.membersname}
                    },
                    function(){

                        //io.sockets.in(req.body.conv).emit('addConv', 'I'm in add conv api');
                        //io.sockets.in('foobar').emit('message', 'you should not see this');
                        res.json({success: true, msg: 'Successful added conversation'});
                    }
                );
            }
            else {
                res.json({success : false, msg : "Failed to add, It might be already added"})
            }
        }
    )
});

apiRoutes.post('/acceptconv', function(req, res){

    Conversation.update(

        {_id: req.body._id},
        {
            $set : {"confirmed" : true}
        },
        function(err, conv){

            if(err){ return console.log(err)}

            if(conv.nModified !==0){ // check if a Doc was updated

                if(users[req.body.sendnotice] !== undefined ){

                    io.to(users[req.body.sendnotice]).emit('convAccepted', req.body._id);//
                    res.json({ success : true});

                }
            }else { res.json({ success : false});}
        }

    )
});

apiRoutes.post('/sendmessage', function(req, res){

    console.log("I got a request");
    console.log(req.body);

    Conversation.update(

        {_id : req.body._id},
        {
            $push : {"chats" : req.body.chat}
        },
        function(err, conv){

            console.log(conv);

            if(err) { return console.log(err)}

            if(conv.nModified !==0){

                    var chatObj = { id : req.body._id, chat : req.body.chat};
                    io.to(req.body._id).emit('messageReceived', chatObj)

                res.json({success : true});

            }else { res.json({success : false})}
        }
    )
});
// connect the api routes under /api/*
app.use('/api', apiRoutes);

server.listen(port, function(){

    console.log('Started Server: http://localhost:' + port);
});

