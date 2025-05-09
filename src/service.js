import mongoose from 'mongoose';

import Play from "./models/Play.js";
import Song from "./models/Song.js";

const ObjectId = mongoose.Types.ObjectId;


export const findUserMusic = async (user, id, sort, offset = 0, limit = 20) => {
    const music = await Song.aggregate([
        {
            $match: { user: new ObjectId(id) }
        },
        ...enrichSongAggregation(user?._id),
        { $sort: { [sort]: -1 } },
        { $skip: offset },
        { $limit: limit }
    ]);

    return music;
}


export const findPopularMusic = async (user, sort) => {
    switch (sort) {
        case 'likes':
            return await findMusicByLikes(user);

        case '2025':
        case '2024':
        case '2023':
        case '2022':
        case '2021':
        case '2020':
        case '2010':
        case '2000':
            return await findMusicByYear(user, sort);

        case '2010-2019':
        case '2000-2009':
        case '1990-1999':
        case '1980-1989':
            return await findEarlierMusic(user, 1980);

        case 'earlier':
            return await findMusicByYearPeriod(user, sort);

        default:
            return await findTrends(user);

    }
}


export const findEarlierMusic = async (user, value) => {
    const music = await Song.aggregate([
        {
            $addFields: {
                year: { $year: "$createDate" }
            }
        },
        {
            $match: {
                $expr: {
                    $lt: ["$year", value]
                }
            }
        },
        ...enrichSongAggregation(user?._id),
        { $sort: { createDate: -1 } },
        { $limit: 20 }
    ])

    return music;
}

export const findMusicByYearPeriod = async (user, years) => {
    const yearsArr = years.split('-');
    const firstYear = parseInt(yearsArr[0], 10);
    const lastYear = parseInt(yearsArr[1], 10);

    const music = await Song.aggregate([
        {
            $addFields: {
                year: { $year: "$createDate" }
            }
        },
        {
            $match: {
                $expr: {
                    $and: [
                        { $gte: ["$year", firstYear] },
                        { $lt: ["$year", lastYear] }
                    ]
                }
            }
        },
        ...enrichSongAggregation(user?._id),
        { $sort: { createDate: -1 } },
        { $limit: 20 }
    ])

    return music;
}

export const findMusicByYear = async (user, year) => {
    const music = await Song.aggregate([
        {
            $addFields: {
                year: { $year: "$createDate" }
            }
        },
        {
            $match: {
                year: parseInt(year, 10)
            }
        },
        ...enrichSongAggregation(user?._id),
        { $sort: { createDate: -1 } },
        { $limit: 20 }
    ])

    return music;
}


export const findMusicByLikes = async (user) => {
    const music = await Song.aggregate([
        ...enrichSongAggregation(user?._id),
        { $sort: { likes: -1 } },
        { $limit: 20 }
    ])

    return music;
}

export const findTrends = async (user) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Play.aggregate([
        {
            $match: { createdAt: { $gte: sevenDaysAgo } } // тренди розраховуються за тим, коли була прослухана пісня
        },
        {
            $group: {
                _id: '$song',
                plays: { $sum: 1 }
            }
        },
        {
            $sort: { plays: -1 }
        },
        {
            $limit: 20
        },
        {
            $lookup: {
                from: 'songs',
                localField: '_id',
                foreignField: '_id',
                as: 'song'
            }
        },
        {
            $unwind: '$song'
        },
        {
            $replaceRoot: { newRoot: '$song' }
        },
        ...enrichSongAggregation(user?._id)
    ])

    return stats;
}

export const findNew = async (user) => {
    const music = await Song.aggregate([
        ...enrichSongAggregation(user?._id),
        {
            $sort: { createdAt: -1 }
        },
        {
            $limit: 20
        }
    ])

    return music;
}

export const findPopularArtists = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const authorStats = await Play.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $lookup: {
                from: "songs",
                localField: "song",
                foreignField: "_id",
                as: "songData"
            }
        },
        { $unwind: "$songData" },
        {
            $group: {
                _id: "$songData.user", // групуємо по автору пісні
                totalPlays: { $sum: 1 }, // рахуємо загальну кількість прослуховувань
                uniqueListeners: { $addToSet: "$user" } // список унікальних користувачів
            }
        },
        {
            $project: {
                totalPlays: 1,
                uniqueListenersCount: { $size: "$uniqueListeners" }, // рахуємо скільки було унікальних слухачів
                authorScore: {
                    $add: [
                        "$totalPlays", // додаємо кількість прослуховувань
                        { $multiply: ["$uniqueListenersCount", 2] } // плюс подвоєну кількість унікальних слухачів
                    ]
                }
            }
        },
        { $sort: { authorScore: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: '$user'
        },
        {
            $replaceRoot: { newRoot: '$user' }
        }
    ]);

    return authorStats;
}


export const changeSongTitle = async (user, id, title) => {
    const song = await Song.findById(id);

    if(!song) return { success: false, message: 'Song not found.' };
    if(user._id.toString() !== song.user.toString()) return { success: false, message:'No access to delete the song' };

    await Song.findByIdAndUpdate(id, { title });

    return { success: true };
}

export const changeSongLyrics = async (user, id, lyrics) => {
    const song = await Song.findById(id);

    if(!song) return { success: false, message: 'Song not found.' };
    if(user._id.toString() !== song.user.toString()) return { success: false, message:'No access to delete the song' };

    await Song.findByIdAndUpdate(id, { lyrics })

    return { success: true };
}

export const deleteSong = async (user, id) => {
    const song = await Song.findById(id);

    if(!song) return { success: false, message: 'Song not found.' };
    if(user._id.toString() !== song.user.toString()) return { success: false, message:'No access to delete the song' };

    await Play.deleteMany({ song: song._id });

    await song.deleteOne();

    return { success: true };
}


export const calculateRating = ratings => {
    let rating = 0;
    for (let i = 0; i < ratings.length; i++) {
        const rate = ratings[i];
        rating += rate.value;
    }
    if (rating > 0) rating /= ratings.length;

    return rating;
}



function enrichSongAggregation(userId) {
    return [
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $lookup: {
                from: "reactions",
                localField: "_id",
                foreignField: "song",
                as: "reactions"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: {
                        $filter: { input: "$reactions", as: "r", cond: { $eq: ["$$r.reaction", true] } }
                    }
                },
                dislikes: {
                    $size: {
                        $filter: { input: "$reactions", as: "r", cond: { $eq: ["$$r.reaction", false] } }
                    }
                },
                // Додаємо поле "userReaction" (чи лайкнув / дизлайкнув користувач)
                userReaction: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$reactions",
                                as: "r",
                                cond: { $eq: ["$$r.user", new ObjectId(userId)] }
                            }
                        },
                        0
                    ]
                }
            }
        },
        {
            $project: {
                lyrics: 0
            }
        },
    ]
}