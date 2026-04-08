import "./App.css";
import React from "react";
import SendBirdProvider from "@sendbird/uikit-react/SendbirdProvider";
import "@sendbird/uikit-react/dist/index.css";
import CustomizedApp from "./CustomizedApp.jsx";
import SendbirdChat from "@sendbird/chat";
import { GroupChannelModule } from "@sendbird/chat/groupChannel";

export default function App() {
  const APP_ID = import.meta.env.VITE_APP_ID;
  const USER_ID = import.meta.env.VITE_USER_ID;
  const NICKNAME = import.meta.env.VITE_NICKNAME;
  const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

  const sb = SendbirdChat.init({
    appId: APP_ID,
    modules: [new GroupChannelModule()
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
