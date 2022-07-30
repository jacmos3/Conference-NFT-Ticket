import React from 'react';
import { default as HTMLHead } from "next/head"; // Meta
/**
 * Meta HTML Head
 * @returns {ReactElement} HTML Head component
 */
function Head() {
  return (
    <HTMLHead>
      {/* Primary Meta Tags */}
      <title>Web3 in Travel NFT Tickets</title>
      <meta name="title" content="Web3 in Travel NFT Tickets" />
      <meta
        name="description"
        content="NFT ticket for -WEB3 IN TRAVEL- Summit. Porto, 14th of September 2022 The first travel summit dedicated to the transition to Web3.Speeches, panels and workshops to help the industry upgrade to the new internet."
      />

      {/* OG + Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.ticket.web3intravel.com/" />
      <meta property="og:title" content="Web3 in Travel NFT Tickets" />
      <meta
        property="og:description"
        content="NFT ticket for -WEB3 IN TRAVEL- Summit. Porto, 14th of September 2022 The first travel summit dedicated to the transition to Web3.Speeches, panels and workshops to help the industry upgrade to the new internet."
      />
      <meta property="og:image" content="www.ticket.web3intravel.com/meta.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://www.ticket.web3intravel.com/" />
      <meta property="twitter:title" content="Web3 in Travel NFT Tickets" />
      <meta
        property="twitter:description"
        content="NFT ticket for -WEB3 IN TRAVEL- Summit. Porto, 14th of September 2022 The first travel summit dedicated to the transition to Web3.Speeches, panels and workshops to help the industry upgrade to the new internet."
      />
      <meta property="twitter:image" content="https://www.ticket.web3intravel.com/meta.png" />

      {/* Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <link rel = "stylesheet" href = "//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css" />
    </HTMLHead>
  );
}
export default Head;
