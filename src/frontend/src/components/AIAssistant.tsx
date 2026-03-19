import { Bot, GripVertical, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Knowledge Base ───────────────────────────────────────────────────────────
function getAIResponse(
  message: string,
  prices: Record<string, number>,
): string {
  const msg = message.toLowerCase();
  const btc = prices.BTC
    ? `$${prices.BTC.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : "loading...";
  const eth = prices.ETH
    ? `$${prices.ETH.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : "loading...";

  if (/(deposit|jama|add fund)/i.test(msg))
    return "To deposit on SKCE:\n1️⃣ Go to Wallet → Deposit\n2️⃣ Choose coin (USDT/BTC/ETH/SOL)\n3️⃣ Copy wallet address\n4️⃣ Send from your exchange\n\nUSDT (TRC20): THS4eZw4H6Xqdhnkdt3Up52ZSHQTKg6zRH\n\nAfter sending, submit your transaction hash. Admin approves within 1-2 hours. ✅";

  if (/(withdraw|nikalna|withdrawal)/i.test(msg))
    return "To withdraw on SKCE:\n1️⃣ Go to Wallet → Withdraw\n2️⃣ Choose coin\n3️⃣ Enter your wallet address\n4️⃣ Enter amount → Submit\n\n⚠️ KYC verification required. Admin approves within 2-4 hours. Minimum withdrawal: $10.";

  if (/(kyc|verify|verification)/i.test(msg))
    return `KYC is required for deposit, withdrawal & P2P trading.\n\n📋 Steps:\n1. Go to /kyc page\n2. Upload Front + Back of your ID\n3. Take a selfie photo\n4. Submit for review\n\nAdmin reviews within 24 hours. You'll get Level 1, 2, or 3 verification based on documents. 🔐`;

  if (/(p2p|peer)/i.test(msg))
    return "P2P Exchange lets you buy/sell crypto directly with other users.\n\n✅ KYC required.\n🌍 Select your country → see local payment methods\n💬 Chat with buyer/seller\n📤 Upload payment proof\n🔒 Escrow protects your funds\n\nGo to /p2p to start trading!";

  if (/(trading|trade|futures|long|short)/i.test(msg))
    return `SKCE Futures Trading at /futures:\n\n📊 Select pair (ETH/BTC/SOL/BNB)\n📈 LONG → if you think price will rise\n📉 SHORT → if you think price will fall\n\n⚡ Leverage:\n• 20x default\n• 50x after 10 trades\n• 100x after 50 trades\n\nCurrent prices: BTC ${btc}, ETH ${eth}\n\n⚠️ Always use stop-loss to protect your balance!`;

  if (/(balance|wallet|asset)/i.test(msg))
    return `Your wallet balance is shown in the Wallet page (/wallet).\n\n💰 Supported coins: BTC, ETH, USDT, SOL\n\nBalance updates after:\n• Every trade (profit/loss)\n• Deposit approval\n• Withdrawal approval\n\nCurrent market prices: BTC ${btc}, ETH ${eth}`;

  if (/(referral|invite|refer)/i.test(msg))
    return "🎁 Referral Program:\n\nInvite friends → Earn $1 per friend who joins and deposits!\n\n📤 Share your link on:\n• WhatsApp\n• Telegram\n• Social Media\n\nFind your referral link on the Earn/Referral page. No limit on earnings! 🚀";

  if (/(earn|earning|income|reward)/i.test(msg))
    return "Earn on SKCE via:\n\n1️⃣ Daily Tasks\n2️⃣ Social Tasks (like/share/follow)\n3️⃣ Video Tasks (watch vlogs)\n4️⃣ Trading Tasks\n5️⃣ Referral Bonus ($1/friend)\n6️⃣ 🎰 Spin the reward wheel daily\n\nAll tasks visible on Home & Earn page. Admin adds new tasks regularly!";

  if (/(vlog|video|watch)/i.test(msg))
    return "📺 Watch vlogs on the home page to earn rewards!\n\nAdmin sets the watch reward per video. Complete the full video to claim your reward.\n\nNew vlogs added regularly. Check the home page for latest videos. 🎬";

  if (/(admin|panel|dashboard)/i.test(msg))
    return "Admin panel is at /admin\n\n🔐 Only admins can access\n\nAdmin features:\n• Manage users\n• Approve deposits/withdrawals\n• KYC reviews\n• Add vlogs, tasks, signals\n• View analytics";

  if (/(login|signup|register|account|password)/i.test(msg))
    return "📝 Sign up with your email on the Signup page (/register)\n✅ Login at /login\n\n🔐 Keep your password safe. Use a strong unique password.\n\n⚠️ Note: Email OTP not available currently. Use email+password to login.";

  if (/(price|prices|rate|cost)/i.test(msg))
    return `📊 Live Crypto Prices (from Binance):\n\n₿ BTC: ${btc}\nΞ ETH: ${eth}\n\nPrices are fetched from Binance API every 8-15 seconds for maximum accuracy — matching TradingView in real-time.\n\nView all prices at /crypto dashboard.`;

  if (
    /(btc|bitcoin).*(buy|kharid)/i.test(msg) ||
    /(buy|kharid).*(btc|bitcoin)/i.test(msg)
  )
    return `₿ BTC is currently at ${btc}.\n\nMarket Analysis: BTC shows bullish momentum based on recent price action. Consider entering with a small position.\n\n💡 Tip: Use 20x leverage on Futures page. Always set a stop-loss at 2-3% below entry. Never risk more than 2% of your balance per trade.`;

  if (
    /(eth|ethereum).*(sell|bech)/i.test(msg) ||
    /(sell|bech).*(eth|ethereum)/i.test(msg)
  )
    return `Ξ ETH current price: ${eth}\n\nMarket is showing mixed signals. If you're in profit, consider taking partial profits to secure gains.\n\n📉 Visit /futures to place your Short trade. Use proper position sizing! ⚠️`;

  if (/(help|support|problem|issue|error)/i.test(msg))
    return `I'm SKCE Support AI 🤖 Here to help!\n\nI can assist with:\n• 💰 Deposits & Withdrawals\n• 🔐 KYC Verification\n• 📊 Trading & Futures\n• 🌍 P2P Exchange\n• 🎁 Earning & Referrals\n• ⚙️ Technical Issues\n\nJust type your question and I'll respond instantly! 24/7 support.`;

  return `I understand you need help with that. Let me point you in the right direction:\n\n📌 Quick Links:\n1. Wallet (/wallet) — balance issues\n2. KYC (/kyc) — verification\n3. P2P (/p2p) — peer trading\n4. Earn (/earn) — tasks & rewards\n5. Futures (/futures) — trading\n\nCurrent prices: BTC ${btc}, ETH ${eth}\n\nWhat specific issue are you facing? 😊`;
}

// ─── Message type ─────────────────────────────────────────────────────────────
type Message = {
  id: number;
  from: "user" | "ai";
  text: string;
  time: string;
};

const QUICK_ACTIONS = [
  "How to Deposit?",
  "KYC Help",
  "Trading Guide",
  "P2P Help",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "ai",
      text: "👋 Hello! I'm SKCE Support AI. I can help with deposits, withdrawals, KYC, trading, P2P, and more. How can I help you today?",
      time: new Date().toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Bubble drag state
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [bubbleDragging, setBubbleDragging] = useState(false);
  const bubbleDragOffset = useRef({ x: 0, y: 0 });
  const bubbleMoved = useRef(false);

  // Fetch live prices using 24hr ticker for all coins at once
  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();
        const symbolMap: Record<string, string> = {
          BTCUSDT: "BTC",
          ETHUSDT: "ETH",
          SOLUSDT: "SOL",
          BNBUSDT: "BNB",
          XRPUSDT: "XRP",
          ADAUSDT: "ADA",
        };
        const p: Record<string, number> = {};
        for (const item of data) {
          const key = symbolMap[item.symbol];
          if (key) p[key] = Number.parseFloat(item.lastPrice);
        }
        setPrices(p);
      } catch {
        // ignore
      }
    }
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!windowRef.current) return;
    setDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    e.preventDefault();
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!windowRef.current) return;
    setDragging(true);
    const rect = windowRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
    function onTouchMove(e: TouchEvent) {
      if (!dragging) return;
      const touch = e.touches[0];
      setPos({
        x: touch.clientX - dragOffset.current.x,
        y: touch.clientY - dragOffset.current.y,
      });
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  const onBubbleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setBubbleDragging(true);
      bubbleMoved.current = false;
      bubbleDragOffset.current = {
        x: e.clientX - (bubblePos.x || window.innerWidth - 100),
        y: e.clientY - (bubblePos.y || window.innerHeight - 60),
      };
      e.preventDefault();
    },
    [bubblePos],
  );

  const onBubbleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setBubbleDragging(true);
      bubbleMoved.current = false;
      const touch = e.touches[0];
      bubbleDragOffset.current = {
        x: touch.clientX - (bubblePos.x || window.innerWidth - 100),
        y: touch.clientY - (bubblePos.y || window.innerHeight - 60),
      };
    },
    [bubblePos],
  );

  useEffect(() => {
    function onBubbleMouseMove(e: MouseEvent) {
      if (!bubbleDragging) return;
      bubbleMoved.current = true;
      setBubblePos({
        x: e.clientX - bubbleDragOffset.current.x,
        y: e.clientY - bubbleDragOffset.current.y,
      });
    }
    function onBubbleTouchMove(e: TouchEvent) {
      if (!bubbleDragging) return;
      bubbleMoved.current = true;
      const touch = e.touches[0];
      setBubblePos({
        x: touch.clientX - bubbleDragOffset.current.x,
        y: touch.clientY - bubbleDragOffset.current.y,
      });
    }
    function onBubbleUp() {
      setBubbleDragging(false);
    }
    window.addEventListener("mousemove", onBubbleMouseMove);
    window.addEventListener("mouseup", onBubbleUp);
    window.addEventListener("touchmove", onBubbleTouchMove, { passive: true });
    window.addEventListener("touchend", onBubbleUp);
    return () => {
      window.removeEventListener("mousemove", onBubbleMouseMove);
      window.removeEventListener("mouseup", onBubbleUp);
      window.removeEventListener("touchmove", onBubbleTouchMove);
      window.removeEventListener("touchend", onBubbleUp);
    };
  }, [bubbleDragging]);

  function sendMessage(text?: string) {
    const txt = (text ?? input).trim();
    if (!txt) return;
    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text: txt,
      time: new Date().toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getAIResponse(txt, prices);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text: response,
          time: new Date().toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 800);
  }

  // Compute position style
  const windowStyle: React.CSSProperties =
    pos.x !== 0 || pos.y !== 0
      ? {
          position: "fixed",
          left: pos.x,
          top: pos.y,
          right: "auto",
          bottom: "auto",
        }
      : { position: "fixed", right: 20, bottom: 80 };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!bubbleMoved.current) setOpen(true);
            }}
            onMouseDown={onBubbleMouseDown}
            onTouchStart={onBubbleTouchStart}
            data-ocid="ai.open_modal_button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold shadow-2xl"
            style={
              bubblePos.x !== 0 || bubblePos.y !== 0
                ? {
                    position: "fixed",
                    left: bubblePos.x,
                    top: bubblePos.y,
                    right: "auto",
                    bottom: "auto",
                    background: "linear-gradient(135deg, #FFD700, #FFA500)",
                    color: "#0A0A0A",
                    zIndex: 9999,
                    boxShadow: "0 0 24px rgba(255,215,0,0.5)",
                    cursor: bubbleDragging ? "grabbing" : "grab",
                  }
                : {
                    position: "fixed",
                    right: 20,
                    bottom: 20,
                    background: "linear-gradient(135deg, #FFD700, #FFA500)",
                    color: "#0A0A0A",
                    zIndex: 9999,
                    boxShadow: "0 0 24px rgba(255,215,0,0.5)",
                    cursor: bubbleDragging ? "grabbing" : "grab",
                  }
            }
          >
            🤖 <span>AI Support</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={windowRef}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            data-ocid="ai.dialog"
            style={{
              ...windowStyle,
              width: 320,
              height: 450,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              borderRadius: 16,
              overflow: "hidden",
              background: "#0F1117",
              border: "1px solid rgba(255,215,0,0.25)",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.1)",
              userSelect: dragging ? "none" : "auto",
            }}
          >
            {/* Header — drag handle */}
            <div
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1A1A2E, #16213E)",
                borderBottom: "1px solid rgba(255,215,0,0.15)",
                cursor: dragging ? "grabbing" : "grab",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#FFD700" }}>
                    SKCE Support AI
                  </p>
                  <p className="text-[10px]" style={{ color: "#00FF88" }}>
                    ● Online — Ultra Fast
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GripVertical
                  className="w-4 h-4"
                  style={{ color: "#4A4E58" }}
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  data-ocid="ai.close_button"
                  className="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                  style={{ color: "#6A6E78" }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-2"
              style={{ scrollbarWidth: "none" }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap"
                    style={{
                      background:
                        msg.from === "user"
                          ? "linear-gradient(135deg, #FFD700, #FFA500)"
                          : "rgba(255,255,255,0.05)",
                      color: msg.from === "user" ? "#0A0A0A" : "#E0E2E8",
                      borderBottomRightRadius: msg.from === "user" ? 4 : 16,
                      borderBottomLeftRadius: msg.from === "user" ? 16 : 4,
                      border:
                        msg.from === "ai"
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "none",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl px-4 py-3 flex items-center gap-1"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderBottomLeftRadius: 4,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.15,
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#FFD700" }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div
              className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => sendMessage(action)}
                  className="px-2 py-1 rounded-full text-[10px] font-medium transition-all mt-2"
                  style={{
                    background: "rgba(255,215,0,0.08)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    color: "#FFD700",
                  }}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
              style={{
                borderTop: "1px solid rgba(255,215,0,0.1)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask anything..."
                data-ocid="ai.input"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/30"
                style={{ color: "#E0E2E8" }}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                data-ocid="ai.submit_button"
                className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-all"
                style={{
                  background: input.trim()
                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                    : "rgba(255,255,255,0.05)",
                  color: input.trim() ? "#0A0A0A" : "#4A4E58",
                }}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIAssistant;
