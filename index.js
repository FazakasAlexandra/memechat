const express = require('express');
const app = express();
const path = require('path');
const jimp = require('jimp')
const fs = require('fs')
const multer = require('multer')
app.use(express.json({ limit: '10mb' }))

const users = [] // { { name: "ale", meme : "ale.jpg" } }

app.get('/memechat', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/memechat/chatroom', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/chatroom.html'))
})

app.get('/memechat/memes/:username', (req, res) => {
    res.sendFile(path.join(__dirname, `/public/assets/${req.params.username}.jpg`));
})

app.post('/memechat/memes', async (req, res) => {
    const { base64Data, text, username } = req.body

    const buffer = Buffer.from(base64Data, 'base64');

    jimp.loadFont(jimp.FONT_SANS_16_WHITE).then(font => {
        jimp.read(buffer, (err, img) => {

            img.print(font, 10, 10, text, 350)

            img.getBufferAsync(jimp.MIME_JPEG).then((buffer) => {
                fs.writeFile(path.join(__dirname, `/public/assets/${username}.jpg`), buffer, () => {

                    const user = findUser(username)

                    if (!user.meme) user.meme = `${username}.jpg`

                    res.status(201).json({ message: "user's meme successfully added" })
                })
            })
        })
    })
})

app.post('/memechat/users', (req, res) => {
    const { name } = req.body

    if (findUser(name)) return res.status(400).json({ error: "username already in use" })

    users.push({ name, meme: null })

    res.status(201).json({ message: "user successfully added" })
})

app.get('/memechat/users', (req, res) => {
    res.status(200).json(users)
})

function findUser(name) {
    return users.find(user => user.name === name)
}

app.listen(3001)