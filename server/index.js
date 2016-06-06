
var express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = require('./app/models/user'),
    Conversation = require('./app/models/conversations'),
    config = require('./config/database'),
    port = process.env.PORT || 3000,
    jwt = require('jwt-simple');


//var User = mongoose.model('myuser', userSchema);

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(morgan());
app.use(passport.initialize());


app.use(function(req,res, next){

    if(req.method=='OPTIONS'){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");

        res.status(204).end();
    }else{
        res.header("Access-Control-Allow-Origin", "*");
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

    console.log('print params');
    console.log(req.params.id);

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
// connect the api routes under /api/*
app.use('/api', apiRoutes);



app.listen(port, function(){

    console.log('Started Server: http://localhost:' + port);
});

