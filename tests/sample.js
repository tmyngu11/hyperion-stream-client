const HyperionSocketClient = require('../lib/index').default;

let totalMessages = 0;
let messages = 0;

const pastMsgInterval = setInterval(() => {
  if (messages === 0) {
    console.log(`Total Messages Received: ${totalMessages}`);
    if (totalMessages !== 0) {
      clearInterval(pastMsgInterval);
    }
  } else {
    totalMessages += messages;
    console.log(`Incoming Rate: ${messages / 5} msg/s`);
    messages = 0;
  }
}, 5000);

const client = new HyperionSocketClient('http://localhost:7000', {async: true});

client.onData = async (data, ack) => {
  const content = data.content;
  if (data.type === 'action') {
    const act = data.content['act'];
    console.log(`\n >>>> Contract: ${act.account} | Action: ${act.name} | Block: ${content['block_num']} <<<< `);
    for (const key in act.data) {
      if (act.data.hasOwnProperty(key)) {
        console.log(`${key} = ${act.data[key]}`);
      }
    }
  }

  if (data.type === 'delta') {
    if (content['present'] === true) {
      const delta_data = content.data;
      console.log(
          `\n >>>> Block: ${content['block_num']} | Contract: ${content.code} | Table: ${content.table} | Scope: ${content['scope']} | Payer: ${content['payer']} <<<< `);
      if (delta_data) {
        for (const key in delta_data) {
          if (delta_data.hasOwnProperty(key)) {
            console.log(`${key} = ${delta_data[key]}`);
          }
        }
      } else {
        console.log('ERROR >>>>>>>> ', content);
      }
    }
  }

  messages++;
  console.log('______________________');
  ack();
};

// client.onEmpty = async () => {
//     console.log(`Number of messages received: ${messages}`);
// };

client.onConnect = () => {

  client.streamActions({
    contract: 'eosio',
    action: 'voteproducer',
    account: '',
    start_from: '2020-03-15T00:00:00.000Z',
    read_until: 0,
    filters: [],
  });

  // client.streamDeltas({
  //   code: 'eosio.token',
  //   table: '*',
  //   scope: '',
  //   payer: '',
  //   filters: [],
  //   start_from: 0,
  //   read_until: 0,
  // });

};

client.connect(() => {
  console.log('connected!');
});
