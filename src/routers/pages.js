import Router from "express";

import auth from '../middlewares/auth.js';
import { User } from '../models/User.js';


const router = new Router();

router.get("/", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./index",
            stylesheets: ['index', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['index'],
            title: "Soundupe",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/auth", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./auth",
            stylesheets: ['auth', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['index'],
            title: "Авторизація",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/artist/:id", auth, async (req, res) => {
    try {
        const id = req.params.id;

        res.render("main", {
            main: "./artist",
            stylesheets: ['artist', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['artist'],
            title: "Soundupe",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/mp3/id", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./mp3",
            stylesheets: ['mp3', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['index'],
            title: "Новинки",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})


router.get("/new", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./new",
            stylesheets: ['new', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['index'],
            title: "Новинки",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/popular", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./popular",
            stylesheets: ['popular', 'header', 'footer', 'sidebar', 'song', 'comment'],
            scripts: ['index'],
            title: "Новинки",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/artists", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./artists",
            stylesheets: ['artists', 'header', 'footer', 'sidebar', 'comment'],
            scripts: ['index'],
            title: "Виконавці",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})

router.get("/genres", auth, async (req, res) => {
    try {
        res.render("main", {
            main: "./genre",
            stylesheets: ['genre', 'header', 'footer', 'sidebar', 'comment'],
            scripts: ['index'],
            title: "Жанри",
            user: req.user,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json(err);
    }
})


export default router;