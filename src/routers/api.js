import Router from "express";
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";

import auth from '../middlewares/auth.js';
import { User } from '../models/User.js';
import Song from '../models/Song.js';
import { uploadSongMiddleware } from "../middlewares/uploadMiddleware.js";
import Play from "../models/Play.js";
import ArtistRating from "../models/ArtistRating.js";
import Reaction from "../models/Reaction.js";
import { changeSongLyrics, changeSongTitle, deleteSong } from "../service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ObjectId = mongoose.Types.ObjectId;
const router = new Router();


router.get("/mp3/download/:id", async (req, res) => {
    try {
        console.log('download');
        
        const id = req.params.id;

        const filePath = `data/uploads/songs/${id}.mpeg`;
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        const head = {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})

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

router.put("/reaction/:id/:value", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');

        const userId = req.user._id;
        const id = req.params;
        const reaction = Boolean(parseInt(req.params.value));

        let filter = { user: userId, song: new ObjectId(id) };

        const existingReaction = await Reaction.findOne(filter);

        if (existingReaction) {
            if (existingReaction.reaction === reaction) {
                await Reaction.findByIdAndDelete(existingReaction._id);
            } else {
                existingReaction.reaction = reaction;
                await existingReaction.save();
            }
        } else {
            const newReaction = new Reaction({
                user: userId,
                song: id,
                reaction,
            });
            await newReaction.save();
        }

        const reactions = await Reaction.find({ song: new ObjectId(id) });
        const reactionCounts = { likes: 0, dislikes: 0 };

        reactions.forEach(reaction => {
            if (reaction.reaction) {
                reactionCounts.likes++;
            } else {
                reactionCounts.dislikes++;
            }
        });
        res.json({ success: true, reactionCounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
})

router.put("/song/:id/title", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');

        const result = await changeSongTitle(req.user, req.params.id, req.body.title);

        if(!result.success) {
           return res.status(400).json(result.message);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})

router.put("/song/:id/lyrics", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');

        const result = await changeSongLyrics(req.user, req.params.id, req.body.lyrics);

        if(!result.success) {
           return res.status(400).json(result.message);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})

router.delete("/song/:id", auth, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json('Not registered');

        const result = await deleteSong(req.user, req.params.id);

        if(!result.success) {
           return res.status(400).json(result.message);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
})


export default router;