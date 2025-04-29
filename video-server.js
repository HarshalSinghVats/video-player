const fs = require('fs');
const express = require('express');

const app = express(); 

app.listen(3503, () => {
    console.log("Server started on port 3503.");
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

// Page Routes (Render the EJS page)
app.get('/video1', (req, res) => {
    res.render('video', { videoSource: '/stream/video1' });
});

app.get('/video2', (req, res) => {
    res.render('video', { videoSource: '/stream/video2' });
});

app.get('/video3', (req, res) => {
    res.render('video', { videoSource: '/stream/video3' });
});

//Streaming Routes (hyperlink functionality...)
app.get('/stream/video1', (req, res) => {
    const videoPath = './video-trial.mp4';
    streamVideo(req, res, videoPath);
});

app.get('/stream/video2', (req, res) => {
    const videoPath = './timeless-montage.mp4';
    streamVideo(req, res, videoPath);
});

app.get('/stream/video3', (req, res) => {
    const videoPath = './bunny_video.mp4';
    streamVideo(req, res, videoPath);
});


// Shared streaming logic
function streamVideo(req, res, videoPath) {
    const fileSize = fs.statSync(videoPath).size;
    const range = req.headers.range;
    console.log(range);

    if (range) {
        const values = range.replace(/bytes=/, '').split('-');
        const start = parseInt(values[0], 10);
        let end = values[1] ? parseInt(values[1], 10) : fileSize - 1;
        const CHUNK_SIZE = 512 * 1024; // 512 KB per chunk
        end = Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
        const chunkSize = (end - start) + 1;

        //const chunkSize = 10 ** 6

        const videoReader = fs.createReadStream(videoPath, { start, end });
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
            'Cache-Control': 'public, max-age=3600'
        };

        res.writeHead(206, headers);
        videoReader.pipe(res);
    } else {
        const headers = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, headers);
        fs.createReadStream(videoPath).pipe(res);
    }
}