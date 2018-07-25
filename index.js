const scribe = require('./lib/scribe-js')(),
    //do not use global.console but the new console instead
    logger = process.console,
    redis = require('redis'),
    NRP = require('node-redis-pubsub'),
    Console2 = require('./lib/scribe-js/lib/console2'),
    stack = require('callsite'),
    path = require('path');

var _logger = new Console2();



var l = function (options) {

    let self = this;

    this.options = Object.assign({
        redis: {
            port: 6379,
            host: '127.0.0.1'
        }
    }, options);


    var redisPub = redis.createClient(this.options.redis),
        redisSub = redis.createClient(this.options.redis),
        config = {
            emitter: redisPub, // Pass in an existing redis connection that should be used for pub
            receiver: redisSub, // Pass in an existing redis connection that should be used for sub
        },
        loggers = [{
            name: 'log',
            color: 'white'
        },
        {
            name: 'info',
            color: 'cyan'
        },
        {
            name: 'error',
            color: 'red'
        },
        {
            name: 'warning',
            color: 'yellow'
        },
        {
            name: 'dir',
            color: 'white'
        },
        {
            name: 'custom',
            color: 'gray'
        }
    ]

    self.nrp = new NRP(config); // This is the NRP client

    //add loggers
    loggers.forEach(function (logger) {
        _logger.addLogger(logger.name, logger.color);
        makeLoggerLevel.call(self, logger.name)
    });


};

// l.prototype.custom = function (data, tags) {

//     tags = tags || ['Custom'];
//     if (!Array.isArray(tags)) tags = [tags];

//     tags = tags.map(s=>s.toUpperCase())

//     var stack = stackTrace();

//     _logger.tag(...tags).time().file().log({
//         stack,
//         data
//     });

//     this.nrp.emit('log', {
//         level: 'log',
//         msg: data,
//         stack,
//         tags
//     });


// }

l.prototype.listen = function () {
    this.nrp.on('log', function (data) {

        try {


            if (typeof data !== 'object' || !data.msg) {
                data.msg = data.toString();
            }

            if (data.level == 'custom') {
                data.level = 'log'
            }

            logger.tag(...data.tags).time().file(data.filename)[data.level]({
                stack: data.stack,
                data: data.msg
            });


        } catch (error) {
            console.error(error);
        }

    });
}

function makeLoggerLevel(level) {

    let self = this;

    level = level || 'log';
    let level_ = level.toLowerCase();
    if (level == 'warning') {
        level_ = 'warn'
    }


    this[level_] = function (data, tags) {

        // 

        if (!Array.isArray(tags)) tags = tags ? [tags] : [];
        var stack = stackTrace(),
            tags = [level.toUpperCase()].concat(tags);

        _logger.tag(...tags).time().file()[level]({
            stack,
            data
        });

        this.nrp.emit('log', {
            level: level,
            msg: data,
            stack,
            tags
        });

    }

}

function stackTrace() {
    var st = stack()[2],
        result = {};

    var filename = path.basename(st.getFileName());
    var line = st.getLineNumber();

    return {
        filename,
        line
    }
}


module.exports = function (options) {
    // console.log({options});
    return {
        scribe,
        logger: new l(options)
    }
}