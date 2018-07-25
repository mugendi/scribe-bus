
var options = {
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
}

var {logger} = require('..')(options);

logger.log('This is a log!')
logger.info('This is a for your information!')
logger.error('This is an Error')
logger.warn('This is a warning')
logger.custom('This is a custom message', 'CUSTOM TAG')
logger.custom({type:"Object", msg: "Hey Yah!"}, ['OBJECT','Greeting'])
logger.log('This is a log with Two Tags', 'Other_Tag')
