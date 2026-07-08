// src/hooks/useFavicon.ts

import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import api from "@/lib/api";

// حفظ القيم الأصلية الموجودة في index.html
const DEFAULTS = {
  title: document.title,
  favicon:
    document.querySelector<HTMLLinkElement>("link[rel='icon']")?.href ||
    document.querySelector<HTMLLinkElement>("link[rel*='icon']")?.href ||
    "",
  shortcut:
    document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']")?.href ||
    "",
  ogImage:
    document.querySelector<HTMLMetaElement>("meta[property='og:image']")
      ?.content || "",
  twitterImage:
    document.querySelector<HTMLMetaElement>("meta[name='twitter:image']")
      ?.content || "",
  jsonLd:
    document.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    )?.textContent || "",
};

export const useFavicon = () => {
  const { role, instructorData } = useApp();

  useEffect(() => {
    const updateFavicon = async () => {
      // Admin أو أي Role غير Teacher
      if (role !== "teacher" && role !== "instructor") {
        return;
      }

      try {
        // البيانات موجودة بالفعل
        if (instructorData?.image?.fullUrl) {
          updateFaviconElement(
            instructorData.image.fullUrl,
            instructorData.name
          );
          return;
        }

        // جلب البيانات
        const response = await api.get("/admin/check-auth");

        if (
          response.data?.result === "Success" &&
          response.data?.data?.image?.fullUrl
        ) {
          updateFaviconElement(
            response.data.data.image.fullUrl,
            response.data.data.name
          );
        } else {
          resetFavicon();
        }
      } catch (error) {
        console.warn("⚠️ Could not update favicon:", error);
        resetFavicon();
      }
    };

    updateFavicon();
  }, [role, instructorData]);
};

const updateFaviconElement = (
  imageUrl: string,
  teacherName?: string
) => {
  document
    .querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
    .forEach((link) => {
      link.href = imageUrl;
    });

  const ogImage = document.querySelector(
    "meta[property='og:image']"
  ) as HTMLMetaElement;

  if (ogImage) {
    ogImage.content = imageUrl;
  }

  const twitterImage = document.querySelector(
    "meta[name='twitter:image']"
  ) as HTMLMetaElement;

  if (twitterImage) {
    twitterImage.content = imageUrl;
  }

  if (teacherName) {
    document.title = `${teacherName} | Teacher Dashboard`;
  }

  const jsonLd = document.querySelector(
    'script[type="application/ld+json"]'
  ) as HTMLScriptElement;

  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent || "{}");

      data.logo = imageUrl;

      if (teacherName) {
        data.name = teacherName;
      }

      jsonLd.textContent = JSON.stringify(data);
    } catch {}
  }
};

const resetFavicon = () => {
  document.title = DEFAULTS.title;

  document
    .querySelectorAll<HTMLLinkElement>("link[rel*='icon']")
    .forEach((link) => {
      link.href = DEFAULTS.favicon;
    });

  const shortcut = document.querySelector(
    "link[rel='shortcut icon']"
  ) as HTMLLinkElement;

  if (shortcut) {
    shortcut.href = DEFAULTS.shortcut;
  }

  const ogImage = document.querySelector(
    "meta[property='og:image']"
  ) as HTMLMetaElement;

  if (ogImage) {
    ogImage.content = DEFAULTS.ogImage;
  }

  const twitterImage = document.querySelector(
    "meta[name='twitter:image']"
  ) as HTMLMetaElement;

  if (twitterImage) {
    twitterImage.content = DEFAULTS.twitterImage;
  }

  const jsonLd = document.querySelector(
    'script[type="application/ld+json"]'
  ) as HTMLScriptElement;

  if (jsonLd && DEFAULTS.jsonLd) {
    jsonLd.textContent = DEFAULTS.jsonLd;
  }
};