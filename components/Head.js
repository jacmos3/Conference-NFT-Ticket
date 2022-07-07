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
      <title>Little Traveler</title>
      <meta name="title" content="Little Traveler" />
      <meta
        name="description"
        content="A 10,000 native multichain PFP NFT project for the travelers and the travel industry."
      />

      {/* OG + Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.littletraveler.org" />
      <meta property="og:title" content="Little Traveler" />
      <meta
        property="og:description"
        content="A 10,000 native multi-chain PFP NFT project for the travelers and the travel industry."
      />
      <meta property="og:image" content="https://www.littletraveler.org/meta.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://www.littletraveler.org" />
      <meta property="twitter:title" content="Little Traveler" />
      <meta
        property="twitter:description"
        content="A 10,000 native multi-chain PFP NFT project for the travelers and the travel industry."
      />
      <meta property="twitter:image" content="https://www.littletraveler.org/meta.png" />

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
