module.exports.make = (chat) => {
    return {
        'id': chat.id,
        'text': chat.text,
        'sender': chat.sender,
    }
}

module.exports.collection = (chats) => {
    let res = [];
    chats.forEach( (v , k) => {
        res[k] =  {
            'id': v.id,
            'text': v.text,
            'sender': v.sender,
        }
    } );

    return res;
}