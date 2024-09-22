// https://github.com/11ty/eleventy/releases/tag/v3.0.0-beta.1
// https://www.11ty.dev/blog/canary-eleventy-v3/#new-features-and-a-short-upgrade-guide

import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import htmlmin from "html-minifier-terser";
import CleanCSS from "clean-css";
import markdownIt from "markdown-it";
import markdownItReplaceLink from "markdown-it-replace-link";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "static/icons/*": "/",
  });

  // PLUGINS
  // Navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  //www.11ty.dev/docs/languages/webc/
  eleventyConfig.addPlugin(pluginWebc, {
    // https://www.11ty.dev/docs/languages/webc/#global-no-import-components
    components: "_includes/components/**/*.webc",
  });

  // Transform wiklinks
  eleventyConfig.addTransform("wikilink", function (content) {
    if (this.page.outputPath?.endsWith(".html")) {
      return (
        content
          // Remove outer brackets
          // Credit: https://github.com/juanfrank77/foam-eleventy-template/blob/master/.eleventy.js
          .replace(/(\[+(<a.*?<\/a>)\]+)/g, "$2")
          // Remove text before pipe (eg [[link|text]]>>>[[text]])
          // Credit: Claude.ai
          .replace(/<a[^>]*>(.*?)<\/a>/g, (match, text) => {
            const pipeText = text.match(/\|(.+)/)?.[1]?.trim();
            return pipeText ? match.replace(text, pipeText) : match;
          })
      );
    }
    return content;
  });

  if (process.env.ELEVENTY_RUN_MODE === "build") {
    // Minify html
    eleventyConfig.addTransform("htmlmin", function (content) {
      if ((this.page.outputPath || "").endsWith(".html")) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });

        return minified;
      }
      // If not an HTML output, return content as-is
      return content;
    });
  }

  let markdownItOptions = {
    html: true,
    replaceLink: function (link, env) {
      const isRelativePattern = /^(?!http|\/).*/;
      const lastSegmentPattern = /[^\/]+(?=\/$|$)/i;
      const isRelative = isRelativePattern.test(link);

      if (isRelative) {
        const hasLastSegment = lastSegmentPattern.exec(env.page.url);
        // If it's nested, replace the last segment
        if (hasLastSegment && env.page.url) {
          return env.page.url.replace(lastSegmentPattern, link);
        }
        // If it's at root, just add the beginning slash
        return env.page.url + link;
      }

      return link;
    },
  };
  let markdownLib = markdownIt(markdownItOptions).use(markdownItReplaceLink);
  eleventyConfig.setLibrary("md", markdownLib);

  // FILTERS
  // Minify css
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Return all the tags used in a collection
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet).sort();
  });

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || [])
      .filter((tag) => ["all", "notes"].indexOf(tag) === -1)
      .sort();
  });

  // Exclude private notes from build
  eleventyConfig.addGlobalData("eleventyComputed.permalink", function () {
    return (data) => {
      if (data.private && !process.env.BUILD_PRIVATE) {
        return false;
      }
      return data.permalink;
    };
  });

  eleventyConfig.on("eleventy.before", ({ runMode }) => {
    if (runMode === "serve" || runMode === "watch") {
      process.env.BUILD_PRIVATE = true;
    }
  });

  // Add layout aliases
  eleventyConfig.addLayoutAlias("base", "base.njk");

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      layouts: "../_includes/layouts",
      // Should be working, because it was working when _data lived in the content folder
      data: "../_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
