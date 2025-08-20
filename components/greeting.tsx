import { motion } from 'framer-motion';

export const Greeting = () => {
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
        ยินดีต้อนรับสู่ระบบทดลองใช้งาน 👋
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed"
      >
        ระบบนี้เป็นเวอร์ชันทดลองก่อนเชื่อมต่อกับระบบรวมแชทของคุณจริง
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-base text-zinc-700 dark:text-zinc-300 mb-4"
      >
        คุณสามารถทดลองใช้งานได้เสมือนเป็นลูกค้าที่ติดต่อเข้ามา เช่น
      </motion.div>

      <motion.ul
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-base text-zinc-600 dark:text-zinc-400 mb-6 ml-4 space-y-2"
      >
        <li>• สอบถามข้อมูลสินค้า</li>
        <li>• ขอคืน / เปลี่ยนสินค้า</li>
        <li>• แจ้งความต้องการซื้อสินค้า</li>
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="text-sm text-zinc-600 dark:text-zinc-400 mb-2"
      >
        หากข้อความที่ AI ตอบยังไม่ตรงใจ สามารถกด 👍 / 👎 เพื่อให้ฟีดแบคได้เลย
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-zinc-600 dark:text-zinc-400 mb-4"
      >
        ทางทีมงาน Zaviago จะนำฟีดแบคของคุณไปปรับปรุงต่อไปค่ะ
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-zinc-500 dark:text-zinc-500 italic border-t pt-4"
      >
        หมายเหตุ: ระบบอาจประมวลผลช้ากว่าระบบจริงเล็กน้อย
      </motion.div>
    </div>
  );
};
