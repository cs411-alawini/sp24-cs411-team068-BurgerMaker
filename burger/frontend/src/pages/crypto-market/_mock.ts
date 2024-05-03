import type { Request, Response } from 'express';
import type { CardListItemDataType } from './data.d';
import crypto_list from '../../../assets/crypto.json'

function fakeList(count: number): CardListItemDataType[] {
  const list = [];
    for (let i = 0; i < count; i += 1) {
      let crypto = crypto_list[i];
      list.push({
        id: `${crypto.id}`,
        title: crypto.name,
        logo: crypto.symbol_url,
        description: 'A crypto, detailed information to be imported, and a brief description of the crypto.',
        status: 'normal',
        price: crypto.price,
        change: crypto.change,
        href: '',
        updatedAt: 20210801,
        createdAt: 20210801,
        star: 100,
        content: '',
      });
    }
  return list;
}

function getFakeList(req: Request, res: Response) {
  const params = req.query as any;
  const count = Number(params.count) * 1 || 6;
  const result = fakeList(count);
  return res.json({
    data: {
      list: result,
    },
  });
}

export default {
  'GET  /api/crypto': getFakeList,
};
