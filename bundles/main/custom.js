'use strict';

const renderPhotos = require('../../blocks/photos/photos.hbs');
const buttonMore = require('../../blocks/buttonMore/buttonMore.hbs');
const renderPSPW = require('../../blocks/pspw/pspw.hbs');
let query = '';
let chosenTags = [];
let tagsCount = 1;

$(function () {

    initPage();

    // Запрещаем писать в input
    document.querySelector('#custom-tags-count').addEventListener('keypress', function (e) {
        e.preventDefault();
    });

    // Поиск по хештегам
    let tagNode = document.querySelectorAll('.search-tag');
    let tags = [].slice.call(tagNode);
    tags.forEach(function (tag) {
        tag.addEventListener('click', searchTagClickHandler);
    });

    let searchBtn = document.querySelector('#search-by-tags');
    searchBtn.addEventListener('click', searchButtonClickHandler);
});

function initPage () {
    query = '';
    addMorePhotoClickHandler();
    addShowAllClickHandler();

    let data = {
        query,
        lastId: -1
    };
    $.ajax({
        url: '/photos',
        method: 'GET',
        dataType: 'json',
        data: data
    }).done(function (res) {
        changeImagesContent('append', res);
    }).fail(function (err) {
        console.log(err);
    });
}

function addShowAllClickHandler () {
    let btn = document.querySelector('#show-all');
    btn.addEventListener('click', function () {
        query = '';
        chosenTags = [];
        let data = {
            query,
            lastId: -1
        };
        $.ajax({
            url: '/photos',
            method: 'GET',
            dataType: 'json',
            data: data
        }).done(function (res) {
            changeImagesContent('insert', res);
        }).fail(function (err) {
            console.log(err);
        });
    })
}

function addMorePhotoClickHandler () {
    let btn = document.querySelector('#more');
    if (!btn) {
        return;
    }
    btn.addEventListener('click', function (e) {
        let lastId = document.querySelector('.photos').lastElementChild.dataset.id;
        let data = {
            query,
            lastId,
            tagsCount,
            tags: chosenTags
        };
        $.ajax({
            url: '/photos',
            method: 'GET',
            dataType: 'json',
            data: data
        }).done(function (res) {
            changeImagesContent('append', res);
        }).fail(function (err) {
            console.log(err);
        });
    });
}

function searchButtonClickHandler () {
    let chosenTagNodes = document.querySelectorAll('.chosen-tag');
    chosenTags = [].slice.call(chosenTagNodes).map(function (tag) {
        return tag.textContent;
    });
    let searchOption;
    let options = document.querySelectorAll('.search-options__input');
    for (let i = 0; i < options.length; i++) {
        if (options[i].checked === true) {
            searchOption = options[i].id;
        }
    }

    query = searchOption || '';
    let data = {
        tags: chosenTags,
        lastId: -1,
        query
    };
    if (searchOption === 'custom-tags') {
        tagsCount = parseInt(document.querySelector('#custom-tags-count').value);
        data.tagsCount = tagsCount;
    }
    if (chosenTags.length > 0) {
        $.ajax({
            url: '/photos',
            method: 'GET',
            dataType: 'json',
            data: data
        }).done(function (res) {
            changeImagesContent('insert', res);
        }).fail(function (err) {
            console.log(err);
        })
    }
}

function searchTagClickHandler (e) {
    let tag = e.target;
    if (tag.classList.contains('chosen-tag')) {
        tag.classList.remove('chosen-tag');
    } else {
        tag.classList.add('chosen-tag');
    }
    handleButtonSearch();
}

function handleButtonSearch () {
    let chosenTagNodes = document.querySelectorAll('.chosen-tag');
    let chosenTags = [].slice.call(chosenTagNodes);
    let searchBtn = document.querySelector('#search-by-tags');
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
    let imageNodes = document.querySelectorAll('.card-image img');
    let images = [].slice.call(imageNodes);

    let pswpElement = document.querySelectorAll('.pswp')[0];

    // build items array
    let items = images.map(function (img) {
        return {
            src: img.src,
            w: 800,
            h: 600
        }
    });

    // define options (if needed)
    let options = {
        // history & focus options are disabled on CodePen
        history: false,
        focus: false,

        showAnimationDuration: 0,
        hideAnimationDuration: 0

    };

    let gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

    gallery.init();
    gallery.goTo(images.indexOf(target));
}

function addImageClickHandler () {
    $('.pspw-container').html($.parseHTML(renderPSPW()));
    let imageNodes = document.querySelectorAll('.card-image img');
    let images = [].slice.call(imageNodes);

    images.forEach(function (img) {
        // Убираем старый обработчик
        let new_img = img.cloneNode(true);
        img.parentNode.replaceChild(new_img, img);

        new_img.addEventListener('click', function(e) {
            openPhotoSwipe(e.target);
        });
    });
}

function changeImagesContent (method, data) {
    if (method === 'append') {
        $('.photos').append($.parseHTML(renderPhotos(data)));
    }
    if (method === 'insert') {
        $('.photos').html($.parseHTML(renderPhotos(data)));
    }
    let btnMore = document.querySelector('#more');
    if (data.hasMore) {
        btnMore.classList.remove('invisible');
        btnMore.classList.add('visible-inline');
    } else {
        btnMore.classList.add('invisible');
        btnMore.classList.remove('visible-inline');
    }

    addImageClickHandler();
}