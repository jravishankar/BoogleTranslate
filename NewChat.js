import React from 'react';
import {TextInput, View, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import db from "./Database.js";

export default class NewChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      dest: "",
      msg: "",
      transMsg: "",
      key: "",
      users: [],
    }
  }

  async pushMessage(chatroom, message){
    const messageRef = chatroom.push();
    messageRef.set(message);
    const messageKey = messageRef.key;

    //Add chatroom for user
    db.database().ref('users/' + message.to).child('chatrooms').push(
      chatroom.key
    )

    //Add chatroom for destination
    db.database().ref('users/' + message.from).child('chatrooms').push(
      chatroom.key
    )
  }
  async createChat() {
    db.database().ref('users/' + this.state.dest).once('value')
    .then((snap) => {
      if(snap.exists()) {
        const language = snap.child("language").val();
        const body = new FormData();
        body.append('inlang', this.state.lang1);
        body.append('outlang', language);
        body.append('text', this.state.msg);
        fetch('http://trans-lang.herokuapp.com/api/v2/translate-text', {
          method: 'POST',
          body: body,
        })
        .then((data)=>{
          const trans = data["_bodyText"];
          this.setState({transMsg: data["_bodyText"]});


          //Create Message
          const message = {
            to: this.state.dest,
            from: this.state.uid,
            inlang: "en",
            outlang: "es",
            inlangContent: this.state.msg,
            outlangContent: data,
          };
            

          //Create chatroom
          let chats = db.database().ref().child('chats');
          let baseRoom = chats.push();
          this.pushMessage(baseRoom, message);


        })
        .catch(e=>console.log(e));
      }
    })
    .catch((e) => console.log(e));
  }


  render() {

    return(
      <View style={styles.view}>
        <TextInput
         style={styles.input}
         placeholder="Type user id here!"
         editable = {true}
         onChangeText={(text) => this.setState({dest: text})}
         />
        <TextInput
         style={styles.input}
         placeholder="Type message here!"
         editable = {true}
         onChangeText={(text) => this.setState({msg: text})}
         />
         <Button onPress={() => this.createChat()}/>
       </View>
    )
  }

}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#abb7cc",
     justifyContent: "center",
     alignItems: "center"
 },
 input: {
   height: 50,
   width: 100
 }
});
