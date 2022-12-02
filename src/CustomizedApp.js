import React, { useState, useEffect } from "react";
import {
  ChannelList,
  Channel,
  ChannelSettings,
  sendbirdSelectors,
  useSendbirdStateContext,
} from "@sendbird/uikit-react/";
import "./index.css";
import CustomizedMessageItem from "./CustomizedMessageItem";
import CustomizedMessageInput from "./CustomizedMessageInput";
import GroupChannelHandler from "@sendbird/uikit-react/handlers/GroupChannelHandler";

function CustomizedApp({ userId, appId, sb }) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const currentChannelUrl = currentChannel ? currentChannel.url : "";
  const store = useSendbirdStateContext();
  const updateUserMessage = sendbirdSelectors.getUpdateUserMessage(store);
  var channelChatDiv = document.getElementsByClassName("channel-chat")[0];
  const [updatedMessage, setUpdatedMessage] = useState(null);
  const renderSettingsBar = () => {
    channelChatDiv.style.width = "52%";
    channelChatDiv.style.cssFloat = "left";
  };

  const hideSettingsBar = () => {
    channelChatDiv.style.width = "76%";
    channelChatDiv.style.cssFloat = "right";
  };
  const [pollData, setPollData] = useState([]);

  async function getVoters(
    // pollData,
    messageId,
    pollId,
    updatedVoteCounts,
    message
  ) {
    let optionIds = updatedVoteCounts.map((option) => {
      return option.option_id;
    });
    pollData[messageId] = {
      message: message,
    };
    for (const optionId of optionIds) {
      const query = currentChannel.createPollVoterListQuery(pollId, optionId);
      const voters = await query.next();
        pollData[messageId][optionId] = {
          voters: voters,
          vote_count: voters.length,
        };
    }
    console.log('Poll Data AFTER RESETTING TO NEW VOTE=', pollData);
  }
  let UNIQUE_HANDLER_ID = "1234";
  const groupChannelHandler = new GroupChannelHandler();
  sb.groupChannel.addGroupChannelHandler(
    UNIQUE_HANDLER_ID,
    groupChannelHandler
  );

  groupChannelHandler.onPollVoted = async (channel, event) => {
   console.log("onPollVoted event=", event);
    let messageId = event.messageId;
    let pollId = event.pollId;
    let updatedVoteCounts = event._payload.updated_vote_counts;
    let channelType = event._payload.channel_type;
   pollData[messageId] = undefined;
    const params = {
      messageId: messageId,
      channelType: channelType,
      channelUrl: currentChannelUrl,
    };
    const message = await sb.message.getMessage(params);
    setUpdatedMessage(message)
    if (pollData[messageId] === undefined) {
      getVoters( messageId, pollId, updatedVoteCounts, message);
    }
  };

  return (
    <div className="channel-wrap">
      <div className="channel-list">
        <ChannelList
          onChannelSelect={(channel) => {
            setCurrentChannel(channel);
          }}
        />
      </div>
      <div className="channel-chat">
        <Channel
          channelUrl={currentChannelUrl}
          onChatHeaderActionClick={() => {
            setShowSettings(!showSettings);
            renderSettingsBar();
          }}
          renderMessage={({ message }) => (
            <CustomizedMessageItem
              message={message}
              userId={userId}
              currentChannel={currentChannel}
              updateUserMessage={updateUserMessage}
              sb={sb}
              pollData={pollData}
              setPollData={setPollData}
              updatedMessage={updatedMessage}
            />
          )}
          renderMessageInput={() => (
            <CustomizedMessageInput appId={appId} sb={sb} />
          )}
        />
      </div>
      {showSettings && (
        <div className="channel-settings">
          <ChannelSettings
            channelUrl={currentChannelUrl}
            onCloseClick={() => {
              setShowSettings(false);
              hideSettingsBar();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CustomizedApp;
