import { EventEmitter } from "events";
import { encryptState } from "./cipher.js";

export const g2 = new EventEmitter();


class Gojou extends EventEmitter {
  constructor() {
    super();
  }

  async serializeSSE(data) {
    try {
      return await encryptState(
        data, process.env.FRONTEND_STATE_SECRET
      );
    } catch (err) {
      throw err;
    }
  }

  async emitEncrypt(eventName, data) {
    try {
      const sseData = await encryptState(
        data, process.env.FRONTEND_STATE_SECRET
      );

      this.emit(eventName, eventName, sseData)

    } catch (err) {
      throw err
    }
  }

  emitRegular(eventName, data) {
    try {
      const sseData = JSON.stringify(data);

      this.emit(eventName, eventName, sseData)

    } catch (err) {
      throw err
    }
  }

}


const gojou = new Gojou();

export default gojou;
