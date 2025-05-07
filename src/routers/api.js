import Router from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import auth from '../middlewares/auth.js';
import { User } from '../models/User.js';
import Song from '../models/Song.js';
import { uploadSongMiddleware } from "../middlewares/uploadMiddleware.js";
import Play from "../models/Play.js";
import ArtistRating from "../models/ArtistRating.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Router();


router.post("/upload", auth, uploadSongMiddleware)

router.put("/listened/:id", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');

        await Song.findByIdAndUpdate(req.params.id, { $inc: { auditioning: 1 } });

        const play = new Play({
            user: req.user._id,
            song: req.params.id
        });

        await play.save();

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})

router.put("/rate/:id/:value", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');
        if(req.user._id.toString() === req.params.id) return res.status(400).json({ success: false });

        const rateArtist = new ArtistRating({
            artist: req.params.id,
            rater: req.user._id,
            value: req.params.value
        })

        await rateArtist.save();
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})


export default router;