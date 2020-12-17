const ObjectId = require('mongodb').ObjectId;

module.exports = function(app){
    var User = app.models.user;
    var Device = app.models.Device;
    var Project = app.models.Project;

    //login('0004ed555555');
    //create('1', 'default', ['0004ed555554','0004ED555555', '0004ed555556']);
    //create('2', ['1004ed555554','1004ed555555', '1004ed555556']);

    //create('1', ['78A3515C8642']);

    create('1', 'DEFAULT', '78A3515C8642');
    //create('1', 'DEFAULT', '60034748736E');

    function create(number, company, mac_id){        
        const payload = {
            username: number, 
            email: number+'@'+number, 
            password: number
        }

        

        User.create(payload, function(err, user) {
            if (err){console.log(err);return;} 

            const projectPayload = {
                name: company,
                ownerId: user.id,
                mac_id: mac_id
            }

            Project.create(projectPayload , function(err, project) {
                if (err){console.log(err);return;} 

                //Device.create({mac_id: mac_id, system_time: new Date(), from:'DEFAULT'}, function(err, device) {
                //Device.create({mac_id: project.id, system_time: new Date(), from:'DEFAULT'}, function(err, device) {
                //     if (err){console.log(err);return;} 
                //     console.log(device);
                // }); 

                Device.findById(mac_id, function(err, device) {
                    if (err){console.log(err);return;} 
                    device.projectId = project.id;
                    device.save();
                    console.log('Create device:' , device);
                }); 
                
             }); 


            // mac_list.forEach(mac_id => {
            //     Device.findById(mac_id, function(err, device) {
            //         if (err){console.log(err);return;} 
            //         device.ownerId = users.id;
            //         device.save();
            //         console.log('Create project:' , device);
            //     }); 
            // });
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