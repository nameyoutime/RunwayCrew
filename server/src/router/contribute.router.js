const app = require('express');
const contributeSchema = require('../../schemas/contribute.schema')

let mongoose = require('mongoose');
const contribute = require('../../schemas/contribute.schema');
const router = app.Router();

const Contribute = mongoose.model('contribute', contributeSchema)

router.get("/", async (req, res) => {
    const {id} = req.query;
    if(!id) {
        try {
            let data;
            data = await Contribute.find()
            res.status(200)
            res.send(data)
        } catch (err) {
            console.log(err)
            res.status(500)
            res.send({ mess: 'Server err' })
        }
    }
    else{
        try {
            res.send(await Contribute.findById(id))
        } catch (error) {
            console.log(err)
            res.status(500)
            res.send({ mess: 'Server err' })
        }
    }
});
router.post("/", async (req, res) =>{
    try {
        let {credit, email,exp, uid} = req.body
        const fluffy = new Contribute({
            achievements: [],
            credit: credit,
            email: email,
            exp:exp,
            uid: uid,
            skills: [],
        });
        await fluffy.save();
        res.status(201)
        res.send({ mess: 'Created' })
    } 
    catch (err) {
        console.log(err)
        res.status(500)
        res.send({ mess: 'Server err' })
    }
});
router.put("/", async(req,res)=>{
    const id = req.body.id;
    const credit = req.body.credit;
    const email = req.body.email;
    const exp = req.body.exp;
    const uid = req.body.uid;
    try {
        let resdb = await Contribute.findByIdAndUpdate(id, 
            {"credit":credit,
             "exp":exp,
             "email": email,
             "uid":uid
            }, {rawResult: true});
            if(!resdb.lastErrorObject.updatedExisting){
                res.send({ mess: `[${req.body.id}] not found` })
            }
            else{
                res.send({ mess: `[${req.body.id}] updated` })
            }
    } catch (error) {
        console.log(error)
        res.status(400)
        res.send("Server error")
    }
})
router.delete("/", async (req,res)=> {
    const id = req.query.id;

    try{
        await Contribute.findByIdAndDelete(id, function (err, docs){
            if (err){
                console.log(err)
            }
            else{
                if(docs != null){
                    res.status(400)
                    res.send({mess:`ok`,docs})
                }else{
                    res.status(404)
                    res.send({mess: "Not Faund",docs })
                }
            }
        });
    } catch (error) {
        console.log(err)
        res.status(500)
        res.send({ mess: 'Server err' })
    }
})
module.exports = router;
    