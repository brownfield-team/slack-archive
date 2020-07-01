export interface Message {
  client_msg_id?: string;
  type: string;
  subtype?: string;
  text: string;
  user: string;
  ts: string;
  team?: string;
  channel: string;
  user_team?: string;
  source_team?: string;
  user_profile?: {
    avatar_hash?: string;
    image_72?: string;
    first_name?: string;
    real_name: string;
    display_name: string;
    team?: string;
    name?: string;
    is_restricted?: boolean;
    is_ultra_restricted?: boolean;
  };
  blocks?: {
    type: string;
    block_id: string;
    elements: {
      type: string;
      text: string;
    }[];
  }[];
  bot_id?: string;
  bot_profile?: {
    id: string;
    deleted: string;
    name: string;
    updated: number;
    app_id: string;
    icons: {
      image_36: string;
      image_48: string;
      image_72: string;
    };
    team_id: string;
  };
  attachments?: {
    author_name: string;
    fallback: string;
    text: string;
    pretext: string;
    title: string;
    footer: string;
    id: number;
    title_link: string;
    author_link: string;
    author_icon: string;
    footer_icon: string;
    ts: number;
    color: string;
    mrkdwn: string[];
  }[];
}
