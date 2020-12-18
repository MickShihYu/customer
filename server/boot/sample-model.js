const ObjectId = require('mongodb').ObjectId;

module.exports = function(app){
    var User = app.models.user;
    var Device = app.models.Device;
    var Project = app.models.Project;

    create('1', 'BECMKT', ['78A3515C8642','E4956E4395F3']);
    create('2', 'DEFAULT', ['0004ED555555']);

    function create(number, company, mac_list){        
        const payload = {
            username: number, 
            email: number+'@'+number, 
            password: number
        }

        User.create(payload, function(err, user) {
            if (err){console.log(err);return;} 

            const projectPayload = {
                name: company,
                ownerId: user.id
            }

            Project.create(projectPayload , function(err, project) {
                if (err){console.log(err);return;} 

                changeProjectID(mac_list, project.id);   
             }); 
        });    
    }

    function changeProjectID(mac_list, projectId){
        mac_list.forEach(mac_id => {
            Device.findById(mac_id, function(err, device) {
                if (err){console.log(err);return;} 
                device.projectId = projectId;
                device.save();
                //console.log('Create device:' , device);
            });  
        });
    }

    // function login(number, company, mac_list){
    //     User.login({
    //         username: number, 
    //         password: number
    //     }, 'user', function(err, user) {
    //         if (err) console.log(err);

    //         Device.insert({
    //             mac_id: mac_id,
    //             ownerId: user.id,
    //             system_time: new Date()
    
    //         }, function(err, project) {
    //             if (err) console.log(err);
    //             console.log('Create project:', project);
    //         });
    //     });
    // }

}