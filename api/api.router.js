import { Router } from 'express';
import axios from 'axios';
import fs from 'fs';

import apiController from './api.controller.js';
import { USER_AGENT } from './helpers/utils.js';

const router = Router();


router.get('/', (req, res) => res.send('Welcome to api home rote'));


router.get('/s', async (req, res) => {
  // const vid_url = 'https://storage.googleapis.com/axxu-ppjxq-1651506793.appspot.com/8GLVM3JKPLDN/st25_5_deep-insanity-the-lost-child-episode-9-HD.mp4';
  const vid_url = 'https://wwwx16.gofcdn.com/videos/hls/AQE_k3mcYrcHv8wxWwSAyg/1674681414/25615/027e9529af2b06fe7b4f47e507a787eb/ep.220.1662455466.m3u8';
  
  try {
    const response = await axios.get(vid_url, {
      responseType: 'stream',
      headers: { 
        'User-Agent': USER_AGENT,
        'Referer': 'https://gogohd.net/streaming.php?id=MjUzMTc=&title=Naruto+Episode+75&typesub=SUB'
      }
    });

    // console.log(response.config.headers);

    // const stream = fs.createWriteStream('sample_anime.m3u8');
    response.data.pipe(fs.createWriteStream('sample_anime.ts'));

    // stream.on('close', () => console.log('done'));
    // stream.on('error', e => console.log(e));
    // res.set({ 'Content-Type': 'video/mp4' });
    
    res.set({ 'Content-Type': 'video/mp2t' });
    response.data.pipe(res);
    // res.send('bruh');

  } catch (error) {
    console.log(error);
  }
})


router.get('/home', apiController.getHomePage);

router.get('/search', apiController.getAnimeSearchResult);

router.get('/quick-search', apiController.getAnimeQuickSearch);

router.get('/info', apiController.getAnimeAboutInfo);

router.get('/episodes', apiController.getAnimeEpisodes);

router.get('/genre', apiController.getGenreAnime);

router.get('/info-room', apiController.getRoomAnimeInfo);

router.get('/servers', apiController.getEpisodeServers);

router.get('/watch-episode', apiController.getEpisodeSources);

router.get('/explore/:category', apiController.getAnimeExploreCategory);

router.get('/:category', apiController.getAnimeCategory);



export default router;
