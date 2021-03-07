const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const client = new discord.Client();


//サーバー起動
http.createServer(function(req, res){
 if (req.method == 'POST'){
   var data = "";
   req.on('data', function(chunk){
     data += chunk;
   });
   req.on('end', function(){
     if(!data){
        console.log("No post data");
        res.end();
        return;
     }
     var dataObject = querystring.parse(data);
     console.log("post:" + dataObject.type);
     if(dataObject.type == "wake"){
       console.log("Woke up in post");
       res.end();
       return;
     }
     res.end();
   });
 }
 else if (req.method == 'GET'){
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Discord Bot is active now\n');
 }
}).listen(3000);



client.on('ready', message =>{
 console.log('Bot準備完了～');
 client.user.setPresence({ activity: { name: '勉強時間' } });
 client.user.setStatus('計測中');
});



client.on('message', async message => {
  if (message.author.id == client.user.id){
    return;
  }

 //計測対象のチャンネルか確認
  if (message.channel.name.match(/timecard/)){
    if (message.content.match(/計測開始/)){
      let text = "今から勉強始めるンゴんね！！がんばれンゴ！！";
      sendMsg(message.channel, text);
      return;
    } 
    if (message.content.match(/計測終了/)){
      let study_time = await calcStudyTime(message.channel, message.author.id);
      let text = "おつかれンゴ！！おめえの勉強時間は" + study_time + "ンゴ！！";
      sendMsg(message.channel, text);
      return;
    } 
  }
});




if(process.env.DISCORD_BOT_TOKEN == undefined){
  console.log('DISCORD_BOT_TOKENが設定されていません。');
  process.exit(0);
}



client.login( process.env.DISCORD_BOT_TOKEN );



function sendReply(message, text){
 message.reply(text)
   .then(console.log("リプライ送信: " + text))
   .catch(console.error);
}



function sendMsg(ch, text, option={}){
 ch.send(text, option)
   .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
   .catch(console.error);
}



async function calcStudyTime(ch, target_user_id) {
  let finish_time = [];
  let start_time = [];
  i = 0;

  await ch.messages.fetch({ limit: 20 })
  .then(messages => (
      messages.some(function( v, index ) {
        if (i == 0 ) { 
          finish_time.push(v.createdAt.getTime());
        }
        if (v.author.id == target_user_id && v.content.match(/計測開始/) && start_time.length === 0 ) {
          start_time.push(v.createdAt.getTime());
        }
        i++;
      })
    )
  )
  .catch(console.error)
  
  let diff = finish_time[0] - start_time[0];
  let h = diff / (1000 * 60 * 60);
  let m =  diff / (1000 * 60 );
  let stury_time = Math.floor(h)  + "時間" + Math.floor(m) + "分";
  
  return stury_time;
}
