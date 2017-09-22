/**
 *
 * @author Al Brown
 */

module.exports = {

    validateQuery: function (keys) {
        return function (req, res, next) {

            for (o in req.query) {

                if (!keys.hasOwnProperty(o)) {
                    return res.status(400).json({"error": {"code": 400, "message": "Bad Request"}}).end();
                }
                if (keys[o] === 'number' && (isNaN(parseInt(req.query[o])) || parseInt(req.query[o]) < 0)) {
                    return res.status(400).json({"error": {"code": 400, "message": "Bad Request"}}).end();
                }
            }
            next();
        }
    },

    queryFilter: function (obj, query) {
        if (!obj) {
            return undefined;
        } else {
            if (Object.keys(query).length > 0) {
                if (query.filter) {
                    var ret = {};
                    filter_operations = query.filter.split(',');
                    for (f in filter_operations) {
                        if(!obj.hasOwnProperty(filter_operations[f])){
                            return {"error": {"code": 400, "message": "Bad Request"}};
                        }
                        ret[filter_operations[f]] = obj[filter[f]];
                    }
                    return ret;
                }
                return obj;
            }else {
                return obj;
            }
        }
    },

    listFilter: function(list, query, objFilter){
        if (!list) {
            return undefined;
        } else {
            if(query){
                var offset = 0;
                var limit = list.length;
                var ret = [];
                if (query.offset) {
                    offset = parseInt(query.offset);
                    if(offset >= list.length){
                        return {"error": {"code": 400, "message": "Bad Request"}};
                    }
                }
                if (query.limit){
                    limit = parseInt(query.limit);
                    if(limit === 0){
                        return {"error": {"code": 400, "message": "Bad Request"}};
                    }
                }else{
                    limit -= offset;
                }
                for(var i = offset; i<offset+limit; i++){
                    if(list[i]){
                        if(objFilter){
                            ret.push(objFilter(list[i],query));
                        }else {
                            ret.push(list[i]);
                        }
                    } else{
                        i=offset+limit;
                    }
                };
                return ret;
            }else {
                return list;
            }
        }
    }
}
