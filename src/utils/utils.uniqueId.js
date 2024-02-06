
class UniqueId {
    //unique id with prefix as parameter
    static create_UUID(prefix) {
        var dt = new Date().getTime();
        var uuid = `${prefix}-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    static create_password(prefix) {
        var dt = new Date().getTime();
        var password = `${prefix}xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return password;
    }

    // console.log('Unique id is: ',create_UUID('pol'));

}

module.exports = UniqueId;
