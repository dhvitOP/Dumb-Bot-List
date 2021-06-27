/*=======================================================================================*/
const Discord = require("discord.js");
const { Client, Collection } = require("discord.js");
const client = (global.Client = new Client())
const config = require("./config.js");
global.config = config;
const fs = require("fs");
const fetch = require("node-fetch");
client.htmll = require('cheerio');
const db = require("quick.db");
let botsdata = require("./src/database/models/botlist/bots.js");
const ms = require("parse-ms");
let serversdata = require("./src/database/models/servers/server.js");
/*=======================================================================================*/



/*=======================================================================================*/
require('events').EventEmitter.prototype._maxListeners = 100;
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./src/commands/");
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
}); 
client.on('message', async message => {
    let p = config.bot.prefix
    let client = message.client;
    if (message.author.bot) return;
    
    if(db.fetch(`savefor_${message.guild.id}`) === true)
    {
         let testdata = await serversdata.findOne({ serverID: message.guild.id });
         if(!testdata)
         {
           return;
         }
      var link = await message.channel.createInvite({ maxAge: 0 });

     var link = await link.code;
       await serversdata.findOneAndUpdate({serverID: message.guild.id}, {$set: {invitelink: `https://discord.gg/${link}`}});
       db.delete(`savefor_${message.guild.id}`);
    }
    if (!message.content.startsWith(p)) return;
    let params = message.content.split(" ").slice(1);
    const args = message.content.slice(p.length).trim().split(/ +/g);
      const cmd = args.shift().toLowerCase();
    

    let command = client.commands.get(cmd)
  if(!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
    command.run(client, message, params, p, args);
    }
})
/*=======================================================================================*/


/*=======================================================================================*/
client.on('presenceUpdate', async(oldPresence, newPresence) => 
{
  
   var botdata = await botsdata.findOne({ botID: newPresence.userID });
      if(!botdata)
      {
        return
      }

    if(newPresence.guild.id == "849623732871757854")
    {
     if(botdata.status == "UnApproved")

     {
       return;
     }

  if (newPresence.status === 'offline') {
   
    var uptimerate = db.fetch(`rate_${newPresence.userID}`);
  
if(!uptimerate)
      {
             var uptimerate = "99";
             db.set(`rate_${newPresence.userID}`, 99)
      }
      
      var timetest = db.fetch(`timefr_${newPresence.userID}`)
      var timetest = Date.now() - timetest;
      let breh = db.fetch(`lastoffline`)
     
      if(timetest > 60000)
      {
      
         db.set(`presence_${newPresence.userID}`, "offline")
          db.set(`timefr_${newPresence.userID}`, Date.now())
       db.add(`offlinechecks_${newPresence.userID}`, 1)
        if(breh === newPresence.userID)
      {
        return;
      }
         
       client.channels.cache.get("851339099528364081").send(`<@${newPresence.userID}> is Offline And Uptime Rate - ${uptimerate}%`) 

      }
      
      
    
    
      
      
  }
  if (newPresence.status === 'online') {
    let check = db.fetch(`presence_${newPresence.userID}`);
    if(check === "offline")
    {

      var uptimerate = db.fetch(`rate_${newPresence.userID}`);
   
   if(!uptimerate)
      {
             var uptimerate = "99";
      }
        
        db.delete(`presence_${newPresence.userID}`, "online")
           let breh1 = db.fetch(`lastoffline`);
         if(breh1 === newPresence.userID)
      {
        return db.delete(`lastoffline`);
      }
        let to2 = db.fetch(`timefr_${newPresence.userID}`);
        var timeleft = await ms(Date.now() - to2);
        var hour = timeleft.hours;
       var minutes = timeleft.minutes;
       var seconds = timeleft.seconds;
    
       db.set(`lastoffline`, newPresence.userID);
       client.channels.cache.get("851339099528364081").send(`<@${newPresence.userID}> is Online And Uptime Rate - ${uptimerate}% And was Offline for ${hour}h ${minutes}m ${seconds}s`) 
       db.set(`timefr_${newPresence.userID}`, Date.now())
    }
    }
    
    }
    

})
client.on('ready',async () => {
   
    setInterval(async() =>{
      
      var botdata = await botsdata.find();
      if(!botdata)
      {
        return
      }
      botdata.forEach(bot => {
        
           db.add(`checks_${bot.botID}`, 1);
           var check = db.fetch(`presence_${bot.botID}`);
           if(check === "offline")
           {
           
             db.add(`offlinechecks_${bot.botID}`, 1)
             
           }
        
      })
    }, 120000);
    // random bots
    setInterval(async() =>{
      
      var botdata = await botsdata.find();
      if(!botdata)
      {
        return
      }
      
        let randomBots = botdata.filter(a => a.certificate === "Certified")
        randomBots.forEach((val, key) => {
          randomIndex = Math.ceil(Math.random()*(key + 1));
          randomBots[key] = randomBots[randomIndex];
          randomBots[randomIndex] = val;
        });
    
    
        for(let i = 0; i < randomBots.length; i++) {
        if (i === 1) break;
        let labBots = randomBots[i];
      if(labBots) {
    
     let bot = labBots;
     let b = labBots;
      let website = b.website ?  " | [Website]("+b.website+")" : "";
   let github = b.github ? " | [Github]("+b.github+")" : "";
   let discord = b.support ? " | [Support Server]("+b.support+")" : "";
   let coowner;
   if(!b.coowners.length <= 0) {
     coowner = b.coowners.map(a => "<@"+a+">").join("\n");
   } else {
     coowner = "";
   }
   var checking = db.fetch(`rate_${bot.botID}`);
   if(!checking)
   {
     var checking = "100";
   }
       var check = db.fetch(`presence_${bot.botID}`);
       if(!check)
       {
         var check = "Online";
       }
   const embed = new Discord.MessageEmbed()
   .setTitle("Every 12 Hours Dumb Bot List Choose an Random Certified Bot to Make It More Famoues")
   .setThumbnail(b.avatar)
   .setAuthor(b.username+"#"+b.discrim, b.avatar)
   .setDescription("**[Vote for the bot named "+b.username+"#"+b.discrim+" in Dumb Bot List.](https://dumbbotlist.tk/bot/"+b.botID+"/vote)**")
   .addField("ID", b.botID, true)
   .addField("Username", b.username, true)
   .addField("Discriminator", b.discrim, true)
   .addField("Votes", b.votes, true)
   .addField("Certificate", b.certificate, true)
   .addField("Short Description", b.shortDesc, true)
   .addField("Status", check, true)
   .addField("Uptime", `${checking}%`, true)
   .setColor("#7289da")
   .addField("Server Count", `${b.serverCount || "N/A"}`, true)
   .addField("Owner(s)", `<@${b.ownerID}>\n${coowner.replace("<@>", "")}`, true)
   .addField("Links", `[Invite](https://discord.com/oauth2/authorize?client_id=${b.botID}&scope=bot&permissions=0)${website}${discord}${github}`, true)
   client.channels.cache.get("851666771211845652").send(embed)
      }
        }

    }, 43200000);
    setInterval(async() =>{
      
      var botdata = await botsdata.find();
      if(!botdata)
      {
        return
      }
      botdata.forEach(bot => {
        var checking = db.fetch(`rate_${bot.botID}`);
        if(checking)
        {
      
           var check = db.fetch(`presence_${bot.botID}`);
           db.add(`checks_${bot.botID}`, 1)
           if(check === "offline")
           {
             if(checking < 40)
             {
               let done = db.fetch(`don_${bot.botID}`);
               if(done == "yes")
               {
                 return;
               }
                let declineembed = new Discord.MessageEmbed()
             .setTitle("Bot Deleted")
             .setDescription(`Reason: Bot Uptime was Gone Under 50%\n Moderator: ${client.user.username}\n Bot: <@${bot.botID}>\n Owner: <@${bot.ownerID}>`)
             .setFooter("Embed Logs of Administration")
               client.channels.cache.get("849623735047946303").send(declineembed)
               if(client.guilds.cache.get(config.server.id).members.fetch(bot.ownerID))
               {
               client.users.cache.get(bot.ownerID).send(`Your bot named **<@${bot.botID}>** has been deleted.\nReason: **Uptime was gone under 50%**\nAuthorized: **${client.user.username}**`)
               
                  botsdata.deleteOne({ botID: bot.botID, ownerID: bot.ownerID, botid: bot.botID })
                  db.set(`don_${bot.botID}`, "yes");
             }
              let guild = client.guilds.cache.get(config.server.id);
        var bot1 = guild.member(bot.botID)
        bot1.kick()
             } 
            db.add(`offlinechecks_${bot.botID}`, 1)
             
             db.set(`rate_${bot.botID}`, checking - 1)
           }
        }
      })
    }, 3600000);
    

    console.log("(!) Bot successfully connected to discord.");
    let botsSchema = require("./src/database/models/botlist/bots.js");
    const bots = await botsSchema.find();
    client.user.setPresence({ activity: { type: 'WATCHING', name: 'dumbbotlist.tk | '+bots.length+' bots' }, status: "idle" });
})
/*=======================================================================================*/



/*=======================================================================================*/
const claudette = require("./src/database/models/uptime.js")
    setInterval(async() => {
        claudette.find({}, function async (err, docs) {
            if(err) console.log(err)
            if(!docs) return;
            docs.forEach(docs => {
                fetch(docs.link).catch()
            })
        })
    }, 15000)

client.on('guildMemberRemove', async member => {
    if(member.guild.id !== config.serverID) return
        claudette.find({ userID: member.id }, async function (err,docs) {
            await docs.forEach(async a => {
            await claudette.findOneAndDelete({ userID: member.id, code: a.code, server: a.server, link: a.link })
            })
        })
    })
