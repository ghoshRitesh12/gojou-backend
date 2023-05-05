import { EventEmitter } from "events";
import { encryptSSE } from "./cipher.js";


class Gojou extends EventEmitter {
  constructor() {
    super();
  }

  async emitEncrypt(eventName, data) {
    try {
      const sseData = await encryptSSE(eventName, data);
      this.emit(eventName, sseData)

    } catch (err) {
      throw err
    }
  }

  emitRegular(eventName, data) {
    try {
      this.emit(eventName, JSON.stringify(data))

    } catch (err) {
      throw err
    }
  }

}


const gojou = new Gojou();

export default gojou;
