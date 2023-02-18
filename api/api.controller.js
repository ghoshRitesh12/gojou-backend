import createHttpError from 'http-errors';

import Parser from './animeParser.js';
import { Servers, animeCategories, animeGenres } from './helpers/utils.js';



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


// /home
const getHomePage = async (req, res, next) => {
  try {
    const data = await Parser.scrapeHomePage();
    
    res.status(200).json(data);
    
  } catch (err) {
    console.log(err);
    next(err);   
  }
}


// /most-viewed?period=month
const getMostViewedAnime = async (req, res, next) => {
  const periods = ['today', 'week', 'month'];
  try {
    const period = decodeURIComponent((!req.query.period) ? 'today' : req.query.period);

    if(!periods.includes(period)) 
      throw createHttpError.NotFound('invalid period')
    
    const data = await Parser.scrapeMostViewedAnime(period);
    
    res.status(200).json(data);
    
  } catch (err) {
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


// /servers?episodeId=steinsgate-0-92?ep=2051
const getEpisodeServers = async(req, res, next) => {
  try {
    const episodeId = req.query.episodeId ? decodeURIComponent(req.query.episodeId) : null;

    if(episodeId === null) 
      throw createHttpError.BadRequest('episode id required');

    const data = await Parser.fetchEpisodeServers(episodeId);

    res.status(200).json(data);
    
  } catch (err) {
    next(err);
  }
}


// /watch?episodeId=steinsgate-3?ep=230
const getEpisodeSources = async(req, res, next) => {
  try {
    const episodeId = req.query.episodeId ? decodeURIComponent(req.query.episodeId) : null;
    const server = req.query.server ? decodeURIComponent(req.query.server) : Servers.VidStreaming;
    const subOrDub = req.query.subOrDub ? decodeURIComponent(req.query.subOrDub) : 'sub';

    if(episodeId === null) 
      throw createHttpError.BadRequest('episode id required');

    const data = await Parser.fetchEpisodeSources(episodeId, server, subOrDub);

    res.status(200).json({
      subOrDub,
      episode: data
    });
    
  } catch (err) {
    next(err);
  }
}


export default { 
  getAnimeCategory, getAnimeSearchResult, 
  getMostViewedAnime, getAnimeAboutInfo, getGenreAnime,
  getEpisodeSources, getEpisodeServers, getHomePage,
}
