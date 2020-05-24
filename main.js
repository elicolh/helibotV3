const discord = require("discord.js")
const fs = require("fs")
const client = new discord.Client()
var guild;var scoreChannel;var members;var scoreMessage
var fileSave = __dirname + "/save.json";
var saveDir = __dirname + "/saves/"
const roles = [
    {seuil:100000,id:"710969412093476925"},
    {seuil:50000,id:"710973545773138030"},
    {seuil:25000,id:"710972777170993164"},
    {seuil:10000,id:"710974492566093867"},
    {seuil:5000,id:"710974719448449118"},
    {seuil:1500,id:"710975161314181174"},
    {seuil:500,id:"710975465678045226"}
]
client.on("ready",()=>{
    console.log("bot started...")
    guild = client.guilds.cache.find(e=>e.id=="706503185266769990");
    scoreChannel = guild.channels.cache.array().find(e=>e.id=="711250866581274624")
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
        "Yasuke",
        "https://cdn.discordapp.com/attachments/706503185266769993/710985435609825360/diable-samurai-mascotte-e-sport_96628-73.png"
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
client.login(require("token"))