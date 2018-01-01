var log = require('../core/log.js');

var method = {};

// prepare everything our method needs
  method.init = function() {
  this.name = 'limittrade';
  this.previousAction = this.settings.previousAction;
  this.previousActionPrice = this.settings.previousActionPrice;
  this.posisimentok = this.settings.posisimentok;
}

method.update = function(candle) {
}

method.log = function(candle) {
}

method.check = function(candle) {  
  const buyat = 1.03; // setting lebih besar saat harga naik tinggi
  const sellat = 0.96; // amount of percentage of difference required
  const stop_loss_pct = 0.55; // setting lebih kecil kalau mau hold lama
  const sellat_up = 1.02; // 
  const berhenti = 1.3; //berhenti di sini

if(this.previousAction === "mulai") {
	
	log.debug('\t');
log.debug('\t', 'Akan mulai beli saat harga lebih rendah dari: ', this.previousActionPrice);
log.debug('\t', 'Posisi sekarang :', candle.close);
log.debug('\t');
    // we sell if the price is more than the required threshold or equals stop loss threshold
    if((candle.close < this.previousActionPrice)) {
      this.advice('long');
      this.previousAction = 'buy';
      this.previousActionPrice = candle.close;
    }
}

  if(this.previousAction === "buy") {
    // calculate the minimum price in order to sell
    const threshold = this.previousActionPrice * buyat;

    // calculate the stop loss price in order to sell
    const stop_loss = this.previousActionPrice * stop_loss_pct;
log.debug('\t', 'Posisi akhir beli: ', this.previousActionPrice);
log.debug('\t', 'Posisi sekarang :', candle.close);
log.debug('\t', 'Rencana Penjualan di atas :', threshold);
log.debug('\t', 'atau di bawah :', stop_loss);
log.debug('\t');
    // we sell if the price is more than the required threshold or equals stop loss threshold
    if((candle.close > threshold)) {
      this.advice('short');
      this.previousAction = 'sell';
      this.previousActionPrice = candle.close;
    }
    if((candle.close < stop_loss))
    {
    	this.advice('short');
    	log.debug('\t', 'Bangkrut boy posisi akhir :', candle.close);
    	process.exit(1); 
    }
  }

  else if(this.previousAction === "sell") {
  	  const bot_capek = this.previousActionPrice * berhenti;
  	  if((candle.close > bot_capek) || (candle.close > this.posisimentok))
  	  {
  	  log.debug('\t', 'Stop sebentar di sini boy rawan turun harga: ', candle.close);	
  	  this.previousAction = 'mulai';
      this.previousActionPrice = this.settings.previousActionPrice;  
  	  }
  	  else
  	  {
  // calculate the minimum price in order to buy
    const threshold = this.previousActionPrice * sellat;

  // calculate the price at which we should buy again if market goes up
    const sellat_up_price = this.previousActionPrice * sellat_up;
log.debug('\t', 'Posisi akhir jual: ', this.previousActionPrice);
log.debug('\t', 'Posisi sekarang :', candle.close);
log.debug('\t', 'Rencana Pembelian di atas :', sellat_up_price);
log.debug('\t', 'atau di bawah :', threshold);
log.debug('\t');
    // we buy if the price is less than the required threshold or greater than Market Up threshold
    if((candle.close < threshold) || (candle.close > sellat_up_price)) {
      this.advice('long');
      this.previousAction = 'buy';
      this.previousActionPrice = candle.close;
  }
    }
  }
}

module.exports = method;
