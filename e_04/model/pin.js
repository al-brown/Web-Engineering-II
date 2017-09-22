/**
 *
 * @author Al Brown
 */


module.exports = function createPin(data) {
    var pin = {};
    if (!data.title) {
        pin.err = {"error": {"code": 400, "message": "Bad Request"}};
        return pin;
    }
    pin.title = data.title;
    if (!data.type[0]) {
        pin.image = "";
    } else {
        pin.type[0] = data.image;
    }git
    if (!data.src) {
        pin.err = {"error": {"code": 400, "message": "Bad Request"}};
        return pin;
    }
    pin.src = data.src;
    if (!data.length || parseInt(data.length) === NaN || parseInt(data.length) <= 0) {
        pin.err = {"error": {"code": 400, "message": "Bad Request"}};
        return pin;
    }
    pin.length = data.length;
    if (!data.views) {
        pin.views = 0;
    } else {
        if(parseInt(data.views) === NaN || parseInt(data.views) < 0){
            pin.err = {"error": {"code": 400, "message": "Bad Request"}};
            return pin;
        }
        pin.views = parseInt(data.views);
    }

    if (!data.ranking) {
        pin.ranking = 0;
    } else {
        if(parseInt(data.ranking) === NaN || parseInt(data.ranking) < 0){
            pin.err = {"error": {"code": 400, "message": "Bad Request"}};
            return pin;
        }
        pin.ranking = data.ranking;
    }
    pin.timestamp = new Date().getTime();
    return pin;
}
