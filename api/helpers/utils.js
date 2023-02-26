import dotenv from 'dotenv';
dotenv.config();

const USER_AGENT = process.env.APP_USER_AGENT;
const ACCEPT_HEADER = process.env.APP_ACCEPT_HEADER;

const BASE_URL = process.env.APP_SOURCE_BASE_URL;
const ajax_url = process.env.APP_SOURCE_AJAX_URL;
const home_url = process.env.APP_SOURCE_HOME_URL
const search_url = process.env.APP_SOURCE_SEARCH_URL;

const Servers = {
  AsianLoad: 'asianload',
  GogoCDN: 'gogocdn',
  StreamSB: 'streamsb',
  MixDrop: 'mixdrop',
  UpCloud: 'upcloud',
  VidCloud: 'vidcloud',
  StreamTape: 'streamtape',
  VizCloud: 'vizcloud',
  MyCloud: 'mycloud',
  Filemoon: 'filemoon',
  VidStreaming: 'vidstreaming',
};

const animeCategories = [
  'most-favorite', 'most-popular','subbed-anime', 
  'dubbed-anime', 'recently-updated', 'recently-added',
  'top-upcoming', 'top-airing', 'movie', 'special',
  'ova', 'ona', 'tv', 'completed'
];

const animeGenres = [
  'action', 'adventure', 'cars', 'comedy', 'dementia',
  'demons', 'drama', 'ecchi', 'fantasy', 'game', 'harem',
  'historical', 'horror', 'isekai', 'josei', 'kids', 'magic',
  'martial-arts', 'mecha', 'military', 'music', 'mystery',
  'police', 'psychological', 'romance', 'samurai', 'school', 
  'sci-fi', 'seinen', 'shoujo', 'shoujo-ai', 'shounen', 'yaoi',
  'slice-of-life', 'space', 'sports', 'super-power', 'supernatural', 
  'thriller', 'vampire', 'yuri', 'parody', 'shounen-ai'
];


const substringAfter = (str, toFind) => {
  const index = str.indexOf(toFind);
  return index == -1 ? '' : str.substring(index + toFind.length);
};

const substringBefore = (str, toFind) => {
  const index = str.indexOf(toFind);
  return index == -1 ? '' : str.substring(0, index);
};


export { 
  USER_AGENT, ACCEPT_HEADER, 
  BASE_URL, ajax_url, home_url, search_url,
  Servers, animeCategories, animeGenres,
  substringAfter, substringBefore
};
