module.exports = function(app){
    var User = app.models.user;
    var Device = app.models.Device;

    //login('0004ed555555');

    function create(){        
        User.create([
            {username: '1', email: '1@1', password: '1'}
        ], function(err, users) {
            if (err) throw err;
            Device.insert({
                mac_id: 'MAC123450004ed55555567',
                ownerId: users[0].id,
                system_time: new Date()

            }, function(err, project) {
                if (err) throw err;
                console.log('Create project:', project);
            });
        });    
    }

    function login(mac_id){
        User.login({
            username: '1',
            password: '1',
        }, 'user', function(err, user) {
            if (err) console.log(err);
            Device.insert({
                mac_id: mac_id,
                ownerId: user.id,
                system_time: new Date()
    
            }, function(err, project) {
                if (err) console.log(err);
                console.log('Create project:', project);
            });
        });
    }
}