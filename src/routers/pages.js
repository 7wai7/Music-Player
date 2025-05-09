import Router from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

import auth from '../middlewares/auth.js';
import Song from '../models/Song.js';
import { findNew, findPopularArtists, findPopularMusic, findTrends, findUserMusic } from "../service.js";
import { renderProfile, renderArtist } from "../controller.js";
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
            music,
            isProfilePage: false,
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

router.get('/profile', auth, renderProfile);
router.get('/profile/:page', auth, renderProfile);

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

router.get("/artist/:id", auth, renderArtist);
router.get("/artist/:id/:page", auth, renderArtist);

router.get("/mp3/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        const song = await Song.findById(id).populate('user');

        const music = await findUserMusic(req.user, song.user._id, 'likes', 0, 5);


        res.render("mp3", {
            user: req.user,
            song,
            music,
            isProfilePage: false,
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
            music,
            isProfilePage: false,
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
            isProfilePage: false,
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
            isProfilePage: false,
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