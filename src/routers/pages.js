import Router from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import auth from '../middlewares/auth.js';
import { User } from '../models/User.js';
import Song from '../models/Song.js';
import { calculateRating, findNew, findPopularArtists, findPopularMusic, findTrends, findUserMusic } from "../servise.js";
import mongoose from 'mongoose';
import ArtistRating from "../models/ArtistRating.js";
const ObjectId = mongoose.Types.ObjectId;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = new Router();

router.get('/', auth, async (req, res) => {
    console.log('index');
    
    try {
        const music = await findTrends(req.user);
        const artists = await findPopularArtists();

        res.render("index", {
            user: req.user,
            artists,
            music
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/auth", auth, async (req, res) => {
    console.log('auth');

    try {
        res.render("auth", {
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get('/profile', auth, async (req, res) => {
    console.log('profile');
    
    try {
        if(!req.user) return res.status(404).render("404");

        const music = await findUserMusic(req.user, req.user._id, 'createdAt');

        res.render("profile", {
            user: req.user,
            music
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get('/upload-song', auth, async (req, res) => {
    console.log('upload-song');
    
    try {
        res.render("upload-song", {
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/artist/:id", auth, async (req, res) => {
    console.log('artist');
    
    try {
        const id = req.params.id;
        const sort = req.query.sort || 'likes';

        console.log(sort);
        

        const ratings = await ArtistRating.find({ artist: id });
        const rating = calculateRating(ratings);
        const rated = await ArtistRating.findOne({ rater: req.user._id }) ? true : false;

        const artist = await User.findById(id, '-password');

        const music = await findUserMusic(req.user, req.user._id, sort);

        const musicAll = await Song.find({ user: id });
        const musicCount = musicAll.length;


        res.render("artist", {
            user: req.user,
            artist,
            music,
            musicCount,
            sort,
            rating,
            rated
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/mp3/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        const song = await Song.findById(id).populate('user', 'login');

        const music = await findUserMusic(req.user, song.user._id, 'likes', 5);

        console.log(music);
        


        res.render("mp3", {
            user: req.user,
            song,
            music
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})


router.get("/new", auth, async (req, res) => {
    console.log('new');
    
    try {
        const music = await findNew(req.user);

        res.render("new", {
            user: req.user,
            music
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/popular", auth, async (req, res) => {
    console.log('popular');
    
    try {
        const sort = req.query.sort || 'trends';
        
        const music = await findPopularMusic(req.user, sort);

        res.render("popular", {
            user: req.user,
            music,
            sort
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/artists", auth, async (req, res) => {
    try {
        const artists = await findPopularArtists();

        res.render("artists", {
            user: req.user,
            artists
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/genres", auth, async (req, res) => {
    try {
        res.render("genres", {
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/genres/:genre", auth, async (req, res) => {
    try {
        const genre = req.params.genre;

        res.render("genres", {
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})


router.use(auth, (req, res) => {
    console.log('api router: not found');

    res.status(404).render("404")
});


export default router;