import "./App.css";
import React from "react";
import SendBirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import "@sendbird/uikit-react/dist/index.css";
import CustomizedApp from "./CustomizedApp.js";
import SendbirdChat from "@sendbird/chat";
// import { PollModule } from "@sendbird/chat/poll";
import { GroupChannelModule } from "@sendbird/chat/groupChannel";

export default function App() {
  const APP_ID = process.env.REACT_APP_APP_ID;
  const USER_ID = process.env.REACT_APP_USER_ID;
  const NICKNAME = process.env.REACT_APP_NICKNAME;
  const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN;

  const sb = SendbirdChat.init({
    appId: APP_ID,
    modules: [new GroupChannelModule()
      //, new PollModule()
    ],
  });
  sb.connect(USER_ID, ACCESS_TOKEN);

  return (
    <div className="App">
      <SendBirdProvider
        appId={APP_ID}
        userId={USER_ID}
        nickname={NICKNAME}
        accessToken={ACCESS_TOKEN}
      >
        <CustomizedApp userId={USER_ID} sb={sb} />
      </SendBirdProvider>
    </div>
  );
}
