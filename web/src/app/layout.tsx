import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Literata } from "next/font/google";

import "./globals.css";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

/**
 * Literata — nomes de espécie, títulos e texto de leitura corrida. O itálico
 * é requisito funcional, não enfeite: nome científico se escreve em itálico, e
 * uma família sem itálico desenhado deixa Panthera onca feio em toda página
 * do site (guia.md §4). Daí o `style: ["normal", "italic"]`.
 */
const serif = Literata({
  subsets: ["latin"],
  style: ["normal", "italic"],
  // `opsz` traz o eixo óptico: com `font-optical-sizing: auto`, o desenho da
  // letra muda com o corpo — mais contraste e menos ar no display, mais
  // robustez no texto miúdo. É o ganho de elegância mais barato que existe.
  axes: ["opsz"],
  variable: "--fonte-leitura",
  display: "swap",
});

/** Atkinson Hyperlegible — interface, rótulos, dados tabulados, números e siglas. */
const sans = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--fonte-interface",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bioplanet.example"),
  title: {
    default: "BioPlanet — catálogo de espécies",
    template: "%s · BioPlanet",
  },
  description:
    "Catálogo público de fauna e flora: ficha completa de cada espécie, com taxonomia, distribuição, ameaças e status de conservação da IUCN.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "BioPlanet",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-papel text-tinta antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-controle focus:border focus:border-tinta focus:bg-papel focus:px-3 focus:py-2 focus:font-interface focus:text-apoio"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
