// API route to provide Web3 configuration without exposing sensitive keys
// The Infura/Alchemy key is kept server-side

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return only public RPC endpoints - no API keys exposed
  const config = {
    polygon: {
      chainId: 137,
      chainName: 'Polygon Mainnet',
      rpcUrls: [
        'https://polygon-rpc.com',
        'https://rpc-mainnet.matic.quiknode.pro',
        'https://polygon-mainnet.public.blastapi.io'
      ],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      blockExplorerUrls: ['https://polygonscan.com']
    }
  };

  res.status(200).json(config);
}
