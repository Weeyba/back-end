const html = {
Render: (mess, href, LinkText) => {
    return `
    <!DOCTYPE html>
<head>
</head>
<body style="display: flex;align-items: center;justify-content: center;height: 100vh;flex-wrap: wrap;">
    <h1 style="display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8vw;">
    ${mess}
    </h1>
    <p><a href='/${href}'>${LinkText}</a></p
</body>
</html>
`
}
}

module.exports = html;