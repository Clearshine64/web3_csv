const express = require('express');
const Web3 = require('web3');
const path = require("path");
const fs = require('fs');
const converter = require('json-2-csv');
const cron = require('node-cron');


const tokenABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, "tokenABI.json")));
const address = "0x4691f60c894d3f16047824004420542e4674e621";
const heroAddress = "0x63f5e5493Fce9C5452092D0D94D9efD1f6BE20aE";

const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));

const tokenContract = new web3.eth.Contract(tokenABI, address);
const heroContract = new web3.eth.Contract(tokenABI, heroAddress);


const router = express.Router();
const app = express();

async function checkBalance(address) {
    let balance = await tokenContract.methods.balanceOf(address).call();
    let heroBalance = await heroContract.methods.balanceOf(address).call();
    console.log(heroBalance);
    console.log(balance);
    if ((balance / 10**9) + heroBalance * 18000 > 200000) {
        return true;
    } else{
        return false;
    }
}

async function showTotalSupply() {
    let totalSupply = await tokenContract.methods.totalSupply().call();
    let burnAddress = "0x000000000000000000000000000000000000dead";
    let burnBalance = await tokenContract.methods.balanceOf(burnAddress).call();
    console.log(totalSupply);
    console.log(burnBalance);
    let result = (totalSupply - burnBalance) / (10 ** 9);
    return result;
}

function removeFromGroupA(address) {
    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata == "") {
        console.log("GroupA is empty!");
        return;
    } else {
        objA = JSON.parse(rawdata);
        if(objA.GroupA.length == 0) {
            console.log(objA.GroupA.length);
            return;
        }

        console.log(objA);
        
        let newObjA = {
            GroupA: []
        };

        newObjA.GroupA = objA.GroupA.filter(item => item.address !== address)
        json = JSON.stringify(newObjA);
        console.log(json);
        fs.writeFile('GroupA.json', json, 'utf8', (err, result) => {  // WRITE
            if (err) {
                return console.error(err);
            } else {
                console.log(result);
                console.log("Success");
        }});
    }
}

function removeFromGroupB(address) {
    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupB.json'));
    if(rawdata == "") {
        console.log("GroupB is empty!");
        return;
    } else {
        objB = JSON.parse(rawdata);
        if(objB.GroupB.length == 0) {
            return;
        }

        console.log(objB);
        
        let newObjB = {
            GroupB: []
        };

        newObjB.GroupB = objB.GroupB.filter(item => item.address !== address)
        json = JSON.stringify(newObjB);
        console.log(json);
        fs.writeFile('GroupB.json', json, 'utf8', (err, result) => {  // WRITE
            if (err) {
                return console.error(err);
            } else {
                console.log(result);
                console.log("Success");
        }});
    }
}

function checkAddressInGroupA(address) {
    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    
    if(rawdata != ""){
        obj = JSON.parse(rawdata);
    } else {
        return false;
    }

    for(let addr of obj.GroupA) {
        if(addr.address === address) {
            return true;
        } else {
            return false;
        }
    }
}

function checkAddressInGroupB(address) {
    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupB.json'));
    
    if(rawdata != ""){
        obj = JSON.parse(rawdata);
    } else {
        return false;
    }

    for(let addr of obj.GroupB) {
        if(addr.address === address) {
            return true;
        } else {
            return false;
        }
    }
}

function addTgName(address, tgName) {
    let obj = {
        GroupC: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupC.json'));
    if(rawdata != "")
        obj = JSON.parse(rawdata);

    let flag = false;

    for(let addr of obj.GroupC) {
        if(addr.address === address) {
            addr.tgName = tgName;
            console.log("------------------updated-------------------");
            flag = true;
            break;
        }
    }

    if(!flag)
        obj.GroupC.push({address, tgName});
    console.log("---------------------added-----------------------");
    console.log(obj)

    let json = JSON.stringify(obj);
    fs.writeFile('GroupC.json', json, 'utf8', (err, result) => {  // WRITE
        if (err) {
            return console.error(err);
        } else {
            console.log(result);
            console.log("Success");
    }});
}

function getTgName(address) {
    let obj = {
        GroupC: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupC.json'));
    if(rawdata != "")
        obj = JSON.parse(rawdata);
    
    for(let addr of obj.GroupC) {
        if(addr.address === address) {
            return addr.tgName;
        }
    }

    return "";
}

async function addToGroupB() {
    let objA = {
        GroupA: []
    };

    let objB = {
        GroupB: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata == "") {
        return "GroupA is empty";
        return;
    } else {
        objA = JSON.parse(rawdata);
    }

    rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupB.json'));
    if(rawdata != "") {
        objB = JSON.parse(rawdata);
        console.log(objB);
    }

    for(let addrA of objA.GroupA) {
        console.log(addrA.address)
        let flag = await checkBalance(addrA.address);
        console.log(flag)
        if(!flag) {
            for(let addrB of objB.GroupB) { 
                if(addrB.address === addrA.address) {
                    return "Already added";
                }
            }

            // insert addrA to GroupB.json
            objB.GroupB.push(addrA);
            let json = JSON.stringify(objB);
            console.log(json);
            fs.writeFile('GroupB.json', json, 'utf8', (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                    console.log(result);
                    console.log("Success");
            }});

            // remove addrA from GroupA.json
            removeFromGroupA(addrA.address);
            return "Successfully added!";

        }
    }
    return "Nothing to added!";
}

//-------------------------- Cron Job -------------------------
cron.schedule("30 1 1,15 * *", async () => {
    await addToGroupB();
});

//------------------------- API --------------------------------
router.get('/', function(req, res){
    res.send("Hello world!");
});

router.get('/api/checkBalance', async (req, res) => {
    const address = req.query.address;
    let flag = await checkBalance(address);
    if(flag){
        res.send("true");
    } else {
        res.send("false");
    }
})

router.get('/api/showTotalSupply', async (req, res) => {
    let totalSupply = await showTotalSupply();
    console.log(totalSupply);
    res.send(totalSupply.toString());
})

// Add address to GroupA
router.get('/api/addToGroupA', async (req, res) => {
    let obj = {
        GroupA: []
    };
    
    const address = req.query.address;

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata != "")
        obj = JSON.parse(rawdata);
    console.log(obj);

    for(let addr of obj.GroupA) {
        if(addr.address === address) {
            res.send("Already added");
            return;
        }
    }

    let flag = await checkBalance(address);
    if(flag){
        obj.GroupA.push({address});
        let json = JSON.stringify(obj);
        console.log(json);
        fs.writeFile('GroupA.json', json, 'utf8', (err, result) => {  // WRITE
            if (err) {
                return console.error(err);
            } else {
                console.log(result);
                console.log("Success");
        }});
        res.send("true");
    } else {
        res.send("false");
    }
})

