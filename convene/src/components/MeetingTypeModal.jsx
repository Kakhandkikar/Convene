import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Clock, Users } from "lucide-react";

export default function MeetingTypeModal({ onClose, onSelectType }) {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelect = (type) => {
    setSelectedType(type);
    setTimeout(() => {
      onSelectType(type);
    }, 200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className="relative w-[92vw] max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Create New Meeting
            </h2>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/50 dark:focus:ring-slate-600/50 rounded"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Choose how you'd like to schedule your meeting
            </p>

            {/* Manual Meeting Option */}
            <motion.button
              onClick={() => handleSelect('manual')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedType === 'manual'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    Manual Scheduling
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Choose your own date and time for the meeting
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>You set the schedule</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Automated Meeting Option */}
            <motion.button
              onClick={() => handleSelect('automated')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedType === 'automated'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    AI-Powered Scheduling
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Let our AI find the best time for everyone
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3 h-3" />
                    <span>Optimized for all participants</span>
                  </div>
                </div>
              </div>
            </motion.button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
