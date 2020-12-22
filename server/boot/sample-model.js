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
            changeProjectID(mac_list, user.id);   
        });    
    }

    function changeProjectID(mac_list, ownerId){
        mac_list.forEach(mac_id => {
            Device.findById(mac_id, function(err, device) {
                if (err){console.log(err);return;} 
                device.ownerId = ownerId;
                device.save();
            });  
        });
    }
}