const url = 'https://rest.coinapi.io/v1/';
const apiKey = process.env.API_KEY;

async function listAssets(assets) {
    if (assets.length === 0) {
        return []
    }
    const assetsParam = assets.join(',');
    const finalUrl = `${url}assets?filter_asset_id=${encodeURIComponent(assetsParam)}`;
    console.log(finalUrl)

    return fetch(finalUrl, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain', 
            'X-CoinAPI-Key': apiKey 
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

async function getAssetRate(asset, time) {
    const finalUrl = `${url}exchangerate/${asset}/USD?time=${time}`;
    console.log(finalUrl)
    return fetch(finalUrl, {
        method: 'GET', 
        headers: {
            'Accept': 'text/plain', 
            'X-CoinAPI-Key': apiKey 
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}


async function getHistoryData(asset_id, time_start, time_end, limit=2, period_id='1DAY') {
    const finalUrl = `${url}exchangerate/${asset_id}/USD/history?period_id=${period_id}&time_start=${time_start}&time_end=${time_end}&limit=${limit}`;
    return fetch(finalUrl, {
        method: 'GET', 
        headers: {
            'Accept': 'text/plain', 
            'X-CoinAPI-Key': apiKey
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}


module.exports = {
    listAssets,
    getAssetRate,
    getHistoryData
}

