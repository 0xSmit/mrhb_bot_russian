require('dotenv').config();
const token = '2041890162:AAG8ln1LCqoFEDyK2K4KWtTL_KuCa_t_qYw';
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(token, { polling: true });
const { newUsers } = require('./models/');
const { oldUsers } = require('./models/');

const sequelize = require('sequelize');

const groupDetails = { username: 'marhabadefi_russia', id: -1001516398791 };
const mongoose = require('mongoose');
mongoose.connect(process.env.mongouri, { useNewUrlParser: !0, useUnifiedTopology: !0 });

bot.on('message', console.log);

const logs = require('./logging/models/logs');

bot.onText(/^\/start/, async (message) => {
  if (message.chat.type != 'private') return;
  log(message);
  const refById = message.text.split(' ')[1];

  // const time = Date.now();
  // if (time > 1640995200000)
  //   return bot.sendMessage(
  //     message.chat.id,
  //     `Thanks for showing interest in the telegram referral program, the referral program has now ended.`
  //   );
  if (refById) {
    const user = await oldUsers.findOne({ where: { id: message.from.id } });
    if (user) {
      let text =
        `*Поздравляю!*\nВам было направлено приглашение о вступлении в сообщество MRHB в России и СНГ.\n\n` +
        `Однако вы уже являетесь частью группы :-)`;
      bot.sendMessage(message.chat.id, text, { parse_mode: 'Markdown' });
    } else {
      const isMember = await checkIfMember(message.from.id);
      let text = `*Поздравляю!*\nВам было направлено приглашение о вступлении в сообщество MRHB в России и СНГ.\n\n`;

      //prettier-ignore
      const replyMarkup = !isMember
        ? {
            inline_keyboard: [
              [
                {
                  text: 'Принять приглашение',
                  url: `https://t.me/${groupDetails.username}`,
                },
              ],
            ],
          }
        : {};

      text += !isMember
        ? `Нажмите кнопку ниже, чтобы присоединиться к чату!\n`
        : `Однако вы уже являетесь частью группы :-)`;
      if (!isMember && refById != message.from.id) await logUserInvite(refById, message.from);
      bot.sendMessage(message.chat.id, text, {
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      });
    }
  } else {
    const { first_name: firstName, id } = message.from;
    let text = `Привет, я твой дружелюбный бот MRHB 🤖 

Структура вознаграждения -
1-ое место - 150 USDT
2-ое место - 50 USDT 
3-е место - 25 USDT 

Для успешной регистрации обязательно следуйте приведенным ниже инструкциям👇

Введите или нажмите /myrefs, чтобы получить реферальную ссылку. Перешлите приглашение своим потенциальным рефералам для участия в кампании.

Введите или нажмите /toprefs, чтобы увидеть лучшего участника сообщества с наибольшим количеством рефералов.`;
    // bot.sendMessage(message.chat.id, text, {
    //   parse_mode: 'Markdown',
    //   // caption: text,
    // });

    bot.sendPhoto(
      message.chat.id,
      `AgACAgIAAxkBAALzZ2Nqa87QmDOwuyqcpXu2XyrT-anbAAIcvzEbf1xQS22ahGr2x5cGAQADAgADeQADKwQ`,
      {
        caption: text,
      }
    );
  }
});

function sendCompMessage() {
  let text = `​​💎 Приглашайте по реферальной ссылке и зарабатывайте $MRHB!
 
MRHBDeFi запустил реферальную кампанию в Telegram для сообщества в России и СНГ — это ваша возможность получить вознаграждение, пригласив своих друзей в это больше сообщество.

Не забудьте рассказать друзьям о Sahal Wallet. Он запущен и доступен как в playmarket, так и в apple store.

Телеграм MRHB для сообщества в России и СНГ: https://t.me/marhabadefi_russia 
 
Пригласите друзей в чат Telegram, чтобы выиграть токены MRHB. 

Для начала посетите нашего бота Telegram по ссылке ниже и следуйте инструкциям на экране. Выполняйте простые задания и получайте награды

Структура вознаграждения (токены будут выплачены в MRHB):
1-ое место - 150 USDT
2-ое место - 50 USDT 
3-е место - 25 USDT  
 
➡️ Готовы начать? Нажмите на ссылку: https://t.me/mrhb_comp_bot

➡️ Член сообщества с наибольшим количеством рефералов выиграет 150 USDT 

➡️ Победитель будет объявлен через 15 дней. Так что начинайте распространять свои реферальные ссылки!`;

  bot.sendPhoto(
    groupDetails.id,
    `AgACAgIAAxkBAALzZ2Nqa87QmDOwuyqcpXu2XyrT-anbAAIcvzEbf1xQS22ahGr2x5cGAQADAgADeQADKwQ`,
    {
      disable_notification: true,
      disable_web_page_preview: true,
      caption: text,
    }
  );
}

