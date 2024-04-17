import requests
import json
import pandas as pd

url = "https://rest.coinapi.io/v1/assets"
icon_url = "https://rest.coinapi.io/v1/assets/icons/512"

payload={}
headers = {
  'Accept': 'text/plain',
  'X-CoinAPI-Key': 'E2BD8A35-0C3F-4A37-B47B-C286049DB887'
}

results = []
response = requests.request("GET", url, headers=headers, data=payload)
crypto_infos = json.loads(response.text)

response = requests.request("GET", icon_url, headers=headers, data=payload)
crypto_icon = json.loads(response.text)

for crypto in crypto_infos:
    if not crypto['type_is_crypto']:
        continue

    crypto_info = {
        'id': crypto['asset_id'],
        'name': crypto['name'],
    }

    for icon in crypto_icon:
        if icon['asset_id'] == crypto_info['id']:
            crypto_info['symbolUrl'] = icon['url']
            break
    else:
        continue    

    results.append(crypto_info)

# Save as csv
df = pd.DataFrame(results)
df.to_csv('crypto.csv', index=False)
    