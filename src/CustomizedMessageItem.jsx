import React, { useMemo } from "react";
import AdminMessage from "./MessageItems/AdminMessage";
import FileMessage from "./MessageItems/FileMessage";
import UserMessage from "./MessageItems/UserMessage";
import "./index.css";
import VotingMessage from "./MessageItems/VotingMessage";

export default function CustomizedMessageItem(props) {
  const {
    message,
    userId,
    currentChannel,
    updateUserMessage,
    sb
  } = props;
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
        <VotingMessage
          message={message}
          userId={userId}
          updateUserMessage={updateUserMessage}
          currentChannel={currentChannel}
          sb={sb}
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
  }, [
    message,
    userId,
    currentChannel,
    updateUserMessage,
    sb
  ]);

  return (
    <div id={message.messageId} className="customized-message-item">
      <MessageHOC />
      <br />
    </div>
  );
}