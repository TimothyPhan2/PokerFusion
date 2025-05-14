import { motion } from "framer-motion";
import Logo from "/logo/poker-fusion-logo.png";

interface Props {
  width?: number;
  className?: string;
}

function SharedLogo({ width = 550, className = "" }: Props) {
  return (
    <motion.div
      layoutId="shared-logo"
      className={className}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <motion.img src={Logo} style={{ width: width }} />
    </motion.div>
  );
}

export default SharedLogo;
