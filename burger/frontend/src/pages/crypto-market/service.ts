import axios from 'axios';
import type { CardListItemDataType } from './data.d';

export async function queryFakeList(params: {
  count: number;
}): Promise<{ data: { list: CardListItemDataType[] } }> {
  let url = 'api/crypto';
  const { data } = await axios.get(url, { params });
  return data;
}

export async function queryDetails() {
  try {
    // Fetch the initial list of crypto data
    const results = await queryFakeList({ count: 6 });
    const crypto_list = results.data.list;

    // Prepare the request config
    const config = {
      method: 'get',
      url: 'https://rest.coinapi.io/v1/assets/',
      headers: { 
        'Accept': 'text/plain', 
        'X-CoinAPI-Key': 'E2BD8A35-0C3F-4A37-B47B-C286049DB887'
      }
    };

    // Fetch all assets data at once
    const response = await axios(config);
    const assets = response.data;

    // Convert the array to a map for quick access
    const assetsMap = new Map(assets.map(asset => [asset.asset_id, asset]));

    // Filter and map to new structure
    const list = crypto_list.filter(crypto => assetsMap.has(crypto.id)).map(crypto => {
      const asset = assetsMap.get(crypto.id);
      return {
        id: crypto.id,
        title: crypto.title,
        logo: crypto.logo,
        description: '',
        status: 'normal',
        price: asset.price_usd,
        id_icon: asset.id_icon,
        updatedAt: asset.data_end,
        createdAt: asset.data_start,
        star: 100,
        content: '',
      };
    });
    console.log('list:', list);
    return list
  } catch (error) {
    console.error('Error in queryDetails:', error);
    throw error;
  }
}