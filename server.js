var express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  port = 8000,
  app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/calendar');

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'name required'] },
  email: { type: String, required: [true, 'email required'] },
}, { timestamps: true });
var User = mongoose.model('User', UserSchema)

var GroupSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'group name requied'] },
  members: [{type: Schema.Types.ObjectId, ref: 'User'}],
}, { timestamps: true });
var Group = mongoose.model('Group', GroupSchema)

// Get all users
app.get('/users', function(req, res){
  User.find(function(err, data){
    if(err) console.log(err);
    res.send(data);
  }).sort({'createdAt': -1})
})
// Get all groups
app.get('/groups', function(req, res){
  Group.find(function(err, data){
    if(err) console.log(err);
    res.send(data);
  }).sort({'createdAt': -1})
})

// Form for creating users
app.get('/users/new', function(req, res){
  res.render('users')
})
// Create new user if not exist
app.post('/users/create', function(req, res){
  User.find({email: req.body.email}, function(err, users){
    if (users.length == 0) {
      User.create(req.body, function(req, res){
        if(err) console.log(err);
      })
    }
    res.redirect('/users')
  })
})

// Form for creating groups
app.get('/groups/new', function(req, res){
  res.render('group')
})

// Create new group
app.post('/groups/create', function(req, res){
  Group.find({name: req.body.name}, function(err, data){
    if(err) {console.log(err);}
    if (data.length == 0){
      Group.create(req.body, function(err, data){
        if(err) {console.log(err);}
      })
    }
    res.redirect('/groups')
  })
})

// Get all users from a group
app.get('/users/:group_name', function(req, res){
  Group.findOne({name: req.params.group_name})
  .populate('members')
  .exec(function(err, group){
    res.send(group.members);
  })
})

// Form for new groups
app.get('/groups/members/new', function(req, res){
  res.render('members')
})

// Create group members
app.post('/members/:name', function(req, res){
  Group.findOne({name: req.params.name}, function(err, group){
    User.find({email: req.body.email}, function(err, user){
      if (user.length > 0) {
        console.log("inside if");
        group.members.push(user[0])
      } else {
        console.log("inside else");
        var user = new User(req.body);
        group.members.push(user)
        user.save(function(err){})
      }
      group.save(function(err){if(err) {console.log(err);}})
    })
  })
  res.redirect('/groups')
})

app.listen(port, function(){
  console.log('running on', port);
})