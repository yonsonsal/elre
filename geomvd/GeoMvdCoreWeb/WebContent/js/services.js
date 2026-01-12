function getFeatureInfo(url) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url,
            headers: {
                "Accept": "application/json"
            },
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}