module.exports = {
    plugins: [
        require('autoprefixer')({
            grid: true,
        }),
        require('postcss-uncss')({
            html: ['https://aaronlunadev.netlify.com/']
        })
    ]
}