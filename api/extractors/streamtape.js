import axios from "axios";
import { load } from 'cheerio';
import createHttpError from "http-errors";


class StreamTape {
  serverName = 'StreamTape';
  sources = [];

  extract = async (videoUrl) => {
    try {
      const res = await axios.get(videoUrl.href).catch(() => {
        throw createHttpError.NotFound('Video not found');
      });

      console.log(res.data);

      const $ = load(res.data);

      let [fh, sh] = $.html()?.match(/robotlink'\).innerHTML = (.*)'/)[1].split("+ ('");

      sh = sh.substring(3);
      fh = fh.replace(/\'/g, '');

      const url = `https:${fh}${sh}`;

      this.sources.push({
        url: url,
        isM3U8: url.includes('.m3u8'),
      });

      return this.sources;
    } catch (err) {
      console.log(err.message);
      throw err
    }
  }
  
}

export default StreamTape;
