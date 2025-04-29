import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Test() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-black">
      <motion.div
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 text-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: scrollPosition < 1000 ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Scroll to view the product images!
        </h1>
      </motion.div>
      <motion.div
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 text-center z-50"
        initial={{ opacity: 0 }}
        animate={{
          opacity: scrollPosition >= 2000 && scrollPosition < 3000 ? 1 : 0,
        }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Scroll to view the product images1!
        </h1>
      </motion.div>
      <motion.div
        className="fixed top-[50px] left-1/2 transform -translate-x-1/2 text-center z-50"
        initial={{ opacity: 0 }}
        animate={{
          opacity: scrollPosition >= 4000 && scrollPosition < 5000 ? 1 : 0,
        }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-3xl font-extrabold text-white tracking-wide">
          Scroll to view the product images2!
        </h1>
      </motion.div>

      <div className="h-[10000px]"></div>
    </div>
  );
}
