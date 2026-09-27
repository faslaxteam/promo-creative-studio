import { useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

import OfferBannerEngine from "../components/offer-banner/OfferBannerEngine";
import SocialPosterEngine from "../components/social-poster/SocialPosterEngine";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getProductsAndShop {
        shop {
          name
          myshopifyDomain
          primaryDomain {
            url
          }
          currencyCode
        }
        products(first: 25) {
          edges {
            node {
              id
              title
              handle
              description
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    price
                    compareAtPrice
                  }
                }
              }
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  const shopData = responseJson.data?.shop;
  const rawProducts = responseJson.data?.products?.edges.map((edge: any) => edge.node) || [];

  const storeBaseUrl = shopData?.primaryDomain?.url || `https://${shopData?.myshopifyDomain}`;

  const formattedProducts = rawProducts.map((item: any) => {
    const rawPrice = item.variants?.edges[0]?.node?.price || "0";
    const rawComparePrice = item.variants?.edges[0]?.node?.compareAtPrice || "";
    
    return {
      id: item.id,
      title: item.title,
      name: item.title,
      handle: item.handle,
      description: item.description || "",
      imageUrl: item.featuredImage?.url || "",
      image: item.featuredImage?.url || "",
      price: parseFloat(rawPrice) || 0,
      originalPrice: rawComparePrice ? parseFloat(rawComparePrice) : undefined,
      productUrl: `${storeBaseUrl}/products/${item.handle}`,
      url: `${storeBaseUrl}/products/${item.handle}`,
    };
  });

  return {
    shop: {
      name: shopData?.name || "My Store",
      url: storeBaseUrl,
      currency: shopData?.currencyCode === "INR" ? "₹" : "$",
    },
    products: formattedProducts,
  };
};

export default function Index() {
  const { shop, products } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"banner" | "poster">("poster");

  const handleShareProduct = (product: any) => {
    const shareUrl = product.productUrl || product.url || shop.url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert(`Product link copied to clipboard:\n${shareUrl}`);
    } else {
      prompt("Copy product link:", shareUrl);
    }
  };

  const handleExport = (canvasBlobOrUrl: any) => {
    if (!canvasBlobOrUrl) return;

    if (typeof canvasBlobOrUrl === "string") {
      const link = document.createElement("a");
      link.download = `social-poster-${Date.now()}.png`;
      link.href = canvasBlobOrUrl;
      link.click();
    } else if (canvasBlobOrUrl instanceof Blob) {
      const url = URL.createObjectURL(canvasBlobOrUrl);
      const link = document.createElement("a");
      link.download = `social-poster-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Promo Creative Studio</h1>
        <p style={{ color: "#666", margin: "4px 0 0 0", fontSize: "14px" }}>
          Generate banners and social posters directly from store catalog
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e1e3e5", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("poster")}
          style={{
            padding: "10px 18px",
            border: "none",
            borderBottom: activeTab === "poster" ? "3px solid #008060" : "3px solid transparent",
            background: "none",
            fontWeight: activeTab === "poster" ? 700 : 500,
            color: activeTab === "poster" ? "#008060" : "#5c5f62",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Social Posters
        </button>
        <button
          onClick={() => setActiveTab("banner")}
          style={{
            padding: "10px 18px",
            border: "none",
            borderBottom: activeTab === "banner" ? "3px solid #008060" : "3px solid transparent",
            background: "none",
            fontWeight: activeTab === "banner" ? 700 : 500,
            color: activeTab === "banner" ? "#008060" : "#5c5f62",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Offer Banners
        </button>
      </div>

      {products.length > 0 ? (
        <div>
          {activeTab === "poster" ? (
            <SocialPosterEngine
              products={products}
              storeName={shop.name}
              storeUrl={shop.url}
              currencySymbol={shop.currency}
              onExport={handleExport}
              onShareProduct={handleShareProduct}
            />
          ) : (
            <OfferBannerEngine products={products} />
          )}
        </div>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", background: "#f6f6f7", borderRadius: "8px" }}>
          <p style={{ margin: 0, color: "#666" }}>No products available in this store.</p>
        </div>
      )}
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};