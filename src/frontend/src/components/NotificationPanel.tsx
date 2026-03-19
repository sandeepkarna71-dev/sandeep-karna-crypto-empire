import { Bell, CheckCircle, TrendingUp, Wallet, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    icon: Zap,
    color: "#FFD700",
    title: "Daily Spin Available!",
    desc: "Your daily spin reward is ready to claim.",
    time: "Just now",
    unread: true,
  },
  {
    id: 2,
    icon: TrendingUp,
    color: "#00FF88",
    title: "BTC Price Alert",
    desc: "Bitcoin crossed $95,000 — up 3.2% today.",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: Wallet,
    color: "#00F0FF",
    title: "Deposit Confirmed",
    desc: "Your USDT deposit has been approved by admin.",
    time: "1 hr ago",
    unread: false,
  },
  {
    id: 4,
    icon: CheckCircle,
    color: "#00FF88",
    title: "Task Reward Credited",
    desc: "+$0.50 USDT added to your wallet balance.",
    time: "2 hr ago",
    unread: false,
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: Props) {
  const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            data-ocid="notifications.panel"
            className="fixed top-20 right-4 z-50 w-80 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(15,15,15,0.97)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,215,0,0.2)",
              boxShadow:
                "0 0 40px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: "#FFD700" }} />
                <span className="font-display font-bold text-white text-sm">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full text-black"
                    style={{ background: "#FF3366" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                data-ocid="notifications.close_button"
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-white/5">
              {SAMPLE_NOTIFICATIONS.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    data-ocid={`notifications.item.${notif.id}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-colors cursor-pointer"
                    style={{
                      background: notif.unread
                        ? "rgba(255,215,0,0.03)"
                        : "transparent",
                      borderLeft: notif.unread
                        ? "2px solid rgba(255,215,0,0.5)"
                        : "2px solid transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${notif.color}18` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: notif.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">
                        {notif.title}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-white/25 mt-1">
                        {notif.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-2 text-center border-t border-white/5">
              <button
                type="button"
                className="text-xs font-medium"
                style={{ color: "#FFD700" }}
              >
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
