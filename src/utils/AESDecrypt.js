import CryptoJS from '../../node_modules/crypto-js'
// AES解密
const AESDecrypt = (data) => {
    // AES加密key：1234567890123456
    // AES加密模式：AES/ECB/PKCS5Padding
    // 假设这是您接收到的加密数据
    const encryptedData = data;
    // 这是您的解密密钥
    const key = CryptoJS.enc.Utf8.parse('1234567890123456');
    // 解密数据
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    // 将解密后的数据转换为字符串
    const decryptedDataStr = decryptedData.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedDataStr)
}
export { AESDecrypt }