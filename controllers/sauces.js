const Sauce = require("../models/Sauce");
const fs = require('fs');

exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then(Sauces => res.status(200).json(Sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.getSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.addSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        name: sauceObject.name,
        manufacturer: sauceObject.manufacturer,
        description: sauceObject.description,
        mainPepper: sauceObject.mainPepper,
        heat: sauceObject.heat,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        userId: req.auth.userId
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Post saved successfully!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.updateSauce = (req, res) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            if (sauce.userId === req.auth.userId) {

                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => { });
                }

                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(400).json({ error }))

            } else {
                res.status(403).json({ error: new Error("unauthorized request") });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.removeSauce = (req, res) => {

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.rateSauces = (req, res) => {

    const like = req.body.like;
    const userId = req.body.userId;

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            if ((like === 1 && sauce.usersLiked.includes(req.body.userId)) ||
                (like === -1 && sauce.usersDisliked.includes(req.body.userId))
            ) {
                res.status(400).json({ error: new Error() });
                return;
            }

            if (like === 1) {
                sauce.likes = sauce.likes + 1;
                sauce.usersLiked.push(userId);
            } else if (like === -1) {
                sauce.dislikes = sauce.dislikes + 1;
                sauce.usersDisliked.push(userId);
            } else if (like === 0) {
                if (sauce.usersLiked.includes(userId)) {
                    sauce.likes = sauce.likes - 1;
                    sauce.usersLiked = sauce.usersLiked.filter(data => data != userId);
                } else if (sauce.usersDisliked.includes(userId)) {
                    sauce.dislikes = sauce.dislikes - 1;
                    sauce.usersDisliked = sauce.usersDisliked.filter(data => data != userId);
                }
            }

            sauce.save()
                .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                .catch(error => res.status(400).json({ error }))
        }
        );
};