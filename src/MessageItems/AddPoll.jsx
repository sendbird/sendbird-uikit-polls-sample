import React from "react";
import "./add-poll.css";

export default function AddPoll({
  messageText,
  changeMessageText,
  submitPoll,
  setShowForm,
  setOptionTextA,
  setOptionTextB,
  setOptionTextC,
  optionTextA,
  optionTextB,
  optionTextC
}){
  return (
    <div className="bg-modal" style={{'display': 'flex'}}>
      <div className="modal-content">
        <div className="add_suggested_task_close_btn" onClick={() => setShowForm(false)} >+</div>
        <h3 id="suggestion-task-form-title">Create a poll:</h3>
        <form id="add-poll-form" onSubmit={(e) => {submitPoll(e)}}>
          <div id='input-wrapper'>
          <input
            type="text"
            id="suggestion_form_input"
            placeholder="Poll question"
            value={messageText}
            onChange={(event) => {
              changeMessageText(event.target.value);
            }}
          ></input>
          <label for="options" id="options-label">Options:</label>
          <input
            type="text"
            id="suggestion_form_input"
            value={optionTextA}
            onChange={(event) => {
              setOptionTextA(event.target.value);
            }}
          ></input>
           <input
            type="text"
            id="suggestion_form_input"
            value={optionTextB}
            onChange={(event) => {
              setOptionTextB(event.target.value);
            }}
          ></input>
           <input
            type="text"
            id="suggestion_form_input"
            value={optionTextC}
            onChange={(event) => {
              setOptionTextC(event.target.value);
            }}
          ></input>
          </div>
          <button id="add_suggested_task_save_btn">Submit</button>
        </form>
      </div>
    </div>
  );
};