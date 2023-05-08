import createHttpError from 'http-errors';

import Parser from './anime.parser.js';
import { Servers, animeCategories, animeGenres } from './helpers/utils.js';

import redisClient from '../config/initRedis.js';


const getAnimeCategory = async (req, res, next) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const page = req.query.page ? decodeURIComponent(req.query.page) : 1;

    if(!category) throw createHttpError.BadRequest('category required') 

    if(!animeCategories.includes(category)) 
      throw createHttpError.NotFound('searched parameter not present') 

    const data = await Parser.scrapeAnimeCategory(category, page);
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}

// /explore/:ova
const getAnimeExploreCategory = async (req, res, next) => {
  try {

    const category = decodeURIComponent(req.params.category);

    if(!category) throw createHttpError.BadRequest('category required') 

    if(!animeCategories.includes(category)) 
      throw createHttpError.NotFound('searched parameter not present') 

    const data = await Parser.scrapeAnimeExploreCategory(category)
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}

// /search?q=bruh
const getAnimeSearchResult = async (req, res, next) => {
  try {
    const q = req.query.q ? decodeURIComponent(req.query.q) : null;
    const page = req.query.page ? decodeURIComponent(req.query.page) : 1;

    if(q === null)
      throw createHttpError.BadRequest('search keyword required');

    const data = await Parser.scrapeAnimeSearch(q, page);
    
    res.status(200).json(data);
    
  } catch (err) {
    console.log(err);
    next(err);   
  }
}

// /quick-search?q=steins
const getAnimeQuickSearch = async (req, res, next) => {
  try {
    const q = req.query.q ? decodeURIComponent(req.query.q) : null;

    if(q === null)
      throw createHttpError.BadRequest('search keyword required');

    const data = await Parser.scrapeAnimeSearchSuggestion(q);
    
    res.status(200).json(data);
    
  } catch (err) {
    console.log(err);
    next(err);   
  }
}


// /home
const getHomePage = async (req, res, next) => {
  try {
    if(await redisClient.exists('home')) {
      const data = await redisClient.get('home');
      return res.status(200).json(JSON.parse(data));
    }

    const data = await Parser.scrapeHomePage();

    await redisClient.set('home', JSON.stringify(data));
    
    res.status(200).json(data);
    
  } catch (err) {
    console.log(err);
    next(err);   
  }
}


// /info?id=attack-on-titan-112
const getAnimeAboutInfo = async (req, res, next) => {
  try {
    const id = req.query.id ? decodeURIComponent(req.query.id) : null;

    if(id === null)
      throw createHttpError.BadRequest('anime unique id required')
      
    const data = await Parser.scrapeAnimeAboutInfo(id);
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}


// /episode1?id=steinsgate-3
const getAnime1stEpisodeId = async (req, res, next) => {
  try {
    const id = req.query.id ? decodeURIComponent(req.query.id) : null;

    if(id === null)
      throw createHttpError.BadRequest('anime unique id required')
      
    const data = await Parser.scrapeAnime1stEpisodeId(id);
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}


// /episodes?id=steinsgate-3
const getAnimeEpisodes = async (req, res, next) => {
  try {
    const id = req.query.id ? decodeURIComponent(req.query.id) : null;

    if(id === null)
      throw createHttpError.BadRequest('anime unique id required')
      
    if(await redisClient.exists(`/episodes?id=${id}`)) {
      const data = await redisClient.get(`/episodes?id=${id}`);
      return res.status(200).json(JSON.parse(data));
    }

    const data = await Parser.scrapeAnimeEpisodes(id);

    await redisClient.set(
      `/episodes?id=${id}`,
      JSON.stringify(data)
    )
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}


// /genre?name=shounen
const getGenreAnime = async (req, res, next) => {
  try {
    const name = req.query.name ? decodeURIComponent(req.query.name.toLowerCase()) : null;
    const page = req.query.page ? decodeURIComponent(req.query.page) : 1;

    if(name === null) 
      throw createHttpError.BadRequest('anime genre required');
      
    if(!animeGenres.includes(name))
      throw createHttpError.NotFound('invalid anime genre');

      
    const data = await Parser.scrapeAnimeGenre(name, page);
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}


// /info-room?id=attack-on-titan-112
const getRoomAnimeInfo = async (req, res, next) => {
  try {
    const id = req.query.id ? decodeURIComponent(req.query.id) : null;

    if(id === null)
      throw createHttpError.BadRequest('anime unique id required');

    if(await redisClient.exists(`/info-room?id=${id}`)) {
      const data = await redisClient.get(`/info-room?id=${id}`);
      return res.status(200).json(JSON.parse(data));
    }
      
    const data = await Parser.fetchRoomAnimeInfo(id);

    await redisClient.set(`/info-room?id=${id}`, JSON.stringify(data));
    
    res.status(200).json(data);
    
  } catch (err) {
    next(err);   
  }
}


// /servers?episodeId=steinsgate-0-92?ep=2051
const getEpisodeServers = async(req, res, next) => {
  try {
    const episodeId = req.query.episodeId ? decodeURIComponent(req.query.episodeId) : null;

    if(episodeId === null) 
      throw createHttpError.BadRequest('episode id required');

    if(await redisClient.exists(`/servers?episodeId=${episodeId}`)) {
      const data = await redisClient.get(`/servers?episodeId=${episodeId}`);
      return res.status(200).json(JSON.parse(data));
    }

    const data = await Parser.fetchEpisodeServers(episodeId);

    await redisClient.set(
      `/servers?episodeId=${episodeId}`, 
      JSON.stringify(data)
    )

    res.status(200).json(data);
    
  } catch (err) {
    next(err);
  }
}


// /watch-episode?episodeId=steinsgate-3?ep=230
const getEpisodeSources = async (req, res, next) => {
  try {
    const episodeId = req.query.episodeId ? decodeURIComponent(req.query.episodeId) : null;
    const server = req.query.server ? decodeURIComponent(req.query.server) : Servers.VidStreaming;
    const subOrDub = req.query.subOrDub ? decodeURIComponent(req.query.subOrDub) : 'sub';

    if(episodeId === null) 
      throw createHttpError.BadRequest('episode id required');

    if(await redisClient.exists(server)) {

      const data = await redisClient.get(server);

      return res.status(200).json({
        subOrDub,
        episode: JSON.parse(data)
      });
    }

    const data = await Parser.fetchEpisodeSources(episodeId, server, subOrDub);

    await redisClient.set(server, JSON.stringify(data));

    res.status(200).json({
      subOrDub,
      episode: data
    });
    
  } catch (err) {
    console.log(err.message);
    next(err);
  }
}



export default { 
  getAnimeCategory, getAnimeSearchResult, getAnimeQuickSearch,
  getAnimeAboutInfo, getGenreAnime, getHomePage,
  getEpisodeSources, getEpisodeServers, getAnimeEpisodes,
  getRoomAnimeInfo, getAnimeExploreCategory, getAnime1stEpisodeId
}