sendCompMessage();

setInterval(sendCompMessage, 1000 * 60 * 60 * 5);

async function reconcile() {
  const users = await newUsers.findAll({
    where: {
      status: true,
    },
  });
  const leftUsers = [];
  for (let item of users) {
    if (!(await checkIfMember(item.id))) leftUsers.push(item.id);
  }
  await newUsers.update(
    {
      status: false,
    },
    {
      where: {
        id: leftUsers,
      },
    }
  );
}

async function reconcile2() {
  const users = await newUsers.findAll({
    where: {
      status: null,
    },
  });
  const existingUsers = [];
  for (let item of users) {
    if (await checkIfMember(item.id)) existingUsers.push(item.id);
  }
  await newUsers.update(
    {
      status: true,
    },
    {
      where: {
        id: existingUsers,
      },
    }
  );
}

async function checkUserExists(id) {
  const isMember = await checkIfMember(id);
  if (isMember) {
    newUsers.update(
      {
        status: true,
      },
      {
        where: {
          id,
        },
      }
    );
  }
}

reconcileAll();

async function reconcileAll() {
  await reconcile2();
  await reconcile();
}
setInterval(reconcileAll, 1000 * 60 * 10);

bot.on('new_chat_members', (message) => {
  if (message.chat.id != groupDetails.id) return;
  log(message);
  bot.deleteMessage(message.chat.id, message.message_id);
  if (message.from.id != message.new_chat_member.id) {
    //user is added;
    for (let item of message.new_chat_members) logUserAdded(message.from.id, item);
    return;
  }
  //user joined himself
  logUserJoined(message.new_chat_member);
});

async function log(message) {
  try {
    logs.create({
      chatId: message.chat.id,
      messageId: message.message_id,
      message,
    });
  } catch (error) {
    console.log(error);
  }
}

async function logUserJoined(user) {
  const { id } = user;
  const dbUser = await newUsers.findOne({
    raw: true,
    where: {
      id,
    },
  });
  if (dbUser) {
    await newUsers.update(
      {
        status: true,
      },
      {
        where: {
          id,
        },
      }
    );
  }
}

process.on('unhandledRejection', (result, error) => {
  // process.exit(1);
  console.log(result);
});

async function logUserAdded(refById, user) {
  const { id, first_name: firstName } = user;
  const oldUserInfo = await oldUsers.findOne({
    raw: true,
    where: {
      id,
    },
  });
  if (!oldUserInfo) {
    await newUsers.upsert({
      id,
      refById,
      firstName,
      refType: 'added',
      status: true,
    });
  }
}

async function logUserInvite(refById, user) {
  const { id, first_name: firstName } = user;
  console.log(id, firstName, refById);
  await newUsers.upsert({
    id,
    refById,
    firstName,
    refType: 'link',
    status: null,
  });
  setTimeout(() => {
    checkUserExists(id);
  }, 15 * 1000);
  setTimeout(() => {
    checkUserExists(id);
  }, 30 * 1000);
}

bot.onText(/^\/myrefs/, async (message) => {
  if (message.chat.type != 'private') return;
  const { id } = message.from;
  const data = await newUsers.findAll({
    where: {
      refById: id,
    },
    attributes: ['refType', 'status', [sequelize.fn('count', sequelize.col('*')), 'count']],
    group: [['ref_type'], ['status']],
  });

  let addedCount = 0,
    linkCount = 0,
    leftCount = 0,
    unJoinedCount = 0;

  for (let item of data) {
    if (item.refType === 'added') addedCount += item.count;
    else if (item.refType === 'link') linkCount += item.count;
    if (item.status === 0) leftCount += item.count;
    else if (item.status == null) unJoinedCount += item.count;
  }

  let text =
    `*Рефералы и ссылки*\n\n` +
    `\`Количество рефералов по ссылкам : ${linkCount || 0}\n` +
    `Добавлено напрямую   : ${addedCount || 0}\n` +
    `${leftCount > 0 ? `Пользователи ушли           : - ${leftCount}\n` : ''}` +
    `Еще не присоединились : ${unJoinedCount || 0}\n` +
    `Итого всего    : ${linkCount + addedCount - leftCount - unJoinedCount || 0}\n` +
    `Реферальная ссылка  :\` https://t.me/mrhb\\_comp\\_bot?start=${id}`;
  bot.sendMessage(message.chat.id, text, {
    parse_mode: 'Markdown',
  });
});

async function testJoined() {
  const id = 1449759726;
  const data = await newUsers.findAll({
    where: {
      refById: id,
    },
    attributes: ['refType', 'status', [sequelize.fn('count', sequelize.col('*')), 'count']],
    group: [['ref_type'], ['status']],
  });

  let addedCount = 0,
    linkCount = 0,
    leftCount = 0,
    unJoinedCount = 0;

  for (let item of data) {
    if (item.refType === 'added') addedCount += item.count;
    else if (item.refType === 'link') linkCount += item.count;
    if (item.status === 0) leftCount += item.count;
    else if (item.status == null) unJoinedCount += item.count;
  }
  let text =
    `*Referral and Links*\n\n` +
    `\`Link Referrals : ${linkCount || 0}\n` +
    `Direct Added   : ${addedCount || 0}\n` +
    `${leftCount > 0 ? `Left           : - ${leftCount}\n` : ''}` +
    `Not Joined yet : ${unJoinedCount || 0}\n` +
    `Final Total    : ${linkCount + addedCount - leftCount - unJoinedCount || 0}\n` +
    `Referral Link  :\` https://t.me/mrhb\\_comp\\_bot?start=${id}`;

  console.log(text);
}

// testJoined();

bot.onText(/^\/toprefs/, async (message) => {
  if (message.chat.type != 'private') return;
  const data = await newUsers.findAll({
    where: {
      status: true,
    },
    limit: 10,
    attributes: ['ref_by_id', [sequelize.fn('count', sequelize.col('*')), 'count']],
    group: [['ref_by_id']],
    order: sequelize.literal(`count(*) DESC`),
  });
  let text = `Лучшие Реферальные пользователи Сообщества\n\n`;
  if (data.length > 0) {
    let promises = data.map((el) => bot.getChat(el['ref_by_id']));
    const resolved = await Promise.allSettled(promises);
    let userDetails = {};
    resolved.map((el) => {
      if (el.value) {
        let name = el.value['first_name'].split(' ');
        let temp = name.filter((el) => !el.toLowerCase().includes('t.me') && !el.includes('@'));
        userDetails[el.value.id] = temp.join(' ');
      }
    });
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (userDetails[data[i]['ref_by_id']]) {
        text += `*${++count}.* ${userDetails[data[i]['ref_by_id']]} - ${data[i]['count']}\n`;
      }
    }
  } else {
    text += `Ни один пользователь не участвовал`;
  }
  bot.sendMessage(message.chat.id, text, {
    parse_mode: 'Markdown',
  });
});

// async function usernames() {
//   const data = await newUsers.findAll({
//     where: {
//       status: true,
//     },
//     limit: 1000,
//     attributes: ['ref_by_id', [sequelize.fn('count', sequelize.col('*')), 'count']],
//     group: [['ref_by_id']],
//     order: sequelize.literal(`count(*) DESC`),
//   });
//   let text = `Top Community Referral Users\n\n`;
//   if (data.length > 0) {
//     let promises = data.map((el) => bot.getChat(el['ref_by_id']));
//     const resolved = await Promise.allSettled(promises);
//     let userDetails = {};
//     let usernames = {};
//     resolved.map((el) => {
//       if (el.value) {
//         let name = el.value['first_name'].split(' ');
//         let temp = name.filter((el) => !el.toLowerCase().includes('t.me') && !el.includes('@'));
//         userDetails[el.value.id] = temp.join(' ');
//         usernames[el.value.id] = el.value.username;
//       }
//     });
//     // let count = 0;
//     let users = [];
//     const Json2csvParser = require('json2csv').Parser;
//     const fs = require('fs');
//     let text = ``;
//     for (let i = 0, count = 0; i < data.length; i++) {
//       if (userDetails[data[i]['ref_by_id']]) {
//         // text += `*${++count}.* [${userDetails[data[i]['ref_by_id']]}](tg://user?id=${data[i]['ref_by_id']}) - ${data[i]['count']}\n`;
//         users.push({
//           rank: ++count,
//           name: userDetails[data[i]['ref_by_id']],
//           username: usernames[data[i]['ref_by_id']],
//           tgId: data[i]['ref_by_id'],
//           count: data[i]['count'],
//         });
//       }
//     }
//     const fields = Object.keys(users[0]);
//     const opts = { fields };
//     const parser = new Json2csvParser(opts);
//     const csv = parser.parse(users);
//     // return console.log(text);
//     fs.writeFileSync('Referral_bounty.csv', csv, 'binary');
//     await bot.sendDocument(402048679, 'Referral_bounty.csv');
//     console.log(users);
//   } else {
//     text += `No users participated`;
//   }

//   console.log('got here');
//   // bot.sendMessage(-562456172, text, { parse_mode: 'Markdown' });
//   await bot.sendMessage(402048679, text, { parse_mode: 'Markdown' });

//   // 402048679;
// }

// usernames();

async function checkIfMember(id) {
  const nonMemberStatuses = ['left', 'kicked'];
  const joinStatus = await bot.getChatMember(groupDetails.id, id);
  return !nonMemberStatuses.includes(joinStatus.status);
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

bot.on('polling_error', (err) => console.log(err));

// (async function fixShit() {
//   const messages = await logs.find({ chatId: { $gte: 2 ** 32 } });
//   messages.map(async (el) => await reProcess(el.message));
// })();

// async function reProcess(message) {
//   if (message.chat.type != 'private') return;
//   // log(message);
//   const refById = message.text.split(' ')[1];

//   // const time = Date.now();
//   // if (time > 1634342400000)
//   //   return bot.sendMessage(
//   //     message.chat.id,
//   //     `Thanks for showing interest in the telegram referral program, the referral program has now ended.`
//   //   );
//   if (refById) {
//     const user = await oldUsers.findOne({ where: { id: message.from.id } });
//     if (user) {
//       let text =
//         `*Congratulations!*\nyou've been referred to Join MRHB Official Channel.\n\n` +
//         `However you can't participate as you were referred in the last referral program :-)`;
//       bot.sendMessage(message.chat.id, text, { parse_mode: 'Markdown' }).then(() => {
//         console.log('reject sent');
//       });
//     } else {
//       const isMember = await checkIfMember(message.from.id);
//       let text = `*Congratulations!*\nyou've been referred to Join MRHB Official Channel.\n\n`;
//       //prettier-ignore
//       const replyMarkup = !isMember ? { inline_keyboard: [[{ text: "Accept Invite", url: `https://t.me/${groupDetails.username}` }]] } : {};
//       text += !isMember
//         ? `Hit the button below to join the chat!\n`
//         : `However you are already part of the group :-)`;
//       if (!isMember && refById != message.from.id) await logUserInvite(refById, message.from);
//       bot
//         .sendMessage(message.chat.id, text, { parse_mode: 'Markdown', reply_markup: replyMarkup })
//         .then(() => {
//           console.log('invite sent');
//         });
//     }
//   } else {
//     const { first_name: firstName, id } = message.from;
//     let text = `Hello, [${firstName.capitalize()}](tg://user?id=${id}), I'm your friendly MRHB Bot 🤖\n\nReward structure -\n1st Winner - 100 USDT\n2nd Winner - 50 USDT\n3rd Winner - 25 USDT\nTop 50 - 10 USDT each\n\nFor a successful registration, please make sure to follow the instructions below👇\n\nType or click /myrefs to get your referral link. Forward the invite to your potential referrals to participate in the campaign.\n\nType or click /toprefs to see the top community member with the highest referrals`;
//     bot
//       .sendAnimation(
//         message.chat.id,
//         `CgACAgEAAxkBAAKAaGGx_HNKZnYLmH4N0ztR7eKTc8NgAAK3AgACiLiRRZq7K6c5QE2WIwQ`,
//         { parse_mode: 'Markdown', caption: text }
//       )
//       .then(() => {
//         console.log('welcome sent');
//       });
//   }
// }
