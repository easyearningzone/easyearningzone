import React, { useState, useEffect } from 'react';
import { ShoppingBag, Tag, Plus, CheckCircle2, ShieldCheck, Mail, Sparkles, Smartphone, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User, Wallet, MarketplaceListing, PlatformType } from '../types';
import { apiService } from '../lib/db';

interface AccountMarketplaceProps {
  user: User;
  wallet: Wallet | null;
  onPurchaseSuccess: (updatedWallet: Wallet) => void;
  onRefreshTrigger: () => void;
}

export default function AccountMarketplace({
  user,
  wallet,
  onPurchaseSuccess,
  onRefreshTrigger
}: AccountMarketplaceProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filter, setFilter] = useState<PlatformType | 'all'>('all');
  
  // Create state listings parameters
  const [isSellOpen, setIsSellOpen] = useState<boolean>(false);
  const [platformType, setPlatformType] = useState<PlatformType>('gmail');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priceBdt, setPriceBdt] = useState<number>(100);
  const [secretCredentials, setSecretCredentials] = useState<string>('');
  
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Read decrypted credentials for sold items where current user is the buyer OR seller
  const [revealedSecrets, setRevealedSecrets] = useState<{ [id: string]: boolean }>({});

  const reloadListings = async () => {
    setActionLoading(true);
    const data = await apiService.getMarketplaceListings();
    setListings(data);
    setActionLoading(false);
  };

  useEffect(() => {
    reloadListings();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!user.is_verified) {
      setStatusMsg({ type: 'error', text: 'You must pay the 100 BDT verification charge before listing products in the marketplace!' });
      return;
    }

    if (!title || !description || !secretCredentials || priceBdt <= 0) {
      setStatusMsg({ type: 'error', text: 'Please fill out all product parameters' });
      return;
    }

    setActionLoading(true);
    const res = await apiService.createMarketplaceListing(
      user.id,
      user.username,
      platformType,
      title,
      description,
      secretCredentials,
      priceBdt
    );
    setActionLoading(false);

    if (res.success && res.listing) {
      setStatusMsg({ type: 'success', text: `Success! Listed "${title}" for BDT ${priceBdt} inside Easy Earning BD.` });
      // Reset form
      setTitle('');
      setDescription('');
      setSecretCredentials('');
      setPriceBdt(100);
      setIsSellOpen(false);
      reloadListings();
      onRefreshTrigger(); // Sync ledgers in main App
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to list account.' });
    }
  };

  const handleBuyListing = async (listing: MarketplaceListing) => {
    setStatusMsg(null);
    if (listing.seller_id === user.id) {
      setStatusMsg({ type: 'error', text: 'Listing violation: You are forbidden from purchasing your own listed account items.' });
      return;
    }

    if (!wallet || Number(wallet.balance_bdt) < Number(listing.price_bdt)) {
      setStatusMsg({ type: 'error', text: `Inadequate wallet balance. This account asks for BDT ${listing.price_bdt} Taka.` });
      return;
    }

    const confirmBuy = window.confirm(`Confirm purchase of are "${listing.title}" for ৳ ${listing.price_bdt} BDT Taka?`);
    if (!confirmBuy) return;

    setActionLoading(true);
    const res = await apiService.purchaseMarketplaceListing(user.id, listing.id);
    setActionLoading(false);

    if (res.success && res.listing) {
      setStatusMsg({
        type: 'success',
        text: `Transaction Complete! Purchased "${listing.title}". Secret login credentials are now decrypted and visible on the card below.`
      });
      
      // Update local wallet view
      const freshWallet = await apiService.getWallet(user.id);
      if (freshWallet) {
        onPurchaseSuccess(freshWallet);
      }
      
      // Update listings feed
      reloadListings();
      onRefreshTrigger();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Purchase rejected.' });
    }
  };

  const toggleRevealSecret = (id: string) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter listings
  const filteredListings = listings.filter(l => filter === 'all' || l.platform_type === filter);

  // Platform styling helpers
  const platformConfigs = {
    gmail: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Verified Gmail' },
    fb: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Facebook Page/UID' },
    insta: { color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', label: 'Instagram Profile' },
    tiktok: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'TikTok Niche' },
    whatsapp: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'WhatsApp Business' }
  };

  return (
    <div id="marketplace-hub" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl mb-8 relative">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 text-cyan-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-sans">Account Marketplace</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Secure escrow shop for verified accounts & bulk items</p>
          </div>
        </div>

        <button
          onClick={() => setIsSellOpen(!isSellOpen)}
          className="py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow hover:shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Post Your Account for Sell</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex gap-2 border mb-6 ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Sell overlay panel */}
      {isSellOpen && (
        <div className="mb-6 p-5 bg-black/40 border border-white/10 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            ✏️ Core Listing parameters
          </h3>

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase text-left block">Platform Type</label>
                <select
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value as PlatformType)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="gmail">Gmail Address</option>
                  <option value="fb">Facebook Account</option>
                  <option value="insta">Instagram Profile</option>
                  <option value="tiktok">TikTok Handle</option>
                  <option value="whatsapp">WhatsApp Number</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-mono text-gray-400 uppercase text-left block">Listing Offer Title</label>
                <input
                  type="text"
                  placeholder="e.g. 2018 Aged GMail with Security Recovery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase text-left block">Public Marketing Description</label>
              <textarea
                placeholder="Give descriptive characteristics (friends, creation date, activity niche) that are visible to everyone before buy..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 leading-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-3">
                <label className="text-[10px] font-mono text-gray-400 uppercase text-left block">
                  🔐 Secret Account Login Credentials (Visible only to Buyer after payment match)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Username: myname | Pass: key123 | RecovEmail: mail@yahoo.com"
                  value={secretCredentials}
                  onChange={(e) => setSecretCredentials(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-emerald-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 uppercase text-left block">Asking Price (BDT)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400 text-xs font-mono font-bold">৳</span>
                  <input
                    type="number"
                    min="10"
                    placeholder="250"
                    value={priceBdt}
                    onChange={(e) => setPriceBdt(Number(e.target.value))}
                    required
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSellOpen(false)}
                className="py-2 px-4 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 text-xs rounded-lg font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="py-2 px-5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                {actionLoading ? 'Uploading...' : 'Confirm escrow publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Selector tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`py-1.5 px-3.5 rounded-full font-mono text-xs transition-all ${filter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          All Items ({listings.length})
        </button>
        {Object.entries(platformConfigs).map(([key, item]) => {
          const count = listings.filter(l => l.platform_type === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key as PlatformType)}
              className={`py-1.5 px-3.5 rounded-full font-mono text-xs transition-all flex items-center gap-1.5 ${filter === key ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <span>{key.toUpperCase()}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {actionLoading && listings.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-400 font-mono">
          <span className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin inline-block mr-2" />
          Synchronizing secure market feed listings...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 font-mono border border-dashed border-white/5 rounded-xl bg-black/20">
          No available listings located under this category currently. Be the first to list and secure Taka profit!
        </div>
      ) : (
        /* Listings Cards bento grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredListings.map((listing) => {
            const config = platformConfigs[listing.platform_type] || platformConfigs.gmail;
            const isSold = listing.status === 'sold';
            const isMyPost = listing.seller_id === user.id;
            const isMyPurchase = listing.buyer_id === user.id;

            // Decrypt authorization flag (readable only if purchaser OR seller of accounts)
            const canReadSecrets = isMyPost || isMyPurchase;

            return (
              <div
                key={listing.id}
                className="bg-slate-950/40 border border-white/5 hover:border-cyan-500/10 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden"
              >
                <div>
                  {/* Badge & Ask Row */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 border rounded text-[9px] uppercase font-mono tracking-wide ${config.color}`}>
                      {config.label}
                    </span>
                    
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      ৳ {Number(listing.price_bdt).toFixed(2)} Taka
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white tracking-tight leading-tight line-clamp-1 mb-1 font-mono">
                    {listing.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 leading-normal mb-4 font-sans line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Decrypted payload drawer (Secure window reveals here!) */}
                  {isSold ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3.5 mb-4 text-xs font-mono">
                      <div className="flex justify-between items-center mb-1 text-emerald-400 text-[10px]">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> SECURE DECRYPTION COMPLETED</span>
                        {canReadSecrets && (
                          <button
                            onClick={() => toggleRevealSecret(listing.id)}
                            className="text-white hover:underline focus:outline-none flex items-center gap-1 cursor-pointer"
                          >
                            {revealedSecrets[listing.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{revealedSecrets[listing.id] ? 'Hide' : 'Reveal'}</span>
                          </button>
                        )}
                      </div>
                      
                      {canReadSecrets ? (
                        revealedSecrets[listing.id] ? (
                          <div className="p-1 px-2.5 bg-black/40 rounded text-emerald-300 font-bold select-all break-all leading-normal text-[11px]">
                            {listing.account_details}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic text-[11px]">••••••••••••••••••••••••••••••••••••</div>
                        )
                      ) : (
                        <div className="text-gray-500 italic text-[10px]">Sold to encrypted buyer platform profile</div>
                      )}
                    </div>
                  ) : (
                    // Available item placeholder
                    <div className="bg-white/5 border border-white/5 rounded-lg p-3.5 mb-4 text-[10.5px] font-mono text-gray-500 italic flex items-center justify-between">
                      <span>Credentials locked in escrow vault</span>
                      <span className="text-[9px] bg-cyan-500/5 text-cyan-400 px-1 py-0.5 rounded border border-cyan-500/10">ESCROW ACTIVE</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-gray-500">
                  <span>Seller: <span className="text-gray-300 font-semibold">{isMyPost ? 'You (Escrow)' : listing.seller_username}</span></span>
                  
                  {isSold ? (
                    <span className="text-gray-500 flex items-center gap-1 font-bold">
                      🔴 SOLD OUT
                    </span>
                  ) : isMyPost ? (
                    <span className="text-cyan-400 font-medium">
                      🟢 Your Live Post
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuyListing(listing)}
                      className="py-1 px-3 bg-cyan-500 text-slate-950 font-bold text-[11px] rounded-lg hover:bg-cyan-400 transition-all cursor-pointer shadow hover:shadow-cyan-400/5"
                    >
                      Buy Instantly
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
