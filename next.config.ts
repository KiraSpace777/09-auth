// next.config.ts
// ==============
// Глобальні налаштування збірки програми програми та оптимізації ресурсів

import type { NextConfig } from "next";

// ОБ'ЄКТ КОНФІГУРАЦІЇ СЕРВЕРА NEXT.JS ЗГІДНО З ВИМОГАМИ ДОМАШНЬОГО ЗАВДАННЯ
const nextConfig: NextConfig = {
  reactCompiler: true,

  // НАЛАШТУВАННЯ ДЛЯ БЕЗПЕЧНОГО ЗАВАНТАЖЕННЯ ВІДДAЛЕНИХ АВАТАРОК КОРИСТУВАЧІВ
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ac.goit.global",
      },
    ],
  },
};

export default nextConfig;
