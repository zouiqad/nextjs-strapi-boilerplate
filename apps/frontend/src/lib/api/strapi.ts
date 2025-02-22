import { APP_CONFIG, FALLBACK_SEO } from "@/app.config";
import { env } from "@/env.mjs";
import type { Common, GetValues } from "@nextjs-strapi-boilerplate/backend";
import type { Metadata } from "next";
import qs from "qs";

type ApiContentTypeUid = Extract<Common.UID.ContentType, `api::${string}`>;

const API_ENDPOINTS: {
  [K in ApiContentTypeUid]: string;
} = {
  "api::article.article": "/articles",
  "api::page.page": "/pages",
};

// Get base url of strapi API
export function strapiGetUrl(path = ""): string {
  return `${env.STRAPI_URL ?? "http://localhost:1337"}${path}`;
}

// Get path of media from strapi (can be external media or media hosted by strapi)
export function strapiGetMedia(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  // Return the full URL if the media is hosted on an external provider
  if (url.startsWith("http") ?? url.startsWith("//")) {
    return url;
  }

  // Otherwise prepend the URL path with the Strapi URL
  return `${strapiGetUrl()}${url}`;
}

export function strapiGetMetaData(
  metadata: GetValues<"shared.seo"> | null,
  pageUrl: string,
): Metadata {
  if (!metadata) return FALLBACK_SEO;

  const openGraph = {
    type: "website",
    locale: "fr_FR",
    title: metadata.metaTitle,
    description: metadata?.metaDescription,
    url: metadata?.canonicalURL ?? pageUrl,
    image: {
      url: strapiGetMedia(metadata.metaImage?.data?.attributes?.url),
      alt: metadata?.metaImage
        ? (metadata.metaImage?.data?.attributes?.alternativeText ??
          `Image seo ${APP_CONFIG.name}`)
        : `Image seo ${APP_CONFIG.name}`,
      width: metadata.metaImage
        ? metadata.metaImage?.data?.attributes?.width
        : 1200,
      height: metadata.metaImage
        ? metadata.metaImage?.data?.attributes?.height
        : 630,
    },
  };

  const twitterCard = {
    card: "summary_large_image",
    site: APP_CONFIG.twitter,
    title: metadata?.metaTitle,
    description: metadata?.metaDescription,
    image: strapiGetMedia(metadata.metaImage?.data?.attributes?.url),
  };

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    keywords: metadata.keywords,
    robots: metadata.metaRobots,
    creator: APP_CONFIG.creator,
    authors: APP_CONFIG.authors,
    openGraph,
    twitter: twitterCard,
  };
}

export function strapiGetUrlFromSlug(
  slug: string,
  entity?: ApiContentTypeUid,
): string {
  switch (entity) {
    case "api::article.article":
      return `${APP_CONFIG.website}/articles/${slug}`;
    default:
      return `${APP_CONFIG.website}/${slug}`;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStrapiApiByUid(uid: ApiContentTypeUid): string {
  const path = API_ENDPOINTS[uid];

  if (path) {
    return path;
  }

  throw new Error(
    `Endpoint for UID "${uid}" not found. Extend API_ENDPOINTS in src/utils/strapi-fetcher`,
  );
}

// Function to call any endpoint of the strapi api
export async function strapiFetcher(
  apiUid: ApiContentTypeUid,
  urlParamsObject = {},
  options = {},
) {
  const path = getStrapiApiByUid(apiUid);

  try {
    const cacheDuration: number = env.NODE_ENV === "development" ? 0 : 60;

    // Merge default and user options
    const mergedOptions = {
      next: { revalidate: cacheDuration },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.STRAPI_API_PUBLIC_TOKEN}`,
      },
      ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject);
    const requestUrl = `${strapiGetUrl(
      `/api${path}${queryString ? `?${queryString}` : ""}`,
    )}`;

    if (env.NODE_ENV === "development") {
      await delay(1000);
    }

    // Trigger API call
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(
      `Please check if your strapi server is running and you set all the required tokens.`,
    );
  }
}
