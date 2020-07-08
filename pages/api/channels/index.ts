import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { getMessagesForChannel, getUsers } from "./[channelName]";
import { Message } from "models/message";
import { User } from "models/user";
import { RosterStudent } from "models/roster_student";

const getRosterStudents = async ():Promise<RosterStudent[]> => {
  let roster_students_string = "";
  try {
    roster_students_string = await fs.promises.readFile(
      "public/data/roster_students.json",
      "utf8"
    );
  } catch (err) {
    return [];
  }
  return JSON.parse(roster_students_string);
}

const getSlackToTeamMap = async ():Promise<any> => {
  const roster_students:RosterStudent[] = await getRosterStudents();

  let result: { [id: string] : string } = {};

  for (const roster_student of roster_students) {
    if (roster_student.slack_uid != undefined) {
      result[roster_student.slack_uid!] = roster_student.teams; 
    }
  }
  return result
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let channels_string = "";
  try {
    channels_string = await fs.promises.readFile(
      "public/data/channels.json",
      "utf8"
    );
  } catch (err) {
    res.statusCode = 500;
    res.json({
      error: err.message,
      diagonosis: "channels.json file is either missing or misplaced",
    });
    return;
  }
  let channels = JSON.parse(channels_string);
  let messages: Message[] = [];
  let users: User[];
  try {
    users = await getUsers();
    for (const channel of channels) {
      const messagesForChannel = await getMessagesForChannel(channel.name);
      messages = messages.concat(messagesForChannel);
    }
  } catch (err) {
    res.statusCode = 500;
    res.json({
      error: err.message,
      diagonosis:
        "something went wrong when retrieving messages or users for the workspace",
    });
    return;
  }

  const slack2team = await getSlackToTeamMap();

  res.statusCode = 200;
  res.json({ channels, users, messages, slack2team});
};
