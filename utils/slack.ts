import { Message } from "models/message";
import { User } from "models/user";
import { userMapFromList } from "./general";

const slackIDRegex = /<@(U\w+)>/gi;

export function sortedMessages(messages: Message[]) {
  return messages.sort((a: Message, b: Message) => Number(a.ts) - Number(b.ts));
}

export function listOfTaggedUsers(
  message: Message,
  userMap: { [id: string]: User }
) {

  // count the number of times that slackIDRegex occurs in message.text
  // That's the number of tagged users.
  // For each of those matches, get the user.name of that tagged user

  let matches = message.text.match(slackIDRegex) || [];
  return matches.toString();
}


export function resolveMessageIDs(
  message: Message,
  userMap: { [id: string]: User }
) {
  if (message.user_profile === undefined) {
    let user = userMap[message.user];
    message.user_profile = {
      real_name: user?.profile.real_name || "Unknown (likely a bot)",
      display_name: user?.profile.display_name,
    };
  }
  if (message.bot_id !== undefined) {
    message.text = "We are unable to display bot messages at this time.";
    message.user_profile.real_name = "[BOT] " + message.user_profile.real_name;
  } else {
    message.text = replaceSlackIDsWithReadableIDs(message.text,userMap);
  }
}

export function replaceSlackIDsWithReadableIDs(
  s: string,
  userMap: { [id: string]: User }
) {
  return s.replace(
    slackIDRegex,
    (match, p1) => { return "@" + userMap[p1].real_name; }
  );
}

export function resolveIDs(messages: Message[], users: User[]) {
  let userMap = userMapFromList(users);
  for (let message of messages) {
    resolveMessageIDs(message, userMap);
  }
}
