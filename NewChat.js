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
      key: ""
    }
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


              //Create chatroom
              let chats = db.database().ref().child('chats');
              let baseRoom = chats.push();
              let baseRoomKey = baseRoom.key;
              this.setState({key: baseRoomKey});

              baseRoom.set({
                userMsgs: {
                  _id: 1,
                  text: this.state.msg,
                  user: {
                    _id: 1
                  }
                },
                destMsgs: {
                  _id: 1,
                  text: this.state.transMsg,
                  user: {
                    _id: 2
                  }
                },
              });


              //Add chatroom for user
              db.database().ref('users/' + this.state.uid).child('chatrooms').push(
                {
                  roomKey: baseRoomKey,
                  role: "user",
                  receive: this.state.dest
                }
              )

              //Add chatroom for destination
              db.database().ref('users/' + this.state.dest).child('chatrooms').push(
                {
                  roomKey: baseRoomKey,
                  role: "dest",
                  receive: this.state.uid
                }
              )



          })
          .catch(e=>console.log(e));

          console.log("key");
          console.log(this.state.key);
          this.props.navigation.navigate("Chat", {role: "user", key: this.state.key, chat: [{
            _id: 1,
            text: this.state.msg,
            user: {
              _id: 1
            }
          }]})

        }  else {
          console.log("User id invalid")
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
