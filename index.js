const { App } = require('@slack/bolt');

const parkingStore = {
  availablePlaces: [1, 2, 3, 4, 5],
  parked: {},
};

const app = new App({
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  // token: process.env.SLACK_BOT_TOKEN,
  signingSecret: 'b8d16c1589e47a751a24f69240eb612c',
  token: 'xoxb-139265830165-3497518092881-Fz5AMFVusBnrG4LBSoUnfnwg',
});

const UNKNOWN_ERROR = 'Unknown error occurred.'

function validateParkingSlot(parkSlot, commandText) {
  if (!(typeof parkSlot !== 'number')) {
    return `I can't understand what parking slot you are trying to use. Your input: ${commandText}`
  }

  if (!parkingStore.availablePlaces.includes(parkSlot)) {
    return `Parking slot that you are trying to book is not in the allowed list. Your input: ${commandText}`;
  }
}

/* Add functionality here */

app.command('/park', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  await respond({
    response_type: 'ephemeral',
    text: 'IT WORKS!!!'
  });

  // const parkSlot = +command.text;
  // const error = validateParkingSlot(parkSlot, command.text);

  // if (!error && parkingStore.parked[parkSlot]) {
  //   error = `Slot is already booked by <@${parkingStore.parked[parkSlot]}>`
  // }

  // if (error) {
  //   await respond({
  //     response_type: 'ephemeral',
  //     text: error
  //   });

  //   return;
  // }

  // try {
  //   parkingStore.parked[parkSlot] = command.user_id;

  //   await respond({
  //     response_type: 'ephemeral',
  //     text: `Parking slot ${parkSlot} is yours`
  //   });
  // } catch {
  //   await respond({
  //     response_type: 'ephemeral',
  //     text: UNKNOWN_ERROR
  //   });
  // }
});

(async () => {
  // Start the app
  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }
  await app.start(port);

  console.log('⚡️ Bolt app is running!');
})();



    // await app.client.chat.postEphemeral({
    //   channel: command.channel_id,
    //   user: command.user_id,
    //   text: `Ephemeral Message Test <@${command.user_id}>?`,
    //   attachments: [
    //     {
    //       "type": "image",
    //       "title": {
    //         "type": "plain_text",
    //         "text": "Parking schema"
    //       },
    //       "image_url": "https://slack-files.com/T437TQE4V-F03F39QFD3J-8e32c7691c",
    //       "alt_text": "Parking schema"
    //     }
    //   ]
    // });