/*=======================================================================================*/


/*=======================================================================================*/

    client.on('ready', async () => {
        setInterval(async () => {
          var votes = require('./src/database/models/botlist/vote.js')
            let datalar = await votes.find()
            if(datalar.length <= 0) return
            datalar.forEach(async a => {
                let süre = a.ms - (Date.now() - a.Date)
                if(süre > 0) return
                await votes.findOneAndDelete({ bot: a.bot, user: a.user })
            })
        }, 30000)
         setInterval(async () => {
          var votes = require('./src/database/models/botlist/bots.js')
            let datalar = await votes.find()
            if(datalar.length <= 0) return
            datalar.forEach(async a => {
              if(!a.Date3)
              {
                a.Date3 = Date.now();
                await votes.findOneAndUpdate({ botID: a.botID }, {$set: {Date3: Date.now()}})
              }
                let süre = 604800000 -(Date.now() - a.Date3)
                if(süre > 0) return
                await votes.findOneAndUpdate({ botID: a.botID }, {$set: {votes: 0}})
                await votes.findOneAndUpdate({ botID: a.botID }, {$set: {Date3: Date.now()}})
            })
        }, 604800000)
})

    client.on('ready', async () => {
        setInterval(async () => {
          var votes = require('./src/database/models/servers/bump.js')
            let datalar = await votes.find()
            if(datalar.length <= 0) return
            datalar.forEach(async a => {
                let süre = a.ms - (Date.now() - a.Date)
                if(süre > 0) return
                await votes.findOneAndDelete({ server: a.server, user: a.user })
            })
        }, 30000)
})
    client.on('ready', async () => {
        setInterval(async () => {
          var votes = require('./src/database/models/servers/vote.js')
            let datalar = await votes.find()
            if(datalar.length <= 0) return
            datalar.forEach(async a => {
                let süre = a.ms - (Date.now() - a.Date)
                if(süre > 0) return
                await votes.findOneAndDelete({ server: a.server, user: a.user })
            })
        }, 30000)
})
/*=======================================================================================*/
client.on('guildCreate', async(guild) => {

 db.set(`savefor_${guild.id}`, true);
})

/*=======================================================================================*/
client.on('guildMemberRemove', async member => {
    const botlar = require('./src/database/models/botlist/bots.js')
    let data = await botlar.findOne({ ownerID: member.id })
    if(!data) return
    let find = await botlar.find({ ownerID: member.id })
    await find.forEach(async b => {
        member.guild.members.cache.get(b.botID).kick();
        await botlar.deleteOne({ botID: b.botID })
    })
})
client.on("guildMemberAdd", async (member) => {
  
 
 


     const botsdata = require("./src/database/models/botlist/bots.js");
     if(member.guild.id == config.server.id)
     {
     const botdata = await botsdata.findOne({ botID: member.id })
    if(!botdata)
    {
      return;
    } 
    else {
      let guild = client.guilds.cache.get(config.server.id);
      if(botdata.status == "Approved")
      {
        guild.member(member.id).roles.add("850961502721933353")
        guild.member(member.id).roles.add(config.roles.botlist.bot)
        guild.member(botdata.ownerID).roles.add(config.roles.botlist.developer)
        guild.member(member.id).roles.remove("856763266486501376")
      } else if(botdata.status == "UnApproved")
      {
        client.channels.cache.get(config.channels.botlog).send("Someone invited a Unapproved bot here")
        return member.kick("bot no approved yet")
      } else if(botdata.certificate == "Certified")
      {
         guild.member(member.id).roles.add(config.roles.botlist.certified_bot)
        guild.member(botdata.ownerID).roles.add(config.roles.botlist.certified_developer)
      }
    }
     }
});
/*=======================================================================================*/
client.on("guildMemberAdd", async (member) => {
  
 
 
 let testtolel =  await serversdata.findOne({serverID: member.guild.id});
 if(!testtolel)
 {
   return;
 }
  let xd = client.guilds.cache.get(member.guild.id);
  let forn = guild.members.cache.filter(member => !member.user.bot)
                .size;
   await serversdata.findOneAndUpdate({serverID: member.guild.id}, {$set: {users: `${forn}`}});


})

client.on("guildMemberRemove", async (member) => {
  
 
 
 let testtolel =  await serversdata.findOne({serverID: member.guild.id});
 if(!testtolel)
 {
   return;
 }
  let xd = client.guilds.cache.get(member.guild.id);
  let forn = guild.members.cache.filter(member => !member.user.bot)
                .size;
   await serversdata.findOneAndUpdate({serverID: member.guild.id}, {$set: {users: `${forn}`}});


})

/*=======================================================================================*/
require("./src/server.js")(client);
require("./src/database/connect.js")(client);
client.login(config.bot.token);
/*=======================================================================================*/