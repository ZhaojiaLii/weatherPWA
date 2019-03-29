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
 * 提交subscription信息，并保存
 */
router.post('/subscription', koaBody(), async ctx => {
    let body = ctx.request.body;
    await util.saveRecord(body);
    ctx.response.body = {
        status: 0
    };
});


/**
 * 向push service推送信息
 * @param {*} subscription 
 * @param {*} data
 */
// call webpush.sendNotification() to push messages to Push Service.
function pushMessage(subscription, data = {}) {
    
    webpush.sendNotification(subscription, data).then(data => {
        console.log('push service的相应数据:', JSON.stringify(data));
        return;
    }).catch(err => {
        // 判断状态码，440和410表示失效
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
 * 消息推送API，可以在管理后台进行调用
 * 本例子中，可以直接post一个请求来查看效果
 */
router.post('/push', koaBody(), async ctx => {
    let {uniqueid, payload} = ctx.request.body;
    let list = uniqueid ? await util.find({uniqueid}) : await util.findAll();
    let status = list.length > 0 ? 0 : -1;
    for (let i = 0; i < list.length; i++) {
        let subscription = list[i].subscription;
        pushMessage(subscription, JSON.stringify(payload));
    }

    ctx.response.body = {
        status
    };
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
