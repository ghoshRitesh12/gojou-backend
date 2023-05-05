import axios from 'axios';
import { load } from 'cheerio';
import CryptoJS from 'crypto-js';
import createHttpError from 'http-errors';

import { substringAfter, substringBefore } from '../helpers/utils.js';

class RapidCloud {
  serverName = 'RapidCloud';
  sources = [];

  // https://rapid-cloud.co/embed-6/eVZPDXwVfrY3?vast=1
  fallbackKey = 'c1d17096f2ca11b7';
  host = 'https://rapid-cloud.co';


  extract = async (videoUrl) => {
    const result = {
      sources: [],
      subtitles: []
    }

    try {
      const id = videoUrl.href.split('/').pop()?.split('?')[0];
      const options = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      };

      let res = null;

      res = await axios.get(`${this.host}/ajax/embed-6/getSources?id=${id}`, options)

      let { data: { sources, tracks, intro, encrypted } } = res;

      let decryptKey = await (
        await axios.get('https://github.com/enimax-anime/key/blob/e6/key.txt')
      ).data;

      decryptKey = substringBefore(substringAfter(decryptKey, '"blob-code blob-code-inner js-file-line">'), '</td>');

      if(!decryptKey) {
        decryptKey = await (
          await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt')
        ).data;
      }

      if(!decryptKey) decryptKey = this.fallbackKey;

      try {
        if (encrypted) {
          const decrypt = CryptoJS.AES.decrypt(sources, decryptKey);
          sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
        }
      } catch (err) {
        console.log(err.message);
        throw createHttpError.InternalServerError('Cannot decrypt sources. Perhaps the key is invalid.');
      }

      this.sources = sources?.map(s => ({
        url: s.file,
        isM3U8: s.file.includes('.m3u8')
      }))

      result.sources.push(...this.sources);

      if (videoUrl.href.includes(new URL(this.host).host)) {
        result.sources = [];
        this.sources = [];

        for (const source of sources) {
          const { data } = await axios.get(source.file, options);
          const m3u8data = data.split('\n').filter(line => line.includes('.m3u8') && line.includes('RESOLUTION='));

          const secondHalf = m3u8data.map(line =>
            line.match(/RESOLUTION=.*,(C)|URI=.*/g)?.map(s => s.split('=')[1])
          );

          console.log(secondHalf);          
          const TdArray = secondHalf.map(s => {
            const f1 = s[0].split(',C')[0];
            const f2 = s[1].replace(/"/g, '');

            return [f1, f2];
          });
          for (const [f1, f2] of TdArray) {
            this.sources.push({
              url: `${source.file?.split('master.m3u8')[0]}${f2.replace('iframes', 'index')}`,
              quality: f1.split('x')[1] + 'p',
              isM3U8: f2.includes('.m3u8'),
            });
          }
          result.sources.push(...this.sources);
        }
        if (intro.end > 1) {
          result.intro = {
            start: intro.start,
            end: intro.end,
          };
        }
      }

      result.sources.push({
        url: sources[0].file,
        isM3U8: sources[0].file.includes('.m3u8'),
        quality: 'auto',
      });

      result.subtitles = tracks.map(s =>
        s.file ? { url: s.file, lang: s.label ? s.label : 'Thumbnails'} : null
      ).filter(s => s);

      return result;
      
    } catch (err) {
      console.log(err.message);
      throw err;
    }
  }


  // captcha = async (url, key) => {
  //   const uri = new URL(url);
  //   const domain = uri.protocol + '//' + uri.host;

  //   const { data } = await axios.get(`https://www.google.com/recaptcha/api.js?render=${key}`, {
  //     headers: {
  //       Referer: domain,
  //     }
  //   })

  //   const v = data?.substring(data.indexOf('/releases/'), data.lastIndexOf('/recaptcha')).split('/releases/')[1];

  //   //TODO: NEED to fix the co (domain) parameter to work with every domain
  //   const anchor = `https://www.google.com/recaptcha/api2/anchor?ar=1&hl=en&size=invisible&cb=kr42069kr&k=${key}&co=aHR0cHM6Ly9yYXBpZC1jbG91ZC5ydTo0NDM.&v=${v}`;
  //   const c = load((await axios.get(anchor)).data)('#recaptcha-token').attr('value');

  //   // currently its not returning proper response. not sure why
  //   const res = await axios.post(
  //     `https://www.google.com/recaptcha/api2/reload?k=${key}`,
  //     {
  //       v: v,
  //       k: key,
  //       c: c,
  //       co: 'aHR0cHM6Ly9yYXBpZC1jbG91ZC5ydTo0NDM.',
  //       sa: '',
  //       reason: 'q',
  //     },
  //     {
  //       headers: {
  //         Referer: anchor,
  //       },
  //     }
  //   );

  //   return res.data.substring(res.data.indexOf('rresp","'), res.data.lastIndexOf('",null'));
    
  // }
  
}

export default RapidCloud;
