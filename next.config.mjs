import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  // Points to your i18n request config (see i18n/request.ts)
  "./i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config — keep what was here before
};

export default withNextIntl(nextConfig);
