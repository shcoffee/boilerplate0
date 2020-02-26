const express = require('express')
const app = express()
const port = 5000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key');
const { auth } = require('./middleware/auth')
const { User } = require('./models/User')

//application/x-www-form-urlencodedタイプのデータ分析のoption
app.use(bodyParser.urlencoded({extended:true}));
//application/jsonタイプのデータ分析のoption
app.use(bodyParser.json());

app.use(cookieParser());

mongoose.connect(config.mongoURI, {
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false
}).then(() => console.log("mongoDB connected..."))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello Change World!'))

app.post('/api/user/register', (req,res) => {
  const user = new User(req.body)
  //userモーデルにデータ保存
  user.save((err, userInfo) => {
    if (err) return res.json({success:false, err})
    return res.status(200).json({
      success: true
    })
  })
})

app.post('/api/user/login', (req,res) => {
  User.findOne({email : req.body.email}, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess : false,
        message : 'このメールアドレスではIDが登録されていません。'
      })
    }
    console.log('req.body.password:'+req.body.password);
    user.comparePassword(req.body.password, (err, isMatch) => {
      console.log('isMatch2:'+isMatch);
      if(!isMatch) 
        return res.json({loginSuccess:false, message:'パスワードが正しくありません。'})
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)
          res.cookie('x_auth', user.token)
          .status(200)
          .json({loginSuccess:true, userId: user._id})
      })
    })
  })
})

app.get('/api/user/auth', auth, (req, res) => {
  res.status(200).json({
    _id : req.user._id,
    isAdmin : req.user.role === 0 ? false : true,
    isAuth : true,
    email : req.user.email,
    name : req.user.name,
    lastname : req.user.lastname,
    role : req.user.role,
    image : req.user.image
  })
})

app.get('/api/user/logout', auth, (req, res) => {
  User.findOneAndUpdate({_id : req.user._id},
    {token : ""},
    (err, user) => {
      if (err) return res.json({success : false, err});
      return res.status(200).send({
        success : true
      })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))