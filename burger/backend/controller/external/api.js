const url = 'https://rest.coinapi.io/v1/';
const apiKey = 'C464871D-C644-4E42-B86D-1E44F9E2133A'; // 请替换成你的API密钥

async function listAssets(assets) {
    if (assets.length === 0) {
        return []
    }
    const assetsParam = assets.join(',');
    const finalUrl = `${url}assets?filter_asset_id=${encodeURIComponent(assetsParam)}`;
    console.log(finalUrl)

    return fetch(finalUrl, {
        method: 'GET', // 指定请求方法为GET
        headers: {
            'Accept': 'text/plain', // 设置Accept请求头
            'X-CoinAPI-Key': apiKey // 设置API密钥请求头
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 将响应数据转换为JSON
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

async function getAssetRate(asset, time) {
    const finalUrl = `${url}exchangerate/${asset}/USD?time=${time}`;
    console.log(finalUrl)
    return fetch(finalUrl, {
        method: 'GET', // 指定请求方法为GET
        headers: {
            'Accept': 'text/plain', // 设置Accept请求头
            'X-CoinAPI-Key': apiKey // 设置API密钥请求头
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // 将响应数据转换为JSON
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

module.exports = {
    listAssets,
    getAssetRate,
}

