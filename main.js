const discord = require("discord.js")
const fs = require("fs")
const client = new discord.Client()
var guild;var scoreChannel;var members;var scoreMessage
var fileSave = __dirname + "/save.json";
var saveDir = __dirname + "/saves/"
const roles = [
    { id: "550342067210027030", seuil: 75000, name: "elite" },
    { id: "550343591239614467", seuil: 50000, name: "batracien" },
    { id: "550343935869059073", seuil: 25000, name: "abu yaqub" },
    { id: "550343939744333836", seuil: 20000, name: "erudit" },
    { id: "550343942437077002", seuil: 15000, name: "wakam" },
    { id: "550343944018329611", seuil: 10000, name: "cresus" },
    { id: "550344215666753538", seuil: 5000, name: "damoiseau" },
    { id: "550344219341094932", seuil: 1500, name: "strapontin" },
    { id: "550344217524961310", seuil: 500, name: "cul-terreux" },
    { id: "546359889014947850", seuil: 0, name: "subalternes" }
  ];
client.on("ready",()=>{
    console.log("bot started...")
    guild = client.guilds.cache.find(e=>e.id=="532956456492728320");
    scoreChannel = guild.channels.cache.array().find(e=>e.name=="classement_points")
    scoreChannel.messages.fetch({limit:100}).then(messages=>{
        messages.array().forEach(async (message)=>{
            await message.delete()
        })
    })
    members = loadMemb()
    checkMemb()
    setInterval(()=>save(),30*1000);
    setInterval(()=>savefile(),1000*60*60)//toutes les heures
    setInterval(()=>up(),1000) 
    setInterval(()=>upRoles(),1000);
    setInterval(()=>{
        if(scoreMessage)
            scoreMessage.edit(makeEmbed())
        else{
            scoreChannel.send(makeEmbed()).then(msg=>scoreMessage = msg)
        }
    },3000)
})
client.on("guildMemberAdd",()=>{
    checkMemb()
})
function loadMemb(){
    try{
        var txt = fs.readFileSync(fileSave,"utf8");
        var m = JSON.parse(txt)
    }
    catch{
        try{
            var files = fs.readdirSync(saveDir)
            var m = JSON.parse(saveDir + files[0],"utf8")
        }catch{
            var m = [];
        }
    }
    return m;
}
function checkMemb(){
    guild.members.cache.forEach(e => {
        if(!members.map(me=>me.id).includes(e.id)&&!e.user.bot){
            var name = e.nickname || e.user.username
            members.push({name:name,score:0,id:e.id});
        }
    });
}
function save(){
    fs.writeFileSync(fileSave,JSON.stringify(members));
}
function savefile(){
    fs.writeFileSync(
        saveDir + new Date().toLocaleString().replace(/ /gi, '_').replace(/:/gi, '.').replace(/\//gi,'-') + ".json",
        JSON.stringify(members))
}
function up(){
    members.forEach(memb=>{
        if(inVocal(memb))
            memb.score += 1/60;
    })
    console.log(members.map(e=>e.score))
}
function upRoles(memb){
    members.forEach(memb=>{
        var guildmember = guild.members.cache.find(e=>e.id==memb.id)
        for (var i = 0; i < roles.length; i++) {//on parcours les roles
          const role = roles[i];
          if (memb.score >= role.seuil) {//role max
            if (!guildmember.roles.cache.array().map(e => e.id).includes(role.id)){//si a pas deja le role
                guildmember.roles.remove(guild.roles.cache.filter(e=>roles.map(e=>e.id).includes(e.id))).then(()=>{//on retire les roles
                guildmember.roles.add(role.id);//on ajoute le bon
                })
                console.log("adding role", role.seuil)
            }
            break;
          }
        }  
})
}

function makeEmbed(){
    members.sort((a,b)=>b.score-a.score);
    var noms = []
    for(var i=0;i<15;i++){
        const member = members[i]
        if(!member)break;//-de15 pers dans le serv
        if(inVocal(member))
            noms.push("__"+members[i].name+"__")
        else
            noms.push(members[i].name)
         
    }

    var msg = new discord.MessageEmbed()
    msg.setAuthor(
        "helibot",
        "https://images-na.ssl-images-amazon.com/images/I/615Q1Ms%2Bb4L._SX425_.jpg"
      )
      msg.setColor(0)
      msg.setTitle("scores des 15 premiers :")
      .setTimestamp()
    //   msg.addField('\u200b', '\u200b')
    msg.addField("**Top #1:**  "+ noms[0] + ":", "__**" + Math.round(members[0].score) + "**__", true)
    // msg.addField('\u200b', '\u200b')
    try{msg.addField("**Top #2**  " + noms[1] + ":","**" + Math.round(members[1].score) + "**",true)}catch{}
    // msg.addField('\u200b', '\u200b')
    try{msg.addField("**Top #3**  " + noms[2] + ":","**" + Math.round(members[2].score) + "**",true)}catch{}
    for(let i=3;i<15;i++){
        try{msg.addField("**#"+(i+1)+"**  " + noms[i] + ":","**" + Math.round(members[i].score) + "**",true)}catch{}
    }
    return msg
}

function inVocal(memb){
    try{
        var guildmember = guild.members.cache.find(e=>e.id==memb.id)
    }catch{
        var guildmember = memb;
    }
    if(!guildmember.voice)return false
    if(guildmember.voice.channel == null) return false//pas dans un channel
    if(!guildmember.voice.type == "voice") return false//si pas dans vocal
    if(guildmember.voice.channel.members.array().filter(e=>!e.user.bot).length == 1) return false //si tout seul dans channel ou tt seul avec bot(s)
    if(guildmember.voice.selfMute || guildmember.voice.selfDeaf)return false//si sourd ou muet
    return true
}
client.login(require("./token.js"))