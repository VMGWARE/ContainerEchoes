import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Container Echoes",
  tagline: "An efficient, real-time Docker log management tool. ",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://vmgware.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/ContainerEchoes/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "VMGWARE", // Usually your GitHub org/user name.
  projectName: "ContainerEchoes", // Usually your repo name.
  deploymentBranch: "gh-pages", // The branch of your docs repo that you are going to deploy to GitHub pages.
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/VMGWARE/ContainerEchoes/tree/master/docs/",
          includeCurrentVersion: true,
          lastVersion: "current",
          versions: {
            current: {
              label: "Next",
              // banner: "unreleased",
              banner: "none",
            },
          },
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    () => ({
      name: "docusaurus-plugin-favicon",
      injectHtmlTags() {
        return {
          headTags: [
            {
              tagName: "link",
              attributes: {
                rel: "icon",
                href: "/img/favicon.ico",
                sizes: "any",
              },
            },
            {
              tagName: "link",
              attributes: {
                rel: "icon",
                href: "/img/favicon.svg",
                type: "image/svg+xml",
              },
            },
          ],
        };
      },
    }),
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    navbar: {
      title: "Container Echoes",
      logo: {
        alt: "Container Echoes Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          type: "docsVersionDropdown",
          position: "right",
        },
        {
          href: "https://github.com/VMGWARE/ContainerEchoes",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Intro",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "VMG Ware Community",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/m5NzuSQCrE",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/VMGWARE/ContainerEchoes",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Container Echoes. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    markdown: {
      format: "detect",
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
