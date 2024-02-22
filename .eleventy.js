module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('site/public')
    
    return {
        passthroughFileCopy: true,
        dir: {
            input: "site",
            output: "dist"
        }
    }
    
};