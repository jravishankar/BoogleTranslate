import React from 'react';
import { GiftedChat } from "react-native-gifted-chat";
import db from "./Database.js";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: true,
      chat: this.props.navigation.getParam('chat', []),
      key: this.props.navigation.getParam('key', []),
      role: this.props.navigation.getParam('role', "")
    }

  }

  componentDidMount() {
    console.log("mount");
    console.log(this.state.key);
    let chat = db.database().ref('chats/' + this.state.key).on('value', function(snap) {
    });
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
