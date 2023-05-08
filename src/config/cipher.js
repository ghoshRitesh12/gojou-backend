import CryptoJS from "crypto-js";

export const encryptState = (data, secret) => {
  return new Promise((resolve, reject) => {
    if(!data || !secret) return reject('data or secret not present');
    resolve(
      CryptoJS.AES.encrypt(
        JSON.stringify(data), secret
      ).toString()
    )
  })
}

export const decryptState = (encString, secret) => {
  return new Promise((resolve, reject) => {
    if(!encString || !secret) return reject('encrypted string or secret not present');
    resolve(
      JSON.parse(CryptoJS.AES.decrypt(
        encString, secret,
      ).toString(CryptoJS.enc.Utf8))
    )
  })
}
