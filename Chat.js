import React from 'react';
import { GiftedChat } from "react-native-gifted-chat";
import db from "./Database.js";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: true,
      chat: [],
      chatRoom: this.props.navigation.getParam('chatRoom', undefined),
    }

  }

  componentDidMount() {
    console.log("mount");
    console.log(this.state.key);
    let chat = db.database().ref('chats/' + this.state.chatRoom.key).on('value', function(snap) {
      console.log(snap);
    });
  }

  async pushMessage(chatroom, message){
    const messageRef = chatroom.push();
    messageRef.set(message);
    const messageKey = messageRef.key;
  }



  render() {
    return(
      <GiftedChat
         messages={this.state.chat}
         onSend={messages => this.onSend(messages)}
         user={{
           _id: 1
         }}
         renderSend={this.renderSend}

       />
    )
  }
}
