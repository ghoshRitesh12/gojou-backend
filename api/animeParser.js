import axios from 'axios';
import { load } from 'cheerio';
import createHttpError from 'http-errors';

import { StreamSB, RapidCloud, StreamTape } from "./extractors/index.js";
import {
  USER_AGENT, ACCEPT_HEADER, Servers,
  BASE_URL, ajax_url, home_url, search_url,
} from './helpers/utils.js';


class Parser {
  static home_url = home_url;
  static search_url = search_url;

  /**
   * @param {page} page number  
   * @param {category} name of scraped page  
   */
  static scrapeAnimeCategory = async (category, page = 1) => {
    const res = {
      currentPage: parseInt(page),
      category,
      animes: [],
      hasNextPage: false,
      totalPages: null
    }

    try {
      const scrape_url = new URL(category, BASE_URL);

      const mainPage = await axios.get(`${scrape_url}?page=${page}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        },
      });

      const $ = load(mainPage.data);

      const selector = '#main-content .tab-content .film_list-wrap .flw-item';

      res.hasNextPage =
        $('.pagination > li').length > 0 ?
          $('.pagination li.active').length > 0 ?
            $('.pagination > li').last().hasClass('active') ? false : true
          : false
        : false;

      res.totalPages = parseInt(
        $('.pagination > .page-item a[title="Last"]')?.attr('href')?.split("=").pop()
        ??
        $('.pagination > .page-item.active a')?.text()?.trim()
      ) || null;

      if (res.totalPages === null && !res.hasNextPage) res.totalPages = 1;

      res.animes = await this.extractAnimes($, selector);

      if (res.animes.length === 0) {
        res.totalPages = null;
        res.hasNextPage = false;
      }

      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {page} page number  
   * @param {q} search query  
   */
  static scrapeAnimeSearch = async (q, page = 1) => {
    const res = {
      currentPage: parseInt(page),
      hasNextPage: false,
      animes: [],
      totalPages: 0
    }

    try {
      const mainPage = await axios.get(
        `${this.search_url}?keyword=${q}&page=${page}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        },
      });

      const $ = load(mainPage.data);

      const selector = '#main-content .tab-content .film_list-wrap .flw-item';

      res.hasNextPage =
        $('.pagination > li').length > 0 ?
          $('.pagination li.active').length > 0 ?
            $('.pagination > li').last().hasClass('active') ? false : true
          : false
        : false;

      res.totalPages = parseInt(
        $('.pagination > .page-item a[title="Last"]')?.attr('href')?.split("=").pop()
          ??
        $('.pagination > .page-item.active a')?.text()?.trim()
      ) || 0;

      if (res.totalPages === 0 && !res.hasNextPage) res.totalPages = 1;

      res.animes = await this.extractAnimes($, selector);

