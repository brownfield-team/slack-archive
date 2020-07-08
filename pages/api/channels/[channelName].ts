import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { Message } from "models/message";
import { Channel } from "models/channel";
import { User } from "models/user";

export async function getMessagesForChannel(channelName: string | string[]) {
  let messages: Message[] = [];

  let file_list = await fs.promises.readdir(
    `public/data/${channelName}`,
    "utf8"
  );

  await Promise.all(
    file_list.map(async (file) => {
      let file_messages_json_string = await fs.promises.readFile(
        `public/data/${channelName}/${file}`,
        "utf8"
      );
      const file_messages = JSON.parse(file_messages_json_string);
      const messages_with_channel_name = file_messages.map( (m: Message) => {
        m['channel'] = channelName as string;
        return m;
      })
      messages = messages.concat(file_messages);
    })
  );
  return messages;
}

async function getChannelInfo(channelName: string | string[]) {
  let channels = JSON.parse(
    await fs.promises.readFile("public/data/channels.json", "utf-8")
  );
  let channel = channels.find((c: Channel) => c.name === channelName);
  if (channel === undefined) throw new Error("Channel not found");
  return channel;
}

export async function getUsers() {
  let users = JSON.parse(
    await fs.promises.readFile("public/data/users.json", "utf-8")
  );

  return users;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { channelName },
  } = req;
  let messages: Message[] = [];
  let channel: Channel | null = null;
  let users: User[] = [];
  try {
    messages = await getMessagesForChannel(channelName);
    channel = await getChannelInfo(channelName);
    users = await getUsers();
  } catch (err) {
    res.statusCode = 500;
    res.json({
      error: err.message,
    });
    return;
  }

  res.statusCode = 200;
  res.json({ messages, channel, users });
};
