import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { simpleLightbox } from './js.js/simpleLightbox';

import { fetchApi } from './js.js/fetchApi';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
const guard = document.querySelector('.js-guard');
const checkbox = document.querySelector('.js-checkbox');

let pages = 1;
let page = 1;
let perPage = 40;
let inputForm = '';
let infiniteScroll;

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onInfiniteScroll, options);

searchForm.addEventListener('submit', onSearchForm);
btnLoadMore.addEventListener('click', onLoadMarkupGallery);
checkbox.addEventListener('change', setInfiniteScroll);

async function onSearchForm(evt) {
  evt.preventDefault();
  const newInputForm = evt.currentTarget.searchQuery.value.trim();

  if (inputForm !== newInputForm) {
    inputForm = newInputForm;
    pages = 1;
    onCleanGallery();
    observer.unobserve(guard);
  }
  if (inputForm && pages >= page) {
    infiniteScroll ? observer.observe(guard) : await onLoadMarkupGallery();

    simpleLightbox.refresh();
  }
}

function onCleanGallery() {
  gallery.innerHTML = '';
  btnLoadMore.classList.add('hidden');
  page = 1;
}

function markupGallery(res) {
  const markup = res.reduce(
    (
      acc,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => {
      return (acc += `<div class="photo-card">
    <a  class="photo__link" href="${largeImageURL}">
  <img  class="photo__img" src="${webformatURL}" alt="${tags}" loading="lazy"  />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`);
    },
    ''
  );

  gallery.insertAdjacentHTML('beforeend', markup);
}

function onMessenge(searchMessenge, page, pages) {
  if (page === 1 && searchMessenge.hits.length) {
    Notify.success(`Hooray! We found ${searchMessenge.totalHits} images.`);
  }
  if (!searchMessenge.total) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (page === pages) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

async function onLoadMarkupGallery() {
  const res = await onGetData();
  btnLoadMore.classList.add('hidden');
  markupGallery(res);
  simpleLightbox.refresh();

  if (pages > page && !infiniteScroll) scroll(gallery);

  if (pages > page && !infiniteScroll) {
    btnLoadMore.classList.remove('hidden');
  }
  page += 1;
}

async function onGetData() {
  try {
    const res = await fetchApi(inputForm, page, perPage);
    pages = Math.ceil(res.data.total / perPage);
    const searchMessenge = res.data;
    onMessenge(searchMessenge, page, pages);
    return searchMessenge.hits;
  } catch (error) {
    console.log(error);
  }
}

function onInfiniteScroll(entries, observer) {
  entries.forEach(async entrie => {
    if (entrie.isIntersecting && inputForm) {
      const res = await onGetData();
      markupGallery(res);
      simpleLightbox.refresh();
      page += 1;
      if (pages < page) {
        observer.unobserve(guard);
      }
    }
  });
}

function setInfiniteScroll(evt) {
  infiniteScroll = evt.currentTarget.checked;

  !infiniteScroll ? observer.unobserve(guard) : observer.observe(guard);
  if (pages > 1 && infiniteScroll) btnLoadMore.classList.add('hidden');
}
