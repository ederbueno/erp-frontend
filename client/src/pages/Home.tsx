/**
 * Home.tsx - Redireciona para o Dashboard
 * Este arquivo é mantido por compatibilidade, mas o Dashboard é a página principal
 */

import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/dashboard");
  }, [setLocation]);

  return null;
}
