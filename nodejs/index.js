const csv = require('csv-parser');
const fs = require('fs');
const Web3 = require('web3');
const path = require("path");

const tokenABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, "tokenABI.json")));
const address = "0x4691f60c894d3f16047824004420542e4674e621";

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
const tokenContract = new web3.eth.Contract(tokenABI, address);

var comp;
fs.readFile("config.txt", 'utf8', function(err, data) {
    if (err) throw err;
    comp = Number(data);
});

function main(){
    try {
        fs.unlinkSync("result.txt")
      } catch(err) {
        console.error(err)
      }
    
    fs.createReadStream('1.csv')
    .pipe(csv())
    .on('data',async (row) => {
    //   console.log(row.HolderAddress);
      let balance = await tokenContract.methods.balanceOf(row.HolderAddress).call();
      if (balance > comp) {
          let line = row.HolderAddress + "\t" + balance + "\n";
          console.log(line);
          fs.appendFile('result.txt', line, function (err) {})
      }
    })
    .on('end', () => {
    });
    
}

main();



