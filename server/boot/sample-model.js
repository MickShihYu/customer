module.exports = function(app){
    var User = app.models.user;
    var Device = app.models.Device;

    //login('0004ed555555');
    //create('1', 'default', ['0004ed555554','0004ed555555', '0004ed555556']);
    //create('2', ['1004ed555554','1004ed555555', '1004ed555556']);

    function create(number, company_name, mac_list){        
        const payload = {
            username: number, 
            email: number+'@'+number, 
            password: number
        }

        User.create([payload]
        , function(err, users) {
            if (err){console.log(err);return;} 
            
            mac_list.forEach(mac => {
                Device.insert({
                    company: company_name,
                    mac_id: mac,
                    ownerId: users[0].id,
                    system_time: new Date()
                }, function(err, project) {
                    if (err){console.log(err);return;} 
                    console.log('Create project:', project);
                }); 
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