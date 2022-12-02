import React, { useMemo, useState } from "react";
import AdminMessage from "./MessageItems/AdminMessage";
import FileMessage from "./MessageItems/FileMessage";
import UserMessage from "./MessageItems/UserMessage";
import "./index.css";
import PollMessage from "./MessageItems/PollMessage";
import GroupChannelHandler from "@sendbird/uikit-react/handlers/GroupChannelHandler";

export default function CustomizedMessageItem(props) {
  const { userId, currentChannel, updateUserMessage, sb, setPollData } = props;
  let message = props.message;
  let pollData = props.pollData;
  const [updateMessage, setMessageUpdate] = useState({});
  let UNIQUE_HANDLER_ID = "1234";
  const groupChannelHandler = new GroupChannelHandler();
  sb.groupChannel.addGroupChannelHandler(
    UNIQUE_HANDLER_ID,
    groupChannelHandler
  );
  groupChannelHandler.onPollVoted = async (channel, event) => {
    let messageId = event.messageId;
    let channelType = event._payload.channel_type;
    pollData[messageId] = undefined;
    const params = {
      messageId: messageId,
      channelType: channelType,
      channelUrl: currentChannel.url,
    };
    const updatedMessage = await sb.message.getMessage(params);
    setMessageUpdate(updatedMessage);

    message._poll.options = updatedMessage._poll.options;
    console.log("msgs poll options after set=", message._poll.options);
  };

  const MessageHOC = useMemo(() => {
    if (message.isAdminMessage && message.isAdminMessage()) {
      return () => <AdminMessage message={message} />;
    } else if (message.isFileMessage && message.isFileMessage()) {
      return () => (
        <FileMessage
          message={message}
          userId={userId}
          currentChannel={currentChannel}
        />
      );
    } else if (message._poll) {
      return () => (
        <PollMessage
          message={message}
          userId={userId}
          updateUserMessage={updateUserMessage}
          currentChannel={currentChannel}
          sb={sb}
          pollData={pollData}
          setPollData={setPollData}
        />
      );
    } else if (message.isUserMessage && message.isUserMessage()) {
      return () => (
        <UserMessage
          message={message}
          userId={userId}
          updateUserMessage={updateUserMessage}
          currentChannel={currentChannel}
          sb={sb}
        />
      );
    }
    return () => <div />;
  }, [message, userId, currentChannel, updateUserMessage, sb]);

  return (
    <div id={message.messageId} className="customized-message-item">
      <MessageHOC />
      <br />
    </div>
  );
}
