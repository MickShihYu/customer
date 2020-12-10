module.exports = function(app){
    var User = app.models.user;
    var Device = app.models.Device;

    //login('0004ed555555');
    //create('2', '0004ed555554');

    function create(number, mac_id){        

        const payload = {
            username: number, 
            email: number+'@'+number, 
            password: number
        }

        User.create([
            payload
        ], function(err, users) {
            if (err) throw err;
            Device.insert({
                mac_id: mac_id,
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