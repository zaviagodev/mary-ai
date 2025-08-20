'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';

export const Greeting = () => {
  const { t } = useTranslation();
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold mb-4"
      >
        {t('greeting.welcome')}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed"
      >
        {t('greeting.description')}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-base text-zinc-700 dark:text-zinc-300 mb-4"
      >
        {t('greeting.instruction')}
      </motion.div>

      <motion.ul
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-base text-zinc-600 dark:text-zinc-400 mb-6 ml-4 space-y-2"
      >
        <li>• {t('greeting.examples.productInfo')}</li>
        <li>• {t('greeting.examples.returns')}</li>
        <li>• {t('greeting.examples.purchase')}</li>
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-zinc-600 dark:text-zinc-400 mb-2"
      >
        {t('greeting.feedback')}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-zinc-600 dark:text-zinc-400 mb-4"
      >
        {t('greeting.improvement')}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-zinc-500 dark:text-zinc-500 italic border-t pt-4"
      >
        {t('greeting.note')}
      </motion.div>
    </div>
  );
};
