/*
 * @author Gaurav Kumar
 */
const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');
const {gql} = require('apollo-server');


const typeDefs = gql`

    type User{
        _id:ID!
        username:String
        name:String
        email:String
        enabled:Boolean
        active:Boolean
        lastLoginAt:String
        createdAt:String
        updatedAt:String
    }
    type Post{
        _id:ID!
        title:String
        description:String
        createdAt:String
        updatedAt:String
        reactions:ReactionTypes
        options:[String]
    }
    type Reactions{
        totalPages:Int
        docs:[Reaction]
        totalDocs:Int
        page:Int
        hasPrevPage:Boolean!
        hasNextPage:Boolean!
        prevPage:Int
        nextPage:Int
    }
    type Reaction{
        _id:ID
        post:Post
        user:User
        kind:String
        data:String
        reactions:ReactionTypes
    }

    type Opinion{
        _id:ID
        post:Post
        user:User
        option:String
        reactions:ReactionTypes
    }

    type ReactionTypes{
        likes:Reactions
        comments:Reactions
        reports:Reactions
        mylike:Reaction
        mycomment:Reaction
        myreport:Reaction
    }

    type Opinions{
        totalPages:Int
        docs:[Opinion]
        totalDocs:Int
        page:Int
        hasPrevPage:Boolean!
        hasNextPage:Boolean!
        prevPage:Int
        nextPage:Int
    }

    type Query{
        user(username:String!):User
        me:User
        post(slug:String!):Post
        reactions(page:Int, limit:Int, orderBy:String,postId:ID!):Reactions

    }
    input reactionInput{
        post:ID
        kind:String
        data:String
        reaction:ID
    }
    input UserInput{
        fName:String!
        lName:String
        email:String!
        password:String!
        gender:String
        phone:String
        city:String
        grade:String
        dob:String
        role:String
    }
    input resetPasswordInput{
        resetToken:String!
        password:String!
    }

    scalar Upload

    type Mutation{
        createReaction(reactionInput:reactionInput):Reaction
        updateReaction(reactionInput:reactionInput, reactionId:ID!):Reaction
        deleteReaction(reactionId:ID!):Reaction
        login(email:String!, password:String!):User
        logout:Boolean
        register(email:String!, password:String!, username:String!):User
    }
`;

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

module.exports = schema;
