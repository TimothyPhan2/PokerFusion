import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import GameSetupScreen from "../screens/game/GameSetupScreen";
import GameTableScreen from "../screens/game/GameTableScreen";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GameSetupScreen />} />
        <Route path="/table/:gameCode" element={<GameTableScreen />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