      if (res.animes.length === 0) {
        res.totalPages = 0;
        res.hasNextPage = false;
      }

      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }
  
  
  /**
   * @param {q} suggest search query  
   */
  static scrapeAnimeSearchSuggestion = async (q) => {
    const res = { animes: [] }

    try {
      const mainPage = await axios.get(
        `${ajax_url}/search/suggest?keyword=${q}`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': "*/*",
          'Referer': this.home_url,
          'X-Requested-With': 'XMLHttpRequest'
        },
      });

      const $ = load(mainPage.data.html);

      const selector = '.nav-item:not(.nav-bottom)'

      $(selector).each((i, el) => {
        res.animes.push({
          id: $(el).attr('href')?.split('?')[0].slice(1),
          name: $(el).find('.srp-detail .film-name')?.text()?.trim(),
          jname: 
            $(el).find('.srp-detail .film-name')?.attr('data-jname')?.trim()
              || 
            $(el).find('.srp-detail .alias-name')?.text()?.trim(),
          poster: $(el).find('.film-poster .film-poster-img')?.attr('data-src')?.trim(),
          moreInfo: [...$(el).find('.film-infor').contents().map((i, el) => $(el).text().trim())].filter(i => i)
        });
      })

      
      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * ~no params~  
   */
  static scrapeHomePage = async () => {
    const res = {
      spotlightAnimes: [],
      trendingAnimes: [],
      latestEpisodeAnimes: [],
      topUpcomingAnimes: []
    }

    try {
      const mainPage = await axios.get(this.home_url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        },
      });

      const $ = load(mainPage.data);

      const spotlightSelector = '#slider .swiper-wrapper .swiper-slide';
      $(spotlightSelector).each((i, el) => {
        const otherInfo = 
          $(el).find('.deslide-item-content .sc-detail .scd-item').map((i, el) => $(el).text().trim()).get();

        res.spotlightAnimes.push({
          rank: parseInt($(el).find('.deslide-item-content .desi-sub-text')?.text().trim().split(" ")[0].slice(1)),
          id: $(el).find('.deslide-item-content .desi-buttons a')?.last()?.attr('href')?.slice(1).trim(),
          name: $(el).find('.deslide-item-content .desi-head-title.dynamic-name')?.text().trim(),
          description: $(el).find('.deslide-item-content .desi-description')?.text()?.split('[').shift().trim(),
          poster: $(el).find('.deslide-cover .deslide-cover-img .film-poster-img')?.attr('data-src').trim(),
          jname: $(el).find('.deslide-item-content .desi-head-title.dynamic-name')?.attr('data-jname').trim(),
          otherInfo
        })
      })


      const trendingSelector = '#trending-home .swiper-wrapper .swiper-slide';
      $(trendingSelector).each((i, el) => {
        res.trendingAnimes.push({
          rank: parseInt($(el).find('.item .number')?.children()?.first()?.text().trim()),
          name: $(el).find('.item .number .film-title.dynamic-name')?.text().trim(),
          id: $(el).find('.item .film-poster')?.attr('href')?.slice(1).trim(),
          poster: $(el).find('.item .film-poster .film-poster-img')?.attr('data-src')?.trim(),
        })
      })


      const latestEpisodeSelector = '#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item';
      res.latestEpisodeAnimes = await this.extractAnimes($, latestEpisodeSelector);


      const topUpcomingSelector = '#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item';
      res.topUpcomingAnimes = await this.extractAnimes($, topUpcomingSelector);

      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {period} period of time  
   */
  static scrapeMostViewedAnime = async (period = "today") => {
    try {
      const res = {
        period,
        animes: []
      }

      period = (period === "today") ? "day" : period;

      const mainPage = await axios.get(this.home_url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        },
      });

      const $ = load(mainPage.data);

      const selector = `#top-viewed-${period} > ul > li`

      $(selector).each((i, el) => {
        const aboutPage = new URL($(el).find('.film-detail > h3 > a.dynamic-name').attr('href'), BASE_URL).toString();

        res.animes.push({
          id: aboutPage.split('/').pop(),
          rank: $(el).find('.film-number span').text(),
          name: $(el).find('.film-detail > h3 > a.dynamic-name').text(),
          poster: $(el).find('.film-poster .film-poster-img').attr('data-src').replace('300x400', '800x800'),
          aboutPage,
          views: $(el).find('.film-detail > .fd-infor > .fdi-item.mr-3').text(),
          hearts: $(el).find('.film-detail > .fd-infor > .fdi-item:nth-child(2)').text()
        });
      })

      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {id} anime id
   */
  static scrapeAnimeAboutInfo = async (id) => {
    const info = {
      episodes: [],
      moreInfo: {},
      seasons: []
    };

    try {
      const anime_url = new URL(id, BASE_URL).toString();

      const mainPage = await axios.get(anime_url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        },
      });

      const $ = load(mainPage.data);
      const selector = `#ani_detail .container .anis-content`

      info.id = $(selector).find('.anisc-detail .film-buttons a.btn-play').attr('href')?.split('/').pop();
      info.name = $(selector).find('.anisc-detail .film-name.dynamic-name').text()?.trim();
      info.description = $(selector).find('.anisc-detail .film-description .text').text()?.split('[').shift().trim();
      info.poster = $(selector).find('.film-poster .film-poster-img').attr('src')?.trim();
      info.stats = await (async () => {
        const all_stats = [];
        $(`${selector} .anisc-detail .film-stats > .item`).each((i, el) => {
          all_stats.push($(el).find('.tick-item').text())
        })
        return all_stats.filter(item => item);
      })();

      // more information
      $(`${selector} .anisc-info-wrap .anisc-info .item.item-title:not(.w-hide)`).each((i, el) => {
        let key = $(el).find('.item-head').text().toLowerCase().replace(':', '').trim();
        key = key.includes(' ') ? key.replace(' ', '') : key;
        const value = $(el).find('.name').text();
        info.moreInfo[key] = value;
      })

      // more seasons
      const seasonsSelector = '#main-content .os-list a.os-item';
      $(seasonsSelector).each((i, el) => {
        info.seasons.push({
          isCurrent: $(el).hasClass('active'),
          id: $(el).attr('href').slice(1).trim(),
          name: $(el).attr('title').trim(),
          title: $(el).find('.title').text().trim(),
          poster: $(el).find('.season-poster')?.attr('style')?.split(" ").pop().split('(').pop().split(')')[0]
        })
      })


      // episodes
      const episodesAjax = await axios.get(`${ajax_url}/v2/episode/list/${info.id.split('-').pop()}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': USER_AGENT,
          Referer: new URL(`/watch/${info.id}`, BASE_URL).toString()
        }
      });

      const $$ = load(episodesAjax.data.html);

      info.totalEpisodes = $$('.detail-infor-content .ss-list a').length;
      $$('.detail-infor-content .ss-list a').each((i, el) => {
        const episodeId = $$(el).attr('href')?.split('/').pop();
        const number = parseInt($$(el).attr('data-number'));
        const title = $$(el).attr('title');
        const url = new URL($$(el).attr('href'), BASE_URL).toString()
        const isFiller = $$(el).hasClass('ssl-item-filler');

        info.episodes?.push({
          id: episodeId,
          number: number,
          title: title,
          isFiller: isFiller,
          url: url,
        });
      });


      return info;

    } catch (err) {
      console.log(err);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {genre} anime genre
   */
  static scrapeAnimeGenre = async (genreName, page = 1) => {
    const res = {
      genreName,
      currentPage: parseInt(page),
      hasNextPage: false,
      animes: [],
      totalPages: null
    }

    try {
      const mainPage = await axios.get(
        new URL(`/genre/${genreName}?page=${page}`, BASE_URL).toString(), {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': ACCEPT_HEADER
        }
      });

      const $ = load(mainPage.data);

      const selector = '#main-content .tab-content .film_list-wrap .flw-item'

      res.hasNextPage = $('.pagination > li').length > 0 ?
        $('.pagination li.active').length > 0 ? $('.pagination > li').last().hasClass('active') ? false : true : false
        : false;

      res.totalPages = parseInt(
        $('.pagination > .page-item a[title="Last"]')?.attr('href')?.split("=").pop()
        ??
        $('.pagination > .page-item.active a')?.text()?.trim()
      )

      if (res.totalPages === null && !res.hasNextPage) res.totalPages = 1;

      $(selector).each((i, el) => {
        const animeId = $(el).find('.film-detail > .film-name > a.dynamic-name').attr('href').slice(1).split('?')[0];

        res.animes.push({
          id: animeId,
          name: $(el).find('.film-detail > .film-name > a.dynamic-name').text(),
          poster: $(el).find('.film-poster .film-poster-img').attr('data-src').trim(),
          duration: $(el).find('.film-detail > div.fd-infor > span.fdi-item.fdi-duration').text(),
          aboutPage: new URL(animeId, BASE_URL).toString(),
          rating: $(el).find('.film-poster .tick-rate').text().trim() || null,
          episodes: $(el).find('.film-poster .tick-eps').text().trim().split(" ").pop() || null
        });
      })

      if (res.animes.length === 0) {
        res.totalPages = null;
        res.hasNextPage = false;
      }

      return res;

    } catch (error) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {episodeId} episode id (eg: steinsgate-0-92?ep=2051)
   */
  static fetchEpisodeServers = async (episodeId) => {
    const res = {
      sub: [], dub: [],
      episodeId
    }

    console.log(episodeId);

    try {
      const epId = episodeId.split('?ep=')[1];

      const { data } = await axios.get(
        `${ajax_url}/v2/episode/servers?episodeId=${epId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: new URL(`/watch/${episodeId}`, BASE_URL).toString(),
          'User-Agent': USER_AGENT
        }
      });
      
      const $ = load(data.html);

      $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each((i, el) => {
        res.sub.push({
          serverName: $(el).find('a').text().toLowerCase().trim(),
          serverId: parseInt($(el).attr('data-server-id').trim())
        })
      })

      $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each((i, el) => {
        res.dub.push({
          serverName: $(el).find('a').text().toLowerCase().trim(),
          serverId: parseInt($(el).attr('data-server-id').trim())
        })
      })


      return res;

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }


  /**
   * @param {episodeId} episode id  
   * @param {server} episode server   
   * @param {subOrDub} sub or dub version  
   */
  static fetchEpisodeSources = async (episodeId, server = Servers.VidStreaming, subOrDub = 'sub') => {
    if (episodeId.startsWith('http')) {
      const serverUrl = new URL(episodeId);

      switch (server) {
        case Servers.VidStreaming:
        case Servers.VidCloud:
          return {
            ...(await new RapidCloud().extract(serverUrl)),
          };
        case Servers.StreamSB:
          return {
            headers: { Referer: serverUrl.href, watchsb: 'sbstream', 'User-Agent': USER_AGENT },
            sources: await new StreamSB().extract(serverUrl, true),
          };
        case Servers.StreamTape:
          return {
            headers: { Referer: serverUrl.href, 'User-Agent': USER_AGENT },
            sources: await new StreamTape().extract(serverUrl),
          };
        default:
        case Servers.VidCloud:
          return {
            headers: { Referer: serverUrl.href },
            ...(await new RapidCloud().extract(serverUrl)),
          };
      }
    }

    // steinsgate-3?ep=213
    // if(!episodeId.includes('?ep=')) throw new Error('Invalid episode id LMAO');

    const epId = new URL(`/watch/${episodeId}`, BASE_URL).toString();
    // const subOrDub = 'sub';

    try {
      const { data } = await axios.get(
        `${ajax_url}/v2/episode/servers?episodeId=${epId.split('?ep=')[1]}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: epId, 'User-Agent': USER_AGENT
        }
      })

      console.dir(epId)

      const $ = load(data.html);

      /**
       * vidtreaming -> 4
       * rapidcloud  -> 1
       * streamsb -> 5
       * streamtape -> 3
       */

      let serverId = '';

      try {
        switch (server) {
          case Servers.VidCloud:
            serverId = this.retrieveServerId($, 1, subOrDub);

            if (!serverId) throw new Error('RapidCloud not found');
            break;
          case Servers.VidStreaming:
            serverId = this.retrieveServerId($, 4, subOrDub);

            if (!serverId) throw new Error('VidStreaming not found');
            break;
          case Servers.StreamSB:
            serverId = this.retrieveServerId($, 5, subOrDub);

            if (!serverId) throw new Error('StreamSB not found');
            break;
          case Servers.StreamTape:
            serverId = this.retrieveServerId($, 3, subOrDub);

            if (!serverId) throw new Error('StreamTape not found');
            break;
        }
      } catch (err) {
        throw createHttpError.NotFound("Couldn't find server. Try another server");
      }

      const res = await axios.get(`${ajax_url}/v2/episode/sources?id=${serverId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: new URL(`/watch/${epId.split('?ep=')[1]}`, BASE_URL).toString()
        }
      });

      console.log(res.data);

      return await this.fetchEpisodeSources(res.data.link, server, subOrDub);

    } catch (err) {
      console.log(err.message);
      throw createHttpError.InternalServerError(err.message);
    }
  }

  static retrieveServerId = ($, index, subOrDub) => {
    return $(`.ps_-block.ps_-block-sub.servers-${subOrDub} > .ps__-list .server-item`)
      .map((i, el) => ($(el).attr('data-server-id') == `${index}` ? $(el) : null))
      .get()[0]
      .attr('data-id');
  }


  static extractAnimes = async ($, selector) => {
    try {
      const animes = [];

      $(selector).each((i, el) => {
        const animeId = $(el).find('.film-detail .film-name .dynamic-name')?.attr('href')?.slice(1).split('?ref=search')[0];
  
        animes.push({
          id: animeId,
          name: $(el).find('.film-detail .film-name .dynamic-name')?.text()?.trim(),
          poster: $(el).find('.film-poster .film-poster-img')?.attr('data-src')?.trim(),
          duration: $(el).find('.film-detail .fd-infor .fdi-item.fdi-duration')?.text()?.trim(),
          type: $(el).find('.film-detail .fd-infor .fdi-item:nth-of-type(1)')?.text()?.trim(),
          rating: $(el).find('.film-poster .tick-rate')?.text()?.trim() || null,
          episodes: $(el).find('.film-poster .tick-eps')?.text()?.trim().split(" ").pop() || null
        });
      })
  
      return animes; 

    } catch (err) {
      throw createHttpError.InternalServerError(err.message);
    }
  }

  // https://storage.googleapis.com/axxu-ppjxq-1651506793.appspot.com/8GLVM3JKPLDN/st25_5_deep-insanity-the-lost-child-episode-9-HD.mp4

}


export default Parser;
