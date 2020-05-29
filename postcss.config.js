module.exports = {
    plugins: [
        require('autoprefixer')({
            grid: true,
        }),
        require('@fullhuman/postcss-purgecss')({
            content: ['public/**/*.html']
        })
    ]
}
