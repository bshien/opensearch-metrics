import urllib3
import json

http = urllib3.PoolManager()


def lambda_handler(event, context):
    url = "https://hooks.slack.com/workflows/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"
    msg = {
        "channel": "#testting-74",
        "username": "WEBHOOK_USERNAME",
        "Content": event["Records"][0]["Sns"]["Message"],
        "icon_emoji": "",
    }

    encoded_msg = json.dumps(msg).encode("utf-8")
    resp = http.request("POST", url, body=encoded_msg)
    print(
        {
            "message": event["Records"][0]["Sns"]["Message"],
            "status_code": resp.status,
            "response": resp.data,
        }
    )