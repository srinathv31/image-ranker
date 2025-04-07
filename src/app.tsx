import { useState, useEffect } from "react";
import Home from "./pages/home";
import { Providers } from "./components/providers";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    // Register the API ready listener
    const cleanup = window.electron.onApiReady(() => {
      setIsApiReady(true);
    });

    return cleanup;
  }, []);

  return <Providers>{!isApiReady ? <LoadingScreen /> : <Home />}</Providers>;
}
