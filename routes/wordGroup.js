var express = require("express");
const { generateResponse } = require("../utils/utils");
const { wordGroupModel } = require("../schemas/wordGroupSchema");
const { userSettingModel } = require("../schemas/userSettingsSchema");
var router = express.Router();
/* GET users listing. */
router.get("/", async function (req, res, next) {
  let user = req.tUser;
  let t = await wordGroupModel.getMyGroup(user._id);
  res.json(generateResponse(t));
});

router.post("/", async function (req, res, next) {
  let user = req.tUser;
  let body = req.body;
  Object.assign(body, { userID: user._id, parentGroupID: '' });
  let t = await wordGroupModel.create(body);
  res.json(generateResponse(t));
});

router.post('/detail', async function (req, res, next) {
  let body = req.body
  if (!body.groupID) res.json(generateResponse('', 400))
  let g = await wordGroupModel.findById({ _id: body.groupID })
  res.json(generateResponse(g))
})
router.delete("/", async function (req, res, next) {
  let id = req.body.id;
  let group = await wordGroupModel.findById(id);
  if (group.wordCount != 0) {
    res.json(generateResponse("", 400, "Contains words."));
  } else {
    let doc = await wordGroupModel.findByIdAndDelete(id).exec();
    await userSettingModel.deleteOne({ defaultGroupID: id });
    res.json(generateResponse(doc));
  }
});
router.get('/public', async function (req, res, next) {
  let groupList = await wordGroupModel.find({ isPublic: true })
  res.json(generateResponse(groupList))
})

router.post('/copy', async function (req, res, next) {
  let u = req.tUser
  let b = req.body
  if (!b.groupID) { res.json(generateResponse('', 400, 'error')); return }
  let f = await wordGroupModel.findOne({ _id: b.groupID }).lean()
  console.log(f);
  let o = Object.assign({}, f)
  delete o._id
  // let n = await wordGroupModel.create(o)
  // n.name = 'b'
  // n.save()
  console.log(o);
  res.json(generateResponse())
})

router.post('/update', async function (req, res, next) {
  let d = req.body
  let r = await wordGroupModel.findOneAndUpdate({ _id: d.groupID }, d, { returnDocument: 'after' })
  res.json(generateResponse(r))
})

router.post('/children', async function (req, res, next) {
  let d = req.body
  let r = await wordGroupModel.find({ parentGroupID: d.parentGroupID })
  res.json(generateResponse(r))
})

router.post('/setparent', async function (req, res, next) {
  let d = req.body
  let parentGroupID = d.parentGroupID
  let childGroupID = d.childGroupID
  let c = await wordGroupModel.findById(childGroupID)
  c.parentGroupID = parentGroupID
  c.save()
  res.json(generateResponse(c))
})

module.exports = router;
