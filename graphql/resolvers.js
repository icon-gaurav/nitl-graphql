const AuthenticationError = require('apollo-server-errors').AuthenticationError;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const config = require('../config');
const randomize = require('randomatic');
// const {v4: uuid} = require('uuid');
const Post = require('../models/post');
const Reaction = require('../models/reactions');
const {add, isAfter} = require('date-fns')
const Reactions = require('../models/reactions');
const Opinion = require('../models/opinion');


const resolvers = {
    Query: {
        user: (parent, {username}, context) => {
            return User.findOne({username})
                .then(u => u)
                .catch(e => e)
        },
        me: (parent, {}, context) => {
            if (context.isAuthenticated()) {
                return context.getUser();
            } else {
                return new AuthenticationError("Unauthorized access");
            }
        },
        post: (parent, {slug = ""}, context) => {
            let searchQuery = {
                _id: slug
            };
            return Post.findOne(searchQuery)
                .then(async p => {
                    if (p) {
                        try {
                            const likes = await Reactions.paginate({post: p._id, kind: 'like'});
                            const comments = await Reactions.paginate({post: p._id, kind: 'comment'});
                            const commentList = [];
                            for(let i = 0; i < comments.docs.length; i++) {
                                let com = comments.docs[i];
                                const commentsLike = await Reactions.paginate({reaction: com._id, kind: 'like'});
                                const commentsReport = await Reactions.paginate({reaction: com._id, kind: 'report'});
                                if (context.isAuthenticated()) {
                                    const u = context.getUser();

                                    const mylike = await Reactions.findOne({
                                        reaction: com._id,
                                        kind: 'like',
                                        user: u._id
                                    });
                                    const myreport = await Reactions.findOne({
                                        reaction: com._id,
                                        kind: 'report',
                                        user: u._id
                                    });
                                    com.reactions = {
                                        likes:commentsLike,
                                        reports:commentsReport,
                                        mylike,
                                        myreport
                                    };
                                } else {
                                    com.reactions = {
                                        likes:commentsLike,
                                        reports:commentsReport,
                                    };
                                }
                                commentList.push(com)
                            }
                            comments.docs = commentList;

                            const reports = await Reactions.paginate({post: p._id, kind: 'report'});
                            if (context.isAuthenticated()) {
                                const u = context.getUser();

                                const mylike = await Reactions.findOne({
                                    post: p._id,
                                    kind: 'like',
                                    user: u._id
                                });
                                const mycomment = await Reactions.findOne({
                                    post: p._id,
                                    kind: 'comment',
                                    user: u._id
                                });
                                const myreport = await Reactions.findOne({
                                    post: p._id,
                                    kind: 'report',
                                    user: u._id
                                });
                                p.reactions = {
                                    likes,
                                    comments,
                                    reports,
                                    mylike,
                                    mycomment,
                                    myreport
                                };
                            } else {
                                p.reactions = {
                                    likes,
                                    comments,
                                    reports,
                                };
                            }
                            return p;
                        } catch (e) {
                            console.log(e)
                            return e;
                        }

                    } else {
                        return new Error("Not found")
                    }
                })
                .catch(e => e);
        },
    },
    Mutation: {
        login: async (root, {email, password}, context) => {
            if (context.isAuthenticated()) {
                return context.getUser();
            } else {
                const {user, info} = await context.authenticate("graphql-local", {email, password}, {session: true});
                context.login(user);
                return user;
            }
        },
        logout: (root, {input}, context) => {
            if (context.isAuthenticated())
                context.logout();
            return true;
        },
        register: (root, {email, password, username}, context) => {
            if (context.isAuthenticated()) {
                return new AuthenticationError("You are already logged in.");
            } else {
                return User.findOne({email: email})
                    .then(u => {
                        if (u) {
                            return new AuthenticationError("Email already exists.");
                        } else {
                            // register user
                            let newUser = new User({
                                email,
                                password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                                username
                            });
                            return newUser.save()
                                .then(nu => {
                                    try {
                                        const code = randomize('Aa0', 10);
                                        let newUserVerification = new EmailVerification({
                                            user: nu,
                                            email,
                                            code,
                                            expiresAt: add(new Date(), {days: 7})
                                        });
                                        newUserVerification.save()
                                            .then(ev => {
                                                Mailer.sendVerificationEmail(nu, `https://tricdot.com/email-verification?code=${ev.code}&email=${email}`)
                                                    .then(r => {
                                                        // console.log(r)
                                                    })
                                                    .catch(e => {
                                                        console.log(e)
                                                    })
                                            }).catch(e => {
                                            console.log(e)
                                        })

                                        return nu
                                    } catch (e) {
                                        return e;
                                    }

                                })
                                .catch(e => e)
                        }
                    })
                    .catch(e => e)
            }
        },
        createReaction: (root, {reactionInput}, context) => {
            // if (context.isAuthenticated()) {
            //     let u = context.getUser();
            let newReaction = new Reaction(reactionInput);
            // newReaction.user = u;
            return newReaction.save()
                .then(r => r)
                .catch(e => e)
            // } else {
            //     return new AuthenticationError("You are not logged in.");
            // }
        },
        deleteReaction: (root, {reactionId}, context) => {
            if (context.isAuthenticated()) {
                let u = context.getUser();
                return Reaction.findOne({_id: reactionId, user: u._id})
                    .then(r => {
                        if (r) {
                            return Reaction.deleteById(reactionId)
                                .then(rd => rd)
                                .catch(e => e)
                        } else {
                            return new Error("Not authorized to delete reaction")
                        }
                    })
                    .catch(e => e)
            } else {
                return new AuthenticationError("You are not logged in.");
            }
        },
        updateReaction: (root, {reactionInput}, context) => {
            if (context.isAuthenticated()) {
                let u = context.getUser();
                return Reaction.findOne({_id: reactionId, user: u._id})
                    .then(r => {
                        if (r) {
                            r.data = reactionInput.data;
                            return r.save()
                                .then(rd => rd)
                                .catch(e => e)
                        } else {
                            return new Error("Not authorized to update reaction")
                        }
                    })
                    .catch(e => e)
            } else {
                return new AuthenticationError("You are not logged in.");
            }
        },
    }
}

module.exports = resolvers;
