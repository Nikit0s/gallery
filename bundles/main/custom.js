const renderPhotos = require('../../blocks/photos/photos.hbs');
const buttonMore = require('../../blocks/buttonMore/buttonMore.hbs');
const renderPSPW = require('../../blocks/pspw/pspw.hbs');
let query = '';
let chosenTags = [];

function initPage () {
    query = '';
    addMorePhotoClickHandler();

    var data = {
        query,
        lastId: -1
    };
    $.ajax({
        url: '/photos',
        method: 'GET',
        dataType: 'json',
        data: data
    }).done(function (res) {
        $('.photos').append($.parseHTML(renderPhotos(res)));
        var btnMore = document.querySelector('#more');
        if (res.hasMore) {
            btnMore.classList.remove('invisible');
            btnMore.classList.add('visible-inline');
        } else {
            btnMore.classList.add('invisible');
            btnMore.classList.remove('visible-inline');
        }

        addImageClickHandler();

    }).fail(function (err) {
        console.log(err);
    });
}

function addMorePhotoClickHandler () {
    var btn = document.querySelector('#more');
    if (!btn) {
        return;
    }
    btn.addEventListener('click', function (e) {
        var lastId = document.querySelector('.photos').lastElementChild.dataset.id;
        var data = {
            query,
            lastId,
            tags: chosenTags
        };
        $.ajax({
            url: '/photos',
            method: 'GET',
            dataType: 'json',
            data: data
        }).done(function (res) {
            $('.photos').append($.parseHTML(renderPhotos(res)));
            addImageClickHandler();

            var btnMore = document.querySelector('#more');
            if (res.hasMore) {
                btnMore.classList.remove('invisible');
                btnMore.classList.add('visible-inline');
            } else {
                btnMore.classList.add('invisible');
                btnMore.classList.remove('visible-inline');
            }
        }).fail(function (err) {
            console.log(err);
        });
    });
}

$(function () {

    initPage();

    // Поиск по хештегам
    var tagNode = document.querySelectorAll('.search-tag');
    var tags = [].slice.call(tagNode);
    tags.forEach(function (tag) {
        tag.addEventListener('click', searchTagClickHandler);
    });

    var searchBtn = document.querySelector('.search-button');
    searchBtn.addEventListener('click', function (e) {
        var chosenTagNodes = document.querySelectorAll('.chosen-tag');
        chosenTags = [].slice.call(chosenTagNodes).map(function (tag) {
            return tag.textContent;
        });
        var searchOption;
        var options = document.querySelectorAll('.search-options__input');
        for (var i = 0; i < options.length; i++) {
            if (options[i].checked === true) {
                searchOption = options[i].id;
            }
        }

        query = searchOption || '';
        var data = {
            tags: chosenTags,
            lastId: -1,
            query
        };
        if (chosenTags.length > 0) {
            $.ajax({
                url: '/photos',
                method: 'GET',
                dataType: 'json',
                data: data
            }).done(function (res) {
                $('.photos').html($.parseHTML(renderPhotos(res)));
                addImageClickHandler();

                var btnMore = document.querySelector('#more');
                if (res.hasMore) {
                    btnMore.classList.remove('invisible');
                    btnMore.classList.add('visible-inline');
                } else {
                    btnMore.classList.add('invisible');
                    btnMore.classList.remove('visible-inline');
                }
            }).fail(function (err) {
                console.log(err);
            })
        }
    });

});

function searchTagClickHandler (e) {
    var tag = e.target;
    if (tag.classList.contains('chosen-tag')) {
        tag.classList.remove('chosen-tag');
    } else {
        tag.classList.add('chosen-tag');
    }
    handleButtonSearch();
}

function handleButtonSearch () {
    var chosenTagNodes = document.querySelectorAll('.chosen-tag');
    var chosenTags = [].slice.call(chosenTagNodes);
    var searchBtn = document.querySelector('.search-button');
    if (chosenTags.length > 0) {
        if (!searchBtn.classList.contains('visible-block')) {
            searchBtn.classList.remove('invisible');
            searchBtn.classList.add('visible-block');
        }
    } else {
        if (!searchBtn.classList.contains('invisible')) {
            searchBtn.classList.remove('visible-block');
            searchBtn.classList.add('invisible');
        }
    }
}

function openPhotoSwipe (target) {
    var imageNodes = document.querySelectorAll('.card-image img');
    var images = [].slice.call(imageNodes);

    var pswpElement = document.querySelectorAll('.pswp')[0];

    // build items array
    var items = images.map(function (img) {
        return {
            src: img.src,
            w: 800,
            h: 600
        }
    });

    // define options (if needed)
    var options = {
        // history & focus options are disabled on CodePen
        history: false,
        focus: false,

        showAnimationDuration: 0,
        hideAnimationDuration: 0

    };

    var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

    gallery.init();
    gallery.goTo(images.indexOf(target));
}



function addImageClickHandler () {
    $('.pspw-container').html($.parseHTML(renderPSPW()));
    var imageNodes = document.querySelectorAll('.card-image img');
    var images = [].slice.call(imageNodes);

    images.forEach(function (img) {
        // Убираем старый обработчик
        var new_img = img.cloneNode(true);
        img.parentNode.replaceChild(new_img, img);

        new_img.addEventListener('click', function(e) {
            openPhotoSwipe(e.target);
        });
    });
}