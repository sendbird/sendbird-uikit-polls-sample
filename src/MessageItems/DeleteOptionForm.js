import React from "react";
import "./add-poll.css";

export default function DeleteOptionForm({
  setShowDeleteOptionsForm,
  deleteOption,
  poll,
}) {
  return (
    <div className="bg-modal" style={{ display: "flex" }}>
      <div className="modal-content option-form">
        <div
          className="delete_option_form_close_btn"
          onClick={() => setShowDeleteOptionsForm(false)}
        >
          +
        </div>
        <h3 id="option-delete-form-title">Delete option:</h3>
        <form
          onSubmit={(e) => {
            deleteOption(e);
          }}
        >
          {poll.options.map(function (option) {
            return (
              <div id="option-wrap" key={option.id}>
                <input
                  type="checkbox"
                  id={option.id}
                  name="option-to-delete"
                  value={option.text}
                />
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            );
          })}
          <button id="delete-option-submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}
