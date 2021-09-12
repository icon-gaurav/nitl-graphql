var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {ApolloServer} = require('apollo-server-express');
var mongoose = require('mongoose');
var config = require('./config');
var cookieSession = require('cookie-session');
var passport = require('passport');
var {GraphQLLocalStrategy, buildContext} = require('graphql-passport');
var app = express();
const schema = require('./graphql/schema');
var User = require('./models/user');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Post = require('./models/post');
dotenv.config();
/* Connection with mongodb using mongoose odm */
mongoose.connect(config.prod_database, {useNewUrlParser: true, useUnifiedTopology: true}).then((result) => {
    console.log(`database connected in ${process.env.NODE_ENV} environment`);

    // let newPost = new Post({
    //     title:"Dummy title",
    //     description:"Dummy description",
    // })
    // newPost.save()
    //     .then()
    //     .catch((err) => {console.log(err)})
    /* passport configuration*/
    passport.use(new GraphQLLocalStrategy((email, password, done) => {
        User.findOne({email: email})
            .then(user => {
                if (user && bcrypt.compareSync(password, user.password)) {
                    if (user.active) {
                        if (user.enabled) {
                            done(null, user);
                        } else {
                            done(new Error('Your account has been disabled by the admin. Contact our administrator for further query'), null)
                        }
                    } else {
                        done(new Error('Please verify your email.'), null)
                    }

                } else {
                    done(new Error('Either email or password is incorrect'), null);
                }
            })
            .catch(err => {
                console.log(err);
                done(err, null);
            })
    }));


    app.use(logger('dev'));


    app.use(cookieSession({
        name: 'session',
        keys: ['key1', 'key2'],
    }));

    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                console.log(err);
                done(err, null);
            });
    });
    const server = new ApolloServer({
        schema,
        context: ({req, res}) => buildContext({req, res, User}),
        playground: true,
        introspection: true
    });

    app.get('/', (req, res, next) => {
        res.send("API server is up & running")
    })

    server.applyMiddleware({
        app, cors: {
            credentials: true,
            origin:true
        }, path: '/api/graphql'
    });
}).catch((error) => {
    console.log(error);
});

module.exports = app;
