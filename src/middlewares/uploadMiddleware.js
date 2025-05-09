import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffprobe from 'ffprobe-static';
import Song from '../models/Song.js';
import Play from '../models/Play.js';

ffmpeg.setFfprobePath(ffprobe.path);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSongMiddleware = [
    upload.single('audio'),

    async (req, res) => {
        try {
            if (!req.user) return res.status(401).json('Not registered');

            const song = new Song({
                user: req.user._id,
                title: req.body.title,
                lyrics: req.body.lyrics || '',
                createDate: req.body.createDate || new Date(),
                genre: req.body.genre || '',
            });

            const uploadDir = path.resolve('data/uploads/songs');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = req.file.originalname.split('.').pop();
            /* const ext = fileExt === 'mpeg' ? 'mp3' : fileExt; */

            const filename = `${song._id}.${ext}`;
            const filepath = path.join(uploadDir, filename);

            console.log(filepath)

            fs.writeFileSync(filepath, req.file.buffer);

            // Отримуємо розмір і тривалість
            const fileSize = req.file.size;
            const duration = await getAudioDuration(filepath);

            song.size = fileSize;
            song.duration = duration;
            await song.save();

            const play = new Play({
                user: req.user._id,
                song: song._id
            });
    
            await play.save();

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Upload failed' });
        }
    }
];

// Отримання тривалості файлу через ffprobe
function getAudioDuration(filepath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filepath, (err, metadata) => {
            if (err) return reject(err);
            resolve(Math.round(metadata.format.duration));
        });
    });
}
