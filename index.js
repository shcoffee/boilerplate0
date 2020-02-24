const express = require('express')
const app = express()
const port = 5000
const mongoose = require('mongoose')
const { User } = require('./models/User')
const bodyParser = require('body-parser')

//application/x-www-form-urlencodedタイプのデータ分析のoption
app.use(bodyParser.urlencoded({extended:true}));
//application/jsonタイプのデータ分析のoption
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://blkctn:bc12345@bt0-6nhkl.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(() => console.log("mongoDB connected..."))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/register', (req,res) => {
  const user = new User(req.body)
  //userモーデルにデータ保存
  user.save((err, userInfo) => {
    if (err) return res.json({success:false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))