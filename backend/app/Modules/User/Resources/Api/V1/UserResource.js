exports.make = (user , token = null , ignore = [] , type = null) => {
    ignore.forEach((v , k) => {
        if (user && user.hasOwnProperty(v)) {
            user[v] = undefined;
        }
    });

    return {
        id: user?.id,
        name: user?.name,
        phone: user?.phone,
        status: user?.status,
        email: user?.email,
        token: token ? token : undefined,
        type
    };
}