const { ServiceProvider } = require('@adonisjs/fold')
class Provider extends ServiceProvider {
    register () {            
        this.registerPipeline();
        this.registerRedisStuff();
    }
    
    registerPipeline () {
        this.app.singleton('Xyz/Pipeline', () => {            
            const kafka = use('kafka-node');
            // const Config = this.app.use("Adonis/Src/Config");
            // const Helpers = this.app.use("Adonis/Src/Helpers");
            const Pipeline = require('../src');                   
            return new Pipeline(kafka);
        });
        this.app.alias('Xyz/Pipeline', 'Pipeline');
    }
    registerRedisStuff () {
        this.app.singleton('XYZ/RedisStuff', () => {
            const RedisStuff = require('../src/redis');
            return new RedisStuff();
        });
        this.app.alias('XYZ/RedisStuff', 'RedisStuff');
    }
}

module.exports = Provider;