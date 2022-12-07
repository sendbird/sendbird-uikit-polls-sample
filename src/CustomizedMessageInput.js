import React, { useState } from "react";
import {
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import AddPoll from "./MessageItems/AddPoll";
import useSendbirdStateContext from "@sendbird/uikit-react/useSendbirdStateContext";
import sendbirdSelectors from "@sendbird/uikit-react/sendbirdSelectors";
import { useChannelContext } from "@sendbird/uikit-react/Channel/context";

function CustomizedMessageInput({ appId, sb }) {
  const store = useSendbirdStateContext();
  const sendUserMessage = sendbirdSelectors.getSendUserMessage(store);
  const sendFileMessage = sendbirdSelectors.getSendFileMessage(store);
  const channelStore = useChannelContext();
  const channel = channelStore?.currentGroupChannel;
  const disabled = channelStore?.disabled;
  const [inputText, setInputText] = useState("");
  const [formText, setFormText] = useState("");
  const [optionTextA, setOptionTextA] = useState("");
  const [optionTextB, setOptionTextB] = useState("");
  const [optionTextC, setOptionTextC] = useState("");

  const [showTaskForm, setShowTaskForm] = useState("");
  const isInputEmpty = inputText.length < 1;

  const handleChange = (event) => {
    if (event?.target?.value?.startsWith(`/poll `)) {
      setInputText("");
      setShowTaskForm(true);
    } else {
      setInputText(event.target.value);
    }
  };

  const sendFileMessage_ = (event) => {
    if (event.target.files && event.target.files[0]) {
      console.log(event.target.files[0]);
      if (event.target.files[0].size > 1 * 1000 * 1000) {
        alert("Image size greater than 1 MB");
        return;
      }

      const params = {};
      params.file = event.target.files[0];

      sendFileMessage(channel, params)
        .onSucceeded((message) => {
          console.log(message);
          event.target.value = "";
        })
        .onFailed((error) => {
          console.log(error.stack);
        });
    }
  };

  const checkSendUserMessage_ = (event) => {
    if (showTaskForm) {
      submitPoll(event);
    } else {
      const params = {};
      params.message = inputText;
      sendUserMessage(channel, params)
        .onSucceeded((message) => {
          // console.log(message);
          setInputText("");
        })
        .onFailed((error) => {
          console.log(error.message);
        });
    }
  };

  async function submitPoll(event) {
    event.preventDefault();
    let options = [];
    if (optionTextA !== "") {
      options.push(optionTextA);
    }
    if (optionTextB !== "") {
      options.push(optionTextB);
    }
    if (optionTextC !== "") {
      options.push(optionTextC);
    }
    const params = {
      title: formText,
      optionTexts: options,
      allowUserSuggestion: true,
    };
    const myPoll = await sb.poll.create(params);
    const userMessageParams = {};
    userMessageParams.message = myPoll.title;
    userMessageParams.pollId = myPoll.id;
    sendUserMessage(channel, userMessageParams)
      .onSucceeded((message) => {
        console.log("Message=", message);
        console.log("Poll created in message sent=", myPoll);
        setInputText("");
      })
      .onFailed((error) => {
        console.log(error.message);
      });
    setOptionTextA("");
    setOptionTextB("");
    setOptionTextC("");
    setFormText("");
    setShowTaskForm(false);
  }

  return (
    <div className="customized-message-input">
      {showTaskForm && (
        <AddPoll
          messageText={formText}
          changeMessageText={setFormText}
          submitPoll={submitPoll}
          setShowForm={setShowTaskForm}
          onClose={() => {
            setShowTaskForm(false);
          }}
          // optionText={optionText}
          // setOptionText={setOptionText}
          setOptionTextA={setOptionTextA}
          setOptionTextB={setOptionTextB}
          setOptionTextC={setOptionTextC}
          optionTextA={optionTextA}
          optionTextB={optionTextB}
          optionTextC={optionTextC}
        />
      )}
      <FormControl variant="outlined" disabled={disabled} fullWidth>
        <InputLabel htmlFor="customized-message-input">User Message</InputLabel>
        <OutlinedInput
          id="customized-message-input"
          type="txt"
          value={inputText}
          onChange={handleChange}
          onKeyPress={(event) => {
            if (event.code === "Enter") {
              checkSendUserMessage_();
            }
          }}
          labelwidth={105}
          endAdornment={
            <InputAdornment position="end">
              {isInputEmpty ? (
                <div className="customized-message-input__file-container">
                  <input
                    accept="image/*"
                    id="icon-button-file"
                    type="file"
                    className={"display: none"}
                    onChange={sendFileMessage_}
                  />
                  <label htmlFor="icon-button-file">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      disabled={disabled}
                    >
                      <AttachFileIcon
                        color={disabled ? "disabled" : "primary"}
                      />
                    </IconButton>
                  </label>
                </div>
              ) : (
                <IconButton disabled={disabled} onClick={checkSendUserMessage_}>
                  <SendIcon color={disabled ? "disabled" : "primary"} />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
      </FormControl>
    </div>
  );
}

export default CustomizedMessageInput;
