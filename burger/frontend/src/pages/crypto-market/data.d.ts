export type AssetItemDataType = {
  id: string;
  title: string;
  logo: string;
  description: string;
  status: 'normal' | 'airdrop' | 'exception' | 'active';
  price: number;
  change: number;
  id_icon: string;
  updatedAt: number;
  createdAt: number;
  star: number;
  content?: string;
};
