import { StrictMode } from "react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

function GoogleAnalytics() {
  useEffect(() => {
    if (!measurementId) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

    const inlineScript = document.createElement("script");
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;

    document.head.appendChild(script);
    document.head.appendChild(inlineScript);

    return () => {
      script.remove();
      inlineScript.remove();
    };
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleAnalytics />
    <App />
  </StrictMode>
);