// add address to GroupB from GroupA
router.get('/api/addToGroupB', async (req, res) => {
    let str = await addToGroupB();
    res.send(str);
})

router.get('/api/removeFromGroupA', (req, res) => {
    const address = req.query.address;
    removeFromGroupA(address);
    res.send("Successfully removed!");
})

router.get('/api/removeFromGroupB', (req, res) => {
    const address = req.query.address;
    removeFromGroupB(address);
    res.send("Successfully removed!");
})

router.get('/api/checkAddressInGroupA', (req, res) => {
    const address = req.query.address;

    if(checkAddressInGroupA(address)) {
        res.send("true");
    } else {
        res.send("false");
    }
})

router.get('/api/checkAddressInGroupB', (req, res) => {
    const address = req.query.address;

    if(checkAddressInGroupB(address)) {
        res.send("true");
    } else {
        res.send("false");
    }
})

router.get('/api/addTgName', function(req, res){
    
    addTgName(req.query.address, req.query.tgName);
    res.send("Successfully added!");
})

router.get('/api/getTgName', function(req, res){
    res.send(getTgName(req.query.address));
})

router.get('/api/downloadGroup', async (req, res) => {
    let objA = {
        GroupA: []
    };

    let objB = {
        GroupB: []
    };

    let objC = {
        GroupC: []
    };

    let objDownA = {
        DownA: []
    };

    let objDownB = {
        DownB: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata != "")
        objA = JSON.parse(rawdata);
    console.log(objA);

    rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupB.json'));
    if(rawdata != "")
        objB = JSON.parse(rawdata);
    console.log(objB);

    rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupC.json'));
    if(rawdata != "")
        objC = JSON.parse(rawdata);
    console.log(objC);

    for(let addrA of objA.GroupA) {
        let balance = await tokenContract.methods.balanceOf(addrA.address).call();
        let heroBalance = await heroContract.methods.balanceOf(addrA.address).call();
        let amount = (balance / 10**9) + heroBalance * 18000;
        let tgName = getTgName(addrA.address);
        objDownA.DownA.push({address: addrA.address, amount, tgName});
    }
    
    objDownA.DownA.sort(function(a, b) {
        return (b.balance + b.heroBalance * 18000) - (a.balance + a.heroBalance * 18000);
    });
    
    console.log("------------------------");
    console.log(objDownA);

    for(let addrB of objB.GroupB) {
        let balance = await tokenContract.methods.balanceOf(addrB.address).call();
        let heroBalance = await heroContract.methods.balanceOf(addrB.address).call();
        let amount = (balance / 10**9) + heroBalance * 18000;
        let tgName = getTgName(addrB.address);
        objDownB.DownB.push({address: addrB.address, amount, tgName});
    }

    objDownB.DownB.sort(function(a, b) {
        return (b.balance + b.heroBalance * 18000) - (a.balance + a.heroBalance * 18000);
    });

    console.log("------------------------");
    console.log(objDownB);


    converter.json2csv(objDownA.DownA, (err, csv) => {
        if (err) {
            throw err;
        }
    
        // print CSV string
        console.log(csv);
    
        // write CSV to a file
        fs.writeFileSync('GroupA.csv', csv);
        
    });

    converter.json2csv(objDownB.DownB, (err, csv) => {
        if (err) {
            throw err;
        }
    
        // print CSV string
        console.log(csv);
    
        // write CSV to a file
        fs.writeFileSync('GroupB.csv', csv);
        
    });

    res.send("Successfully downloaded!");
});


app.use("/", router);
app.listen(3000);
console.log("localhost:3000 is listening")