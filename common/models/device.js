'use strict';
module.exports = async function(Device) {
    const whiteList = [
        'create',
        'find',
        'findOne',
        'login'
    ];

    Device.sharedClass.methods().forEach((method) => {
        const name = method.isStatic ? method.name : `prototype.${method.name}`;
        if (whiteList.indexOf(name) === -1) Device.disableRemoteMethodByName(name);
    })

    Device.observe('before find', async (context) => {
        console.log("Device find .");
    })

    

};
