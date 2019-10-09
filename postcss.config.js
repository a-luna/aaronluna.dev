module.exports = {
    plugins: [
        require('autoprefixer')({
            grid: true,
        }),
        require('postcss-uncss')({
            html: [
                'https://aaronlunadev.netlify.com/',
                'https://aaronlunadev.netlify.com/**/*.html'
            ]
        })
    ]
}