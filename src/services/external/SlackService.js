import slackClient from '../../config/slackclient';

export const postErrorMessage = async (error) => {
    return slackClient.postMessage([{
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `에러가 발생했습니다.\n\`\`\`${JSON.stringify(error, null, 4)}\`\`\``
        }
    }]);
};
