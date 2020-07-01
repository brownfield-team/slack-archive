import { Message } from "models/message";
import { User } from "models/user";
import { userMapFromList, notEmpty } from "./general";
import { Dictionary } from "typescript-collections";

export interface SimpleData {
  value: number;
  name: string;
}

export interface PlotData {
  x: number | string;
  y: number;
  name: string;
}

export const countKeyword = (keyword: string, messages: Message[]) => {
  let count = 0;
  let keyMessages: Message[] = [];
  for (const message of messages) {
    const regex = new RegExp(keyword, "g");
    const messageCount = message.text.match(regex)?.length || 0;
    if (messageCount > 0) {
      count += messageCount;
      keyMessages.push(message);
    }
  }
  return { count, keyMessages, keyword };
};

export function messagesToData(messages: Message[]) {
  let dataDictionary: { [id: string]: number } = {};
  messages.forEach((message: Message) => {
    let day = new Date(Number(message.ts) * 1000);
    if (dataDictionary[day.toDateString()]) {
      dataDictionary[day.toDateString()] += 1;
    } else {
      dataDictionary[day.toDateString()] = 1;
    }
  });
  return Object.entries(dataDictionary)
    .map(([key, value]) => {
      return {
        x: new Date(key).getTime(),
        y: value,
        name: key,
      };
    })
    .sort((a, b) => a.x - b.x);
}

export function messagesPerUser(messages: Message[], users: User[]) {
  let userMessageCounts: { [id: string]: number } = {};
  messages.forEach((message) => {
    if (userMessageCounts[message.user] !== undefined) {
      userMessageCounts[message.user] += 1;
    } else {
      userMessageCounts[message.user] = 1;
    }
  });
  let userMap = userMapFromList(users);
  return Object.entries(userMessageCounts)
    .map(([id, count]) => {
      return userMap[id]?.profile
        ? {
            value: count,
            name:
              userMap[id].profile.display_name || userMap[id].profile.real_name,
          }
        : null;
    })
    .filter(notEmpty)
    .sort((a, b) => b.value - a.value);
}

const dataRowForMessage = (message: Message) => {
  let timestamp = message.ts;
  let personId = "person-TBD";
  let teamID = "team-TBD";
  let messageType = "postMessage ";
  let messageId = message.channel + "-" + message.ts;
  let messageBody = message.text;
  let taggedPeople = "[taggedTBD1,taggedTBD2]";
  return [ 
    timestamp,
    personId,
    teamID,
    messageType,
    messageId,
    messageBody,
    taggedPeople
  ];
}

// This should moved out of plotting.ts as part of a later
// refactor.  It is here for now so that we can use the other
// functions in this file as a guide.
export function dataForCSVDownload(messages: Message[], users: User[]) {
  const headers = ["timestamp","personId","teamID","type","messageId","messageBody","taggedPeople"];
  console.log(JSON.stringify(messages,null,2));
  const dataRows = messages.map( (message) => dataRowForMessage(message) );
  let result = [ headers ];
  result = result.concat(dataRows);
  return result
}

export interface UserPair {
  respondee: string;
  responder: string;
}

const pairToString = (pair: UserPair) => {
  return pair.respondee > pair.responder
    ? pair.respondee + pair.responder
    : pair.responder + pair.respondee;
};

export interface NamedData {
  displayName: string;
  name: string;
  value: number;
}

export function userMessagePairCounts(users: User[], messages: Message[]) {
  let prevMessage: Message | null = null;
  let pairCounts = new Dictionary<UserPair, number>(pairToString);
  const userMap = userMapFromList(users);

  for (const message of messages) {
    if (prevMessage === null) {
      prevMessage = message;
      continue;
    }
    const prevUser = userMap[prevMessage.user];
    const curUser = userMap[message.user];
    const pair = {
      responder: prevUser?.profile.real_name,
      respondee: curUser?.profile.real_name,
    };
    pairCounts.setValue(pair, (pairCounts.getValue(pair) || 0) + 1);
  }
  let data: NamedData[] = [];
  pairCounts.forEach((key, value) => {
    data.push({
      name: key.respondee + " - " + key.responder,
      value: value,
      displayName: key.respondee[0] + " - " + key.responder[0],
    });
  });
  return data.sort((a, b) => b.value - a.value);
}
