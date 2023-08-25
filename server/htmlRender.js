const html = {
Render: (mess, href, LinkText) => {
    return `
    <!DOCTYPE html>
<head>
</head>
<body style="display: flex;align-items: center;justify-content: center;height: 100vh;flex-wrap: wrap;background: black;overflow-x: hidden">
    <h1 style="display: flex;
    align-items: center;
    width: 100%;
    color: white;
    justify-content: center;
    font-size: 8vw;">
    ${mess}
    </h1>
    <p><a style='color: white;font-size: 3vw ' href='/${href}'>${LinkText}</a></p
</body>
</html>
`
},
imageJSX: (image, alt_text) => {
    return(`
    <!DOCTYPE html>
<head>
</head>
<body style="display: flex;align-items: center;justify-content: center;height: 100vh;flex-wrap: wrap;">
   <img src="/uploads/${image}" alt="${alt_text}"/>
</body>
</html>
    `)
}
}

module.exports = html;