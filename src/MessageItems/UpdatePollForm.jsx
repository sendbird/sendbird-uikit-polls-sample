import React from "react";
import "./add-poll.css";

export default function UpdatePollForm({
  messageText,
  setMessageText,
  updatePoll,
  setShowForm
}) {
  return (
    <div className="bg-modal" style={{'display': 'flex'}}>
      <div className="modal-content update-form">
        <div className="add_suggested_task_close_btn"   onClick={() => setShowForm(false)} >+</div>
        <h3 id="update-form-title">Change poll title:</h3>
        <form id="update-form" onSubmit={(e) => {updatePoll(e)}}>
          <input
            type="text"
            id="suggestion_form_input"
            placeholder="Poll question"
            value={messageText}
            onChange={(event) => {
              setMessageText(event.target.value);
            }}
          ></input>
          <button id="add_suggested_task_save_btn">Submit</button>
        </form>
      </div>
    </div>
  );
};