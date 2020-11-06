import './env';
import {WebClient} from "@slack/web-api";

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

class SlackClient {

    constructor() {
        this.client = new WebClient(SLACK_TOKEN);
    }

    postMessage(blocks) {
        return this.client.chat.postMessage({
            blocks: blocks,
            channel: SLACK_CHANNEL_ID
        });
    }
}

const slackClient = new SlackClient();

module.exports = slackClient;
