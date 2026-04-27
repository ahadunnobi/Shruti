import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

/**
 * Supported locales — add more here as translations are added.
 */
export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/**
 * Resolve the active locale for each request:
 *   1. Check the `NEXT_LOCALE` cookie (set by the language switcher)
 *   2. Fall back to the Accept-Language header
 *   3. Use the defaultLocale
 */
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;

  let locale: Locale = defaultLocale;

  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLang = headers().get("accept-language") ?? "";
    const preferred  = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase();
    if (preferred && (locales as readonly string[]).includes(preferred)) {
      locale = preferred as Locale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
