export class usersInterface {
    auth_data?: string;
    auth_service?: string;
    create_at?: Number;
    delete_at?: Number;
    disable_welcome_email?: boolean;
    email?: string;
    first_name?: string;
    id?: string;
    last_name?: string;
    locale?: string;
    nickname?: string;
    position?: string;
    roles?: string;
    timezone?: {
        automaticTimezone?: string;
        manualTimezone?: string;
        useAutomaticTimezone?: string;
    }
    automaticTimezone?: string;
    manualTimezone?: string;
    useAutomaticTimezone?: string;
    update_at?: Number;
    username?: string;
}


export class chatInteface {
    channel_id?: string;
    id?: string;
    is_pinned?: false;
    message?: string;
    user_id?: string;
    update_at?: any;
}

export class channelInteface {
    creator_id?: string;
    delete_at?: any;
    display_name?: string;
    extra_update_at?: any;
    group_constrained?: any;
    header: string;
    id?: string;
    last_post_at?: any;
    name?: string;
    policy_id?: any;
    props?: any;
    purpose?: string;
    scheme_id?: any;
    shared?: any;
    team_id?: string;
    total_msg_count?: any;
    total_msg_count_root?: any;
    type?: string;
    update_at?: any;
    username?: any;
    user_Id?: string;
    mention_count?: Number;
}

export class fileInterface {
    channel_id?: string;
    create_at?: any
    delete_at?: any
    extension?: string;
    has_preview_image?: any;
    height?: any;
    id?: string;
    mime_type?: string;
    mini_preview?: string;
    name?: string;
    remote_id?: string;
    size?: any;
    update_at?: any;
    user_id?: string;
    width?: any
}

export class userStatusInteface {
    dnd_end_time?: any;
    last_activity_at?: any;
    manual?: any;
    status?: string;
    user_id?: string;
}