import React, { useState } from "react";
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
} from "@mui/material";
import "./index.css";
import UpdatePollForm from "./UpdatePollForm";
import DeleteOptionForm from "./DeleteOptionForm";
import { PollVoteEvent } from "@sendbird/chat/poll";

export default function PollMessage(props) {
  const {
    message,
    userId,
    updateUserMessage,
    currentChannel,
    sb,
    setPollData,
  } = props;
  const [messageText, changeMessageText] = useState(message.message);
  const [dropdownOptions, setDropdownOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [showDeleteOptionsForm, setShowDeleteOptionsForm] = useState(false);
  const [optionsValue, setOptionsValue] = useState("");
  const [updateMessage, setMessageUpdate] = useState({});
  const [updatedMsg, setUpdatedMsg] = useState({});
  let pollData = [];
  let style = {};
  let poll = message._poll;

  //WHEN ADDING SHOW WHO VOTED, only show up to 5 people who voted under each option
  //if over 5, show the 5 ppl then ',..'

  const openDropdown = () => {
    if (poll.createdBy === userId) {
      setDropdownOptions(!dropdownOptions);
    }
  };

  const toggleOptionsForm = () => {
    setShowOptionsForm(!showOptionsForm);
  };

  const renderQuestionForm = () => {
    setShowForm(true);
    setDropdownOptions(!dropdownOptions);
  };

  async function deletePoll() {
    await currentChannel.deletePoll(poll.id);
  }

  const openDeleteOptionForm = () => {
    setShowDeleteOptionsForm(true);
    setDropdownOptions(!dropdownOptions);
  };

  async function deleteOption(e) {
    e.preventDefault();
    var checkboxes = document.getElementsByName("option-to-delete");
    var results = [];
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        results.push(checkboxes[i].id);
      }
    }
    results.map(async (optionId) => {
      let optionIdInteger = parseInt(optionId);
      await currentChannel.deletePollOption(poll.id, optionIdInteger);
    });
    updateUserMessage(currentChannel, message.messageId)
      .then((message) => {
        console.log("Message update=", message);
      })
      .catch((error) => {
        console.log("error=", error);
      });
    setShowDeleteOptionsForm(false);
  }

  async function updatePoll(e) {
    e.preventDefault();
    const updateParams = {
      title: messageText,
    };
    await currentChannel.updatePoll(poll.id, updateParams);
    const userMessageParams = {};
    userMessageParams.message = messageText;
    updateUserMessage(currentChannel, message.messageId, userMessageParams)
      .then((message) => {
        console.log("Message update=", message);
      })
      .catch((error) => {
        console.log("error=", error);
      });
    setDropdownOptions(!dropdownOptions);
    changeMessageText("");
    setShowForm(false);
  }

  async function handleOptionsSubmit(e) {
    e.preventDefault();
    await currentChannel.addPollOption(poll.id, optionsValue);
    updateUserMessage(currentChannel, message.messageId)
      .then((message) => {
        console.log("Message update=", message);
      })
      .catch((error) => {
        console.log("error=", error);
      });
    setShowOptionsForm(false);
    setOptionsValue("");
  }

  async function getVoters(messageId, pollId, updatedVoteCounts, message) {
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
    setUpdatedMsg(pollData);
    console.log("Poll Data AFTER RESETTING TO NEW VOTE=", pollData);
  }

  async function handleVote(e) {
    e.preventDefault();
    let optionTitleClicked = e.target.innerText;
    let option = poll.options.find(
      (option) => option.text === optionTitleClicked
    );
    let pollOptionId = option.id;
    let newVoteCount = option.voteCount + 1;
    const updatedVoteCounts = {
      voteCount: newVoteCount,
      optionId: pollOptionId,
    };
    let pollOptionIds = [pollOptionId];
    let pollId = poll.id;
    let ts = Date.now();
    let messageId = message.id;
    const pollVoteEventPayload = {
      updatedVoteCounts,
      ts,
      pollId,
      messageId,
    };
    let pollEvent = new PollVoteEvent(pollId, messageId, pollVoteEventPayload);
    if (!poll.votedPollOptionIds.includes(pollOptionId)) {
      await currentChannel
        .votePoll(pollId, pollOptionIds, pollEvent)
        .then(async (e) => {
          console.log("Vote Poll Event =", e);
          poll.applyPollVoteEvent(e); //updates the Poll's voted_option_id
          let messageId = e.messageId;
          let channelType = e._payload.channel_type;
          pollData[messageId] = undefined;
          const params = {
            messageId: messageId,
            channelType: channelType,
            channelUrl: currentChannel.url,
          };
          const updatedMessage = await sb.message.getMessage(params);
          setMessageUpdate(updatedMessage);
          message._poll.options = updatedMessage._poll.options;
          console.log("set in poll msg =", message._poll.options);
          let updatedVoteCounts = e._payload.updated_vote_counts;
          getVoters(messageId, pollId, updatedVoteCounts, message);
        });
    }
  }

  return (
    <div className="voting-message">
      <Card>
        <CardHeader
          avatar={
            message.sender ? (
              <Avatar alt="Us" src={message.sender.plainProfileUrl} />
            ) : (
              <Avatar className="user-message__avatar">Us</Avatar>
            )
          }
          title={
            message.sender
              ? message.sender.nickname || message.sender.userId
              : "(No name)"
          }
        />
        <CardContent>
          {
            <Typography variant="body2" component="div">
              {message.message}
              {!showOptionsForm && (
                <div>
                  <button onClick={toggleOptionsForm} id="add-options-btn">
                    + Add Option
                  </button>
                </div>
              )}
              {showOptionsForm && (
                <div id="option-form">
                  <form onSubmit={(e) => handleOptionsSubmit(e)}>
                    <label htmlFor="question" id="option-header">
                      Option:
                    </label>
                    <br></br>
                    <input
                      type="text"
                      id="option-input"
                      name="option"
                      value={optionsValue}
                      onChange={(e) => {
                        setOptionsValue(e.target.value);
                      }}
                    />
                    <br></br>
                    <input
                      type="submit"
                      value="Submit"
                      id="option-submit-btn"
                    />
                    <button onClick={toggleOptionsForm} id="option-cancel-btn">
                      Cancel
                    </button>
                  </form>
                </div>
              )}
              {poll.options &&
                poll.options.map(function (option) {
                  style = { backgroundColor: "white", color: "#6210cc" };
                  let msgId = poll.messageId;
                  if (updatedMsg && updatedMsg[msgId]) {
                    if (
                      updatedMsg[msgId][option.id] &&
                      updatedMsg[msgId][option.id].voters !== undefined
                    ) {
                      let voters = updatedMsg[msgId][option.id].voters;
                      let currentUserVoted = voters.some(
                        (voter) => voter.userId === userId
                      );
                      if (currentUserVoted) {
                        style = { backgroundColor: "#6210cc", color: "white" };
                      }
                    }
                  }

                  return (
                    <div id="options-wrapper" key={option.id}>
                      <h4 id="option-title">
                        {option.text}{" "}
                        <p id="option-vote-count">{option.voteCount}</p>
                      </h4>
                      <button
                        onClick={(e) => handleVote(e)}
                        id="vote-btn"
                        className={option.id}
                        style={style}
                      >
                        {option.text}
                      </button>
                    </div>
                  );
                })}
            </Typography>
          }
          {showForm && (
            <UpdatePollForm
              messageText={messageText}
              changeMessageText={changeMessageText}
              submitPoll={updatePoll}
              setShowForm={setShowForm}
            />
          )}
          {showDeleteOptionsForm && (
            <DeleteOptionForm
              setShowDeleteOptionsForm={setShowDeleteOptionsForm}
              deleteOption={deleteOption}
              poll={poll}
            />
          )}
        </CardContent>
        <button className="user-message__options-btn" onClick={openDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <path
              className="icon-more_svg__fill"
              d="M32 45.333a5.333 5.333 0 110 10.666 5.333 5.333 0 010-10.666zM32 28a5.333 5.333 0 110 10.668A5.333 5.333 0 0132 28zm0-17.333c2.946 0 5.333 2.387 5.333 5.333S34.946 21.333 32 21.333 26.667 18.946 26.667 16s2.387-5.333 5.333-5.333z"
              fill="#000"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
        {dropdownOptions && !showForm && (
          <div className="message-options-wrap">
            <ul className="sendbird_dropdown_menu">
              {message.sender && message.sender.userId === userId && (
                <div>
                  <li
                    className="dropdown__menu-item"
                    onClick={renderQuestionForm}
                  >
                    <span className="dropdown__menu-item-text">
                      Change poll
                    </span>
                  </li>
                  <li
                    className="dropdown__menu-item"
                    onClick={openDeleteOptionForm}
                  >
                    <span className="dropdown__menu-item-text">
                      Delete option
                    </span>
                  </li>

                  <li className="dropdown__menu-item" onClick={deletePoll}>
                    <span className="dropdown__menu-item-text">
                      Delete poll
                    </span>
                  </li>
                </div>
              )}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
