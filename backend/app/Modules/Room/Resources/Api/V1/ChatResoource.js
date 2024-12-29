module.exports.make = (chat) => {
    return {
        'id': chat?.id,
        'text': chat?.text ? Buffer.from(chat?.text, 'base64').toString('utf-8') : null,
        'sender': chat.sender,
    }
}

module.exports.collection = (chats) => {
    let res = [];
    chats.forEach( (v , k) => {
        res[k] =  {
            'id': v?.id,
            'text': Buffer.from(v?.text, 'base64').toString('utf-8'),
            'sender': v.sender,
        }
    } );

    return res;
}