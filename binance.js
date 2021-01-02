require('dotenv').config();

const Binance = require('binance-api-node').default;
const binance = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_PRIVATE_KEY
});

let tries = 1;
let isFinished = false;
const maxTries = 10;
const buyAmount = process.env.BUY_AMOUNT;

const getDate = () => {
	const dateInstance = new Date();
	const dateString = dateInstance.toLocaleDateString();
	const timeString = dateInstance.toLocaleTimeString();
	return `${dateString} ${timeString}`;
}

const sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

(async () => {
  while (!isFinished && tries <= maxTries) {
    await sleep(tries * (tries - 1) * 10 * 1000);
    console.log(`[${getDate()}] Try #${tries}`);

    await binance.prices({
      symbol: 'BTCEUR'
    })
    .then(async price => {

      const quantity = (buyAmount / price['BTCEUR']).toFixed(6);
      
      await binance.order({
        symbol: 'BTCEUR',
        side: 'BUY',
        type: 'MARKET',
        quantity: quantity
      })
      .then(res => {
        console.log(`[${getDate()}] Has been successfully purchased ${quantity} (${price['BTCEUR']})`);
        console.log(JSON.stringify(res));
        isFinished = true;
      })
      .catch(err => {
        console.log(`[${getDate()}] Error adding the order: ${err}`);
        tries++;
      })

    })
    .catch(err => {
      console.log(`[${getDate()}] Error adding the order: ${err}`);
      tries++;
    })
  }
})();