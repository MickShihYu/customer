'use strict';
const bcrypt = require('bcrypt');
// const jwt = require('jwt');
const jwt = require('jsonwebtoken');

module.exports = function(Customer) {

    Customer.createUser = function(username, email, password, cb) {
        Customer.findOne({name:username}, (err, user)=>{
            if(err) return cb(err);
            if(user) return cb(new Error('user is exit'));

            Customer.create({
                username: username,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
                email: email
            }, (err, user)=>{
                if(err) return cb(err);                
                
                user.token = 'Bearer ' + jwt.sign({user: {id: user.id, email: user.email}}, 'token_test');

                return cb(null, user);
            });
        });
    };
     
    Customer.remoteMethod('createUser',{
            accepts: [
                {arg: 'username', type: 'object'},
                {arg: 'email', type: 'string'},
                {arg: 'password', type: 'string'}
            ],
            returns: {arg: 'devices', type: 'object'},
            http: {path:'/createUser', verb: 'post'}
        }
    );

    Customer.login = function(name, cb) {
        Customer.find({where:{name:name}}, cb);
    };
     
    Customer.remoteMethod('login',{
            accepts: [{arg: 'mac_id', type: 'String'}],
            returns: {arg: 'devices', type: 'array'},
            http: {path:'/login', verb: 'post'}
        }
    );
};
