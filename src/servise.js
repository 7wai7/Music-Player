import mongoose from 'mongoose';

import Play from "./models/Play.js";
import Song from "./models/Song.js";

const ObjectId = mongoose.Types.ObjectId;


export const findUserMusic = async (id, sort) => {
    const music = await Song.aggregate([
        {
            $match: { user: new ObjectId(id) }
        },
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
                foreignField: "video",
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
                }
            }
        },
        { $sort: { [sort]: -1 } },
        { $limit: 20 }
    ]);

    console.log(music);
    

    return music;
}

export const findTrends = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = await Play.aggregate([
        {
            $match: { createdAt: { $gte: sevenDaysAgo } }
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
                foreignField: "video",
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
                }
            }
        },
    ])

    return stats;
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



export const calculateRating = ratings => {
    let rating = 0;
    for (let i = 0; i < ratings.length; i++) {
        const rate = ratings[i];
        rating += rate.value;
    }
    if(rating > 0) rating /= ratings.length;

    return rating;
} 