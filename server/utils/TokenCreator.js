


function createToken(length){
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var token = '';
  for (var i = 0; i < length; i++) {
    token += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return token;
}

module.exports=createToken;
