import { Router } from 'express';
import { checkAuth } from '../middlewares/checkAuth.js';
import apiController from './api.controller.js';

const router = Router();


router.get('/', (req, res) => res.send('Welcome to api home rote'));


router.get('/home', apiController.getHomePage);

router.get('/search', apiController.getAnimeSearchResult);

router.get('/quick-search', apiController.getAnimeQuickSearch);

router.get('/info', apiController.getAnimeAboutInfo);

router.get('/episode1', checkAuth, apiController.getAnime1stEpisodeId);

router.get('/episodes', checkAuth, apiController.getAnimeEpisodes);

router.get('/genre', apiController.getGenreAnime);

router.get('/info-room', checkAuth, apiController.getRoomAnimeInfo);

router.get('/servers', checkAuth, apiController.getEpisodeServers);

router.get('/watch-episode', checkAuth, apiController.getEpisodeSources);

router.get('/explore/:category', apiController.getAnimeExploreCategory);

router.get('/:category', apiController.getAnimeCategory);



export default router;
