import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

import { User } from './models/User.js';
import Song from './models/Song.js';
import ArtistRating from "./models/ArtistRating.js";
import { calculateRating, findUserMusic } from './service.js';
const ObjectId = mongoose.Types.ObjectId;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const renderProfile = async (req, res) => {
    try {
        if(!req.user) return res.status(404).render("404");

        const subpage = req.params.page;
        const limit = 20;
        const offset = subpage ? calculateOffset(subpage, limit) : 0;

        const music = await findUserMusic(req.user, req.user._id, 'createdAt', offset, limit);

        res.render("profile", {
            user: req.user,
            music,
            isProfilePage: true
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
}

export const renderArtist = async (req, res) => {
    try {
        const id = req.params.id;
        const subpage = req.params.page;
        const limit = 20;
        const offset = subpage ? calculateOffset(subpage, limit) : 0;
        const sort = req.query.sort || 'likes';

        const ratings = await ArtistRating.find({ artist: id });
        const rating = calculateRating(ratings);
        const rated = req.user._id.toString() === id.toString() ? true : (await ArtistRating.findOne({ artist: id, rater: req.user._id }) ? true : false);

        const artist = await User.findById(id, '-password');

        const music = await findUserMusic(req.user, id, sort, offset, limit);

        const musicAll = await Song.find({ user: id });
        const musicCount = musicAll.length;


        res.render("artist", {
            user: req.user,
            artist,
            music,
            isProfilePage: false,
            musicCount,
            sort,
            rating,
            rated
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
}


function calculateOffset(value, limit) {
    return ((Math.max(0, parseInt(value) - 1)) * limit);
}