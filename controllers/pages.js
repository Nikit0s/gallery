'use strict';

//Генерим фотки с тегами
let photos= [];
let tags = ['#deeznuts', '#goteem', '#hah', '#fun'];
for (let i = 0; i < 10; i++) {
    let count = Math.floor(Math.random() * 4) + 1;
    let idx = Math.floor(Math.random() * 3);
    let curTags = [];
    for (let j = 0; j < count; j++) {
        curTags.push(tags[(idx + j) % 4]);
    }
    photos.push({
        url: 'http://placehold.it/80' + i.toString() + 'x600',
        tags: curTags,
        photoId: i
    });
}


exports.index = (req, res) => {
    const data = {
        photos,
        tags
    };

    res.render('main/main', Object.assign(data, req.commonData));
};

exports.getPhotos = (req, res) => {
    var searchTags = req.query.tags;
    var result = [];
    var hasMore = false;
    var idx = parseInt(req.query.lastId);

    if (req.query.query === '') {
        result = photos.slice(idx + 1, idx + 6);
        if (photos.length - 1 > idx + 6) {
            hasMore = true;
        }
    }

    if (req.query.query === 'any-tag') {
        var temp = [];
        photos.forEach(function (photo) {
            for (var i = 0; i < searchTags.length; i++) {
                if (photo.tags.indexOf(searchTags[i]) >= 0) {
                    temp.push(photo);
                    break;
                }
            }
        });

        temp.forEach(function(photo) {
            if (photo.photoId > idx) {
                result.push(photo);
            }
        });
        if (result.length > 5) {
            hasMore = true;
            result = result.slice(0, 5);
        }
    }

    if (req.query.query === 'all-tags') {
        var temp = [];
        temp = photos.filter(function (photo) {
            return photo.tags.sort().toString() == searchTags.sort().toString();
        });

        temp.forEach(function(photo) {
            if (photo.photoId > idx) {
                result.push(photo);
            }
        });
        if (result.length > 5) {
            hasMore = true;
            result = result.slice(0, 5);
        }
    }
    var data = {
        photos: result,
        hasMore
    };
    res.send(data);
};

exports.error404 = (req, res) => res.sendStatus(404);
