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

function CustomizedApp({ userId, appId, sb }) {
  const [showSettings, setShowSettings] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const currentChannelUrl = currentChannel ? currentChannel.url : "";
  const store = useSendbirdStateContext();
  const updateUserMessage = sendbirdSelectors.getUpdateUserMessage(store);
  var channelChatDiv = document.getElementsByClassName("channel-chat")[0];

  const renderSettingsBar = () => {
    channelChatDiv.style.width = "52%";
    channelChatDiv.style.cssFloat = "left";
  };

  const hideSettingsBar = () => {
    channelChatDiv.style.width = "76%";
    channelChatDiv.style.cssFloat = "right";
  };
  // async function getVoters(
  //   messageId,
  //   pollId,
  //   updatedVoteCounts,
  // //  message
  // ) {
  //   let optionIds = updatedVoteCounts.map((option) => {
  //     return option.option_id;
  //   });
  //   for (const optionId of optionIds) {
  //     const query = currentChannel.createPollVoterListQuery(pollId, optionId);
  //     const voters = await query.next();
  //     pollData[messageId][optionId] = {
  //       voters: voters,
  //       vote_count: voters.length,
  //     };
  //   }
  //   for (const [index, option] of pollData[messageId].message._poll.options.entries()) {
  //   console.log('THE I =', index)
  //     if(optionIds.includes(option.id)){
  //       console.log('in if')
  //       //options[i].votecount = polldata message id option id vote count
  //         ///right = local; left = how its stored in msg
  //       pollData[messageId].message._poll.options[index].voteCount = pollData[messageId][option.id].vote_count
  //     }
  //   }
  //   //HOW TO CHANGE MESSAGE ON THE SCREEN -> force rerender of one of the messages in the list:
  //       //HOW do we update state inside of the component (PollMessage)
  //     //UIKit holds the state -> has msg list, if it changes then rerender: HOW TO FIND HOW TO RECIEVE THAT CHANGE
   
  //   //onpoll VOTED EVENT FOR EACH MESSAGE 
  //   // if message.mesage id (localmsg) = poll event message id
  //   //only if that matches then do stuff (that way if event comes in BUT only relevent one does the action)

  //   //if uikit has a better way to do that def do that 
  // }

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
