require('dotenv').config();
const { App } = require('@slack/bolt');
const {
  setupDb,
  addParkingStatement,
  removeParkingStatement,
  getIsSlotAlreadyBooked,
  getAllParked,
  addBlameStatement,
  getAllBlames
 } = require('./db-access');

const availablePlaces = process.env.AVAILABLE_SLOTS.split(',').map(place => +place);
const parkingSchema = process.env.IMAGE_URL;

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const UNKNOWN_ERROR = 'Сталась невідома помилка, напиши про неї адміну';

app.command('/pick_nest', async ({ command, ack, respond }) => {
  await ack();

  try {
    let allParked = await getAllParked();
    let resultText;

    if (allParked.length < availablePlaces.length) {
      const allParkedSlots = allParked.map(parked => parked.parkingSlot);
      const freeSpaces = availablePlaces.filter(place => !allParkedSlots.includes(place));
      resultText = `Вибирай де хочеш приземлитись: ${freeSpaces.join(', ')}`;
    } else {
      resultText = `Пізно! Вільних місць не залишилось`;
    }

    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: resultText,
      attachments: [
        {
          type: "image",
          title: {
            type: "plain_text",
            text: "Parking schema"
          },
          image_url: parkingSchema,
          alt_text: "Parking schema"
        }
      ]
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

app.command('/who_nested', async ({ command, ack, respond }) => {
  await ack();

  try {
    const allParked = await getAllParked();
    let allParkedText;
    if (!allParked.length) {
      allParkedText = 'Рано! Ніхто сьогодні ще не запаркований'
    } else {
      allParkedText = allParked.map(parked => `${parked.parkingSlot}: <@${parked.userId}>`).join('\n')
    }

    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: allParkedText
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

app.command('/nest', async ({ command, ack, respond }) => {
  await ack();

  try {
    const parkSlot = +command.text;
    let error;

    if (typeof parkSlot !== 'number') {
      error = `Я не розумію де ти хочеш запаркуватись. Треба передати номер місця після команди, наприклад "/park 121". А ти написав: ${command.text}.`
    } else if (!availablePlaces.includes(parkSlot)) {
      error = `Ти пробуєш запаркуватись на місце якого немає у дозволених. Доступні місця: ${availablePlaces.join(', ')}. А ти написав: ${command.text}.`;
    } else {
      const parked = await getIsSlotAlreadyBooked(parkSlot, command.user_id);
      if (parked) {
        if (parked.userId === command.user_id) {
          error = `Ееее, за тобою вже заброньоване місце ${parked.parkingSlot}`
        } else {
          error = `На цьому місці вже приземлився <@${parked.userId}>`
        }
      }
    }

    if (error) {
      await respond({
        response_type: 'ephemeral',
        text: error
      });

      return;
    }

    await addParkingStatement(command.user_id, parkSlot)

    await respond({
      response_type: 'ephemeral',
      text: `Йой, успішно приземлився на місці ${parkSlot}`
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

app.command('/destroy_nest', async ({ command, ack, respond }) => {
  await ack();

  try {
    await removeParkingStatement(command.user_id)

    await respond({
      response_type: 'ephemeral',
      text: `Файно є, ще хтось може приземлитись`
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

app.command('/blame_nest', async ({ command, ack, respond }) => {
  await ack();

  try {
    let [parkSlotText, carPlate] = command.text.split(' ');
    const parkSlot = +parkSlotText;
    const normalizedCarPlate = (carPlate || '').replace(/ /g, '').toUpperCase();

    if (!parkSlot || typeof parkSlot !== 'number') {
      error = `Я не розумію яке паркомісце ти написав. Треба передати номер місця після команди, наприклад "/blame_nest 12 BC1212HE". А ти написав: ${command.text}.`
    } else if (!availablePlaces.includes(parkSlot)) {
      error = `Такого паркомісця немає у дозволених. Доступні місця: ${availablePlaces.join(', ')}. А ти написав: ${command.text}.`;
    } else if (!normalizedCarPlate || normalizedCarPlate.length < 4 || normalizedCarPlate.length > 10) {
      error = `Неправильно переданий номер машини. Треба передати номер місця і номер машини після команди, наприклад "/blame_nest 12 BC1212HE". А ти написав: ${command.text}.`;
    } else {
      const parked = await getIsSlotAlreadyBooked(parkSlot);
      if (parked) {
        error = `На цьому місці запаркований <@${parked.userId}>`
      }
    }

    if (error) {
      await respond({
        response_type: 'ephemeral',
        text: error
      });

      return;
    }

    await addBlameStatement(normalizedCarPlate, parkSlot, command.user_id);

    await respond({
      response_type: 'ephemeral',
      text: `Ухх, ми йому помстимося!`
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

app.command('/all_nest_blames', async ({ command, ack, respond }) => {
  await ack();

  try {
    const blames = await getAllBlames();
    let blamesText;
    if (!blames.length) {
      blamesText = 'Ого! Ніхто ще нікого не звинуватив'
    } else {
      blamesText = blames.map(blame => `${blame.carPlate}: ${blame.count}`).join('\n')
    }

    await app.client.chat.postEphemeral({
      channel: command.channel_id,
      user: command.user_id,
      text: blamesText
    });
  } catch (e) {
    console.log('!!!Error', e);

    await respond({
      response_type: 'ephemeral',
      text: UNKNOWN_ERROR
    });
  }
});

(async () => {
  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }
  await app.start(port);

  await setupDb();

  console.log('App is running!');
})();
