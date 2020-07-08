export interface RosterStudent {
    perm: string;
    email: string;
    first_name: string;
    last_name: string;
    enrolled: boolean;
    section: string;
    username?: string;
    slack_uid?: string;
    slack_username?: string;
    slack_display_name?: string;
    org_member_status?: string;
    teams?: string;
}