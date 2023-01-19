import axios from 'axios';

const BASEURL = 'https://pixabay.com/api/';
const apiKey = '32552972-dc07813a8434780c4e0dd03fe';
const params = new URLSearchParams({
  key: apiKey,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
});

export async function fetchApi(search, page = 1, perPage = 10) {
  return await axios.get(
    `${BASEURL}?q=${search}&page=${page}&per_page=${perPage}`,
    {
      params,
    }
  );
}
