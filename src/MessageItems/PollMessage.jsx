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
import GroupChannelHandler from "@sendbird/uikit-react/handlers/GroupChannelHandler";

export default function PollMessage(props) {
  const { message, userId, updateUserMessage, currentChannel, sb } = props;
  const [messageText, changeMessageText] = useState(message.message);
  const [dropdownOptions, setDropdownOptions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showOptionsForm, setShowOptionsForm] = useState(false);
  const [showDeleteOptionsForm, setShowDeleteOptionsForm] = useState(false);
  const [optionsValue, setOptionsValue] = useState("");
  const [pollData, setPollData] = useState([]);
  let style = {};
  let poll = message._poll;

  //want to download voters who voted for each option in THIS msg
  if (pollData.length === 0) {
    // console.log('initial poll data is 0')
    async function getOptions() {
      // console.log('polls options',message._poll.options)
      for (const option of message._poll.options) {
        let optionId = option.id;
        const query = currentChannel.createPollVoterListQuery(
          message._poll.id,
          optionId
        );
        const voters = await query.next();
        pollData[optionId] = {
          voters: voters,
          vote_count: voters.length,
        };
      }
      // console.log('1.pollData after looping thru options =', pollData)
    }
    getOptions();
    //  console.log('2.pollData after getOptions() =', pollData)
  }
  // console.log(`IM BEING RENDERED; mssgId = ${message.messageId}`, pollData);
  console.log('poll=', poll)

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
      console.log('option to delete=', optionIdInteger)
      await currentChannel.deletePollOption(poll.id, optionIdInteger);
    });
    setShowDeleteOptionsForm(false);
  }

  async function updatePoll(e) {
    e.preventDefault();
    const updateParams = {
      title: messageText,
      allowUserSuggestion: true,
    };
    await currentChannel.updatePoll(poll.id, updateParams)
    .then((poll) => {
      console.log("Poll updated=", poll);
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
    await currentChannel
      .addPollOption(poll.id, optionsValue)
      .then((poll) => {
        console.log("Poll option added=", poll);
      })
      .catch((error) => {
        console.log("error=", error);
      });
    setShowOptionsForm(false);
    setOptionsValue("");
  }

  async function getVoters(pollId, updatedVoteCounts) {
    let optionIds = updatedVoteCounts.map((option) => {
      return option.option_id;
    });
    console.log("B: in getVoters, optionIds=", optionIds);
    console.log("C: pollData is=", pollData);
    for (const optionId of optionIds) {
      console.log("D: option from optionIds= ", optionId);
      if (pollData[optionId]) {
        console.log("E: poll has option");
        const query = currentChannel.createPollVoterListQuery(pollId, optionId);
        const voters = await query.next();
        pollData[optionId] = {
          voters: voters,
          vote_count: voters.length,
        };
      }
    }
    //pollData correctly updates the 2 options where votes changed
    console.log("F:pollData after updating voteCounts=", pollData);
    //has to update the message with the changes to reflect on UI for other users
    // updateUserMessage(currentChannel, message.messageId)
    //   .then((message) => {
    //     console.log("Message update=", message);
    //   })
    //   .catch((error) => {
    //     console.log("error=", error);
    //   });
    //console.log("Poll Data AFTER getVoters=", pollData);
    console.log("G:msg options after getVoters=", message._poll.options);
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
          console.log("1.Vote Poll Event =", e);
          poll.applyPollVoteEvent(e);
          let updatedVoteCounts = e._payload.updated_vote_counts;
          setPollData([]);
          let optionIds = updatedVoteCounts.map((option) => {
            return option.option_id;
          });
          for (const optionId of optionIds) {
            const query = currentChannel.createPollVoterListQuery(
              pollId,
              optionId
            );
            const voters = await query.next();
            pollData[optionId] = {
              voters: voters,
              vote_count: voters.length,
            };
          }
        });
    }
  }

  let UNIQUE_HANDLER_ID = `${message.messageId}`;
  const groupChannelHandler = new GroupChannelHandler();
  sb.groupChannel.addGroupChannelHandler(
    UNIQUE_HANDLER_ID,
    groupChannelHandler
  );

  groupChannelHandler.onPollVoted = async (channel, event) => {
    console.log("A: onPollVoted event=", event);
    let pollId = event.pollId;
    let updatedVoteCounts = event._payload.updated_vote_counts;
    getVoters(pollId, updatedVoteCounts);
  };

  groupChannelHandler.onPollUpdated = async(channel, event)=> {
    console.log('onPollUpdated event=', event)
    console.log('POLLLLL=',poll)
    //update rendered message by applying poll update event:
    poll.applyPollUpdateEvent(event); //works when adding option BUT does not work when deleting option OR updatePoll (UI does not change for deleting)
  }
  
  //onPollDelete
 
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
              {message._poll.title}
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
              {message._poll.options &&
                message._poll.options.map(function (option) {
                  style = { backgroundColor: "white", color: "#6210cc" };

                  if (
                    pollData[option.id] &&
                    pollData[option.id].voters.length !== 0
                  ) {
                    console.log(
                      "option has voters",
                      pollData[option.id].voters
                    );
                    let voters = pollData[option.id].voters;
                    console.log("option has voters, which are=", voters);
                    let currentUserVoted = voters.some(
                      (voter) => voter.userId === userId
                    );
                    console.log("Did current user vote=", currentUserVoted);
                    if (currentUserVoted) {
                      style = { backgroundColor: "#6210cc", color: "white" };
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
