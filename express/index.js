const express = require('express');
const Web3 = require('web3');
const path = require("path");
const fs = require('fs');
const converter = require('json-2-csv');


const tokenABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, "tokenABI.json")));
const address = "0x4691f60c894d3f16047824004420542e4674e621";
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
const tokenContract = new web3.eth.Contract(tokenABI, address);


const router = express.Router();
const app = express();

async function checkBalance(address) {
    let flag = await tokenContract.methods.balanceOf(address).call();
    if (flag > 200000 * 10 ** 9) {
        return true;
    } else{
        return false;
    }
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
    let objA = {
        GroupA: []
    };

    let objB = {
        GroupB: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata == "") {
        res.send("GroupA is empty");
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
                    res.send("Already added");
                    return;
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
            res.send("Successfully added!");

        }
        
    }

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

router.get('/api/downloadGroup', function(req, res){
    let objA = {
        GroupA: []
    };

    let objB = {
        GroupB: []
    };

    let rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupA.json'));
    if(rawdata != "")
        objA = JSON.parse(rawdata);
    console.log(objA);

    rawdata = fs. readFileSync(path. resolve(__dirname, 'GroupB.json'));
    if(rawdata != "")
        objB = JSON.parse(rawdata);
    console.log(objB);

    converter.json2csv(objA.GroupA, (err, csv) => {
        if (err) {
            throw err;
        }
    
        // print CSV string
        console.log(csv);
    
        // write CSV to a file
        fs.writeFileSync('GroupA.csv', csv);
        
    });

    converter.json2csv(objB.GroupB, (err, csv) => {
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