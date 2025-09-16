import { motion } from "framer-motion";

export default function FAB({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300/40 dark:focus:ring-indigo-700/40"
      aria-label="Schedule a meeting"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
