const util      = require('./util');
const http      = require('http');
const Koa       = require('koa');
const serve     = require('koa-static');
const Router    = require('koa-router');
const koaBody   = require('koa-body');
const webpush   = require('web-push');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');

const port = process.env.PORT || 3000;
const app = new Koa();
const router = new Router();

var vapidKeys = {
    publicKey:"BPwgIYTh9n2u8wpAf-_VzZ4dwaBY8UwfRjWZzcoX6RN7y5xD0RL9U4YDCdeoO3T8nJcWsQdvNirT11xJwPljAyk",
    privateKey:"TIrMnK-r--TE7Tnwf-x4JfKwuFKz5tmQuDRWYmuwbhY"
}

webpush.setVapidDetails(
    'zhli:zhli@brocelia.fr',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

/**
 * send subscription info，and save in DB (util file)
 */
router.post('/subscription', koaBody(), async ctx => {
    let body = ctx.request.body;
    await util.saveRecord(body);
    ctx.response.body = {
        status: 0
    };
});


/**
 * send push info to push service
 * @param {*} subscription 
 * @param {*} data
 */
// call webpush.sendNotification() to push messages to Push Service.
function pushMessage(subscription, data = {}) {
    
    webpush.sendNotification(subscription, data).then(data => {
        console.log('push service\'s data is:', JSON.stringify(data));
        //console.log("Subscription from user: "+subscription);  // endpoint and keys
        return;
    }).catch(err => {
        // 440 and 410 means failed
        if (err.statusCode === 410 || err.statusCode === 404) {
            return util.remove(subscription);
        }
        else {
            console.log(subscription);
            console.log(err);
        }
    })
}


/**
 * push API
 */
router.post('/push', koaBody(), async ctx => {
    for(i in ctx.request.body){
        var json = JSON.parse(i); 
        let{uniqueid,payload} = json
        console.log('uniqueid: ' + uniqueid);
        console.log('payload: ' + payload);
        let list = uniqueid ? await util.find({uniqueid}) : await util.findAll();
        let status = list.length > 0 ? 0 : -1;
        
        for (let i = 0; i < list.length; i++) {
            let subscription = list[i].subscription;
            pushMessage(subscription, JSON.stringify(payload));
        }

        ctx.response.body = {
            status
        };
    }
    
    
    
});

router.get('/login', async(ctx) => {
    let query = ctx.query;
    //let query = ctx.request.query;
    console.log(query);
    ctx.body = {
        query
    };
})

app.use(cors());
app.use(router.routes());
app.use(serve(__dirname + '/public'));
app.listen(port,() => {
    console.log(`listen on port: ${port}`);
});
