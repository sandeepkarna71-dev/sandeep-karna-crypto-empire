import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VlogCategory } from "../backend.d";
import { useActor } from "./useActor";

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
  total_volume: number;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string };
}

const BINANCE_COIN_MAP: Record<
  string,
  {
    id: string;
    symbol: string;
    name: string;
    image: string;
    market_cap: number;
  }
> = {
  BTCUSDT: {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    market_cap: 1650000000000,
  },
  ETHUSDT: {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    market_cap: 280000000000,
  },
  BNBUSDT: {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image:
      "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    market_cap: 95000000000,
  },
  SOLUSDT: {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    market_cap: 65000000000,
  },
  XRPUSDT: {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image:
      "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    market_cap: 130000000000,
  },
  ADAUSDT: {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    market_cap: 25000000000,
  },
  DOGEUSDT: {
    id: "dogecoin",
    symbol: "doge",
    name: "Dogecoin",
    image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
    market_cap: 26000000000,
  },
  DOTUSDT: {
    id: "polkadot",
    symbol: "dot",
    name: "Polkadot",
    image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
    market_cap: 7000000000,
  },
  AVAXUSDT: {
    id: "avalanche-2",
    symbol: "avax",
    name: "Avalanche",
    image:
      "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
    market_cap: 10000000000,
  },
  LINKUSDT: {
    id: "chainlink",
    symbol: "link",
    name: "Chainlink",
    image:
      "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    market_cap: 9000000000,
  },
};

const BINANCE_SYMBOLS = Object.keys(BINANCE_COIN_MAP);

async function fetchFromBinance(): Promise<CoinData[]> {
  const symbols = JSON.stringify(BINANCE_SYMBOLS);
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
  );
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data
    .map(
      (ticker: {
        symbol: string;
        lastPrice: string;
        priceChangePercent: string;
        quoteVolume: string;
      }) => {
        const meta = BINANCE_COIN_MAP[ticker.symbol];
        if (!meta) return null;
        return {
          ...meta,
          current_price: Number.parseFloat(ticker.lastPrice),
          price_change_percentage_24h: Number.parseFloat(
            ticker.priceChangePercent,
          ),
          total_volume: Number.parseFloat(ticker.quoteVolume),
        } as CoinData;
      },
    )
    .filter(Boolean) as CoinData[];
}

export function useCryptoPrices() {
  return useQuery<CoinData[]>({
    queryKey: ["crypto-prices"],
    queryFn: async () => {
      try {
        const coins = await fetchFromBinance();
        if (coins.length > 0) return coins;
      } catch {
        // fall through to empty
      }
      return [];
    },
    refetchInterval: 15000,
    placeholderData: [],
  });
}

const SAMPLE_NEWS: NewsArticle[] = [
  {
    title: "Bitcoin Surges as Institutional Demand Grows",
    description:
      "Major financial institutions continue to pour money into Bitcoin ETFs, pushing the price to new monthly highs amid growing mainstream adoption.",
    url: "#",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: "CryptoNews" },
  },
  {
    title: "Ethereum Layer 2 Solutions See Record Activity",
    description:
      "Layer 2 networks built on Ethereum are processing more transactions than ever, lowering fees and boosting DeFi adoption.",
    url: "#",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: "DeFi Pulse" },
  },
];

export function useWorldNews() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsArticle[]>({
    queryKey: ["world-news"],
    queryFn: async () => {
      if (!actor) return SAMPLE_NEWS;
      try {
        const json = await actor.fetchWorldNews();
        const parsed = JSON.parse(json);
        const articles = parsed?.articles || parsed;
        if (Array.isArray(articles) && articles.length > 0) return articles;
        return SAMPLE_NEWS;
      } catch {
        return SAMPLE_NEWS;
      }
    },
    enabled: !isFetching,
    refetchInterval: 300000,
    placeholderData: SAMPLE_NEWS,
  });
}

export function useVlogPosts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vlog-posts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getVlogPosts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVlogPostsByCategory(category: VlogCategory) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["vlog-posts", category],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const posts = await actor.getVlogPosts();
        return posts.filter((p) => String(p.category) === String(category));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAnnouncements();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActiveAds() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["active-ads"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveAds();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getAdminStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingDeposits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pending-deposits"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingDeposits();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pending-withdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingWithdrawals();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingEarnRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pending-earn-records"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPendingEarnRecords();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserDeposits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["user-deposits"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserDeposits();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["user-withdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserWithdrawals();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserEarnRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["user-earn-records"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserEarnRecords();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useCreateVlogPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      category: VlogCategory;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createVlogPost(
        data.title,
        data.description,
        data.videoUrl,
        data.thumbnailUrl,
        data.category,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlog-posts"] }),
  });
}

export function useUpdateVlogPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      videoUrl: string;
      thumbnailUrl: string;
      category: VlogCategory;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateVlogPost(
        data.id,
        data.title,
        data.description,
        data.videoUrl,
        data.thumbnailUrl,
        data.category,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlog-posts"] }),
  });
}

export function useDeleteVlogPost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteVlogPost(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vlog-posts"] }),
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createAnnouncement(data.title, data.content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAnnouncement(data.id, data.title, data.content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAnnouncement(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useCreateAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      imageUrl: string;
      linkUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createAd(
        data.title,
        data.description,
        data.imageUrl,
        data.linkUrl,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["active-ads"] }),
  });
}

export function useUpdateAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      imageUrl: string;
      linkUrl: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAd(
        data.id,
        data.title,
        data.description,
        data.imageUrl,
        data.linkUrl,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["active-ads"] }),
  });
}

export function useDeleteAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAd(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["active-ads"] }),
  });
}

export function useSubmitDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      currency: string;
      amount: string;
      txHash: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitDepositRequest(
        data.username,
        data.currency,
        data.amount,
        data.txHash,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-deposits"] }),
  });
}

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      amount: bigint;
      currency: string;
      walletAddress: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitWithdrawalRequest(
        data.username,
        data.amount,
        data.currency,
        data.walletAddress,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-withdrawals"] }),
  });
}

export function useClaimEarnForVideo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; videoId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.claimEarnForVideo(data.username, data.videoId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-earn-records"] }),
  });
}

export function useClaimEarnForArticle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; articleTitle: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.claimEarnForArticle(data.username, data.articleTitle);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-earn-records"] }),
  });
}

export function useApproveDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveDeposit(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-deposits"] }),
  });
}

export function useRejectDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectDeposit(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-deposits"] }),
  });
}

export function useApproveWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveWithdrawal(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pending-withdrawals"] }),
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectWithdrawal(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pending-withdrawals"] }),
  });
}

export function useApproveEarnRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveEarnRecord(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pending-earn-records"] }),
  });
}

export function useRejectEarnRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectEarnRecord(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["pending-earn-records"] }),
  });
}
