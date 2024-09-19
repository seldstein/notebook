// https://github.com/11ty/eleventy/releases/tag/v3.0.0-beta.1
// https://www.11ty.dev/blog/canary-eleventy-v3/#new-features-and-a-short-upgrade-guide

import pluginWebc from "@11ty/eleventy-plugin-webc";

export default function (eleventyConfig) {
  //www.11ty.dev/docs/languages/webc/
  https: eleventyConfig.addPlugin(pluginWebc, {
    // https://www.11ty.dev/docs/languages/webc/#global-no-import-components
    components: "_includes/components/**/*.webc",
  });

  eleventyConfig.addLayoutAlias("base", "base.njk");

  // eleventyConfig.addTransform(wikilink, {
  //   /\[\[(.*?)\|(.*?)\]\]/g
// All wikilinks have a title with the 
  // })

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
