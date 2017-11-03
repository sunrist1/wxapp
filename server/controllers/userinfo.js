async function post(ctx, next) {
    console.log(ctx.request.body)
    ctx.body = ctx.request.body
}

async function get(ctx, next) {
    // const { signature, timestamp, nonce, echostr } = ctx.query
    // if (checkSignature(signature, timestamp, nonce)) ctx.body = echostr
    // else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'
    ctx.body = 'aaa'
}


module.exports = {
    post,
    get
}