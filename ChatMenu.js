import React from 'react';
import db from "./Database.js";
import { View, Text, Picker, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Button} from 'react-native-elements';

export default class ChatMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: false,
      chats: [],
      lang: this.props.navigation.getParam('lang', "en"),
      users: [],
      role: ""
    }

  }

  componentWillMount(){
    db.database().ref('users').once('value')
    .then((snap)=>{
      console.log(Object.keys(snap.val()));
      this.setState({users: Object.keys(snap.val())});
    });

    db.database().ref('users/' + this.state.uid + '/chats').once('value')
    .then((snap)=>{
      console.log(snap.val());
      console.log(Object.values(snap.val()));
      this.setState({chats: Object.values(snap.val())});
    });


  }

  async createChat(dest) {
    let chats = db.database().ref().child('chats');
    let chatRoom = chats.push();
    console.log("chatroom reted");
    console.log(chatRoom.key);


    await db.database().ref('users/' + dest).child('chats')
      .push({key: chatRoom.key, role: "out"});

    await db.database().ref('users/' + this.state.uid).child('chats')
      .push({key: chatRoom.key, role: "in"});

    let destLang = "en";
    db.database().ref('users/' + dest).once('value')
      .then((snap) => {
        destLang = snap.child("language").val();
      })
      .catch((e) => console.log(e));

    return {chat: chatRoom, destLang: destLang};

  }

  async enterChat(chatKey, chatRole) {
    const chatRoom = db.database().ref('chats/' + chatKey);
    let destLang = "";
    db.database().ref('chats/' + chatKey).once('value')
    .then((snap)=>{
      let msg = Object.values(snap.val())[0];
      if (chatRole === "in") {
        destLang = msg.outlang;
      } else {
        destLang = msg.inlang;
      }
    });
    return {chat: chatRoom, destLang: destLang};
  }


  render() {
    const { users, loading, uid, lang, chats, role } = this.state;
    return(
      <View style={styles.view}>
        {!loading &&
          users.filter(userId=>userId!=uid).map((userId) => (
            <Button
              title={userId}
              onPress={async () => {
                const retObj = await this.createChat.bind(this)(userId)
                const chatRoom = retObj.chat;
                const destLang = retObj.destLang;
                console.log("navigate", chatRoom);

                this.props.navigation.navigate('Chat', {
                  uid: uid,
                  chatRoom: chatRoom,
                  newChat: true,
                  dest: userId,
                  lang: lang,
                  destLang: destLang,
                  role: "in"
                });
              }}
            >
            </Button>
          ))
        }

        {!loading &&

          chats.map(chat => (
            <Button
              title={chat.key}
              onPress={async () => {
                const retObj = await this.enterChat.bind(this)(chat.key, chat.role)
                const chatRoom = retObj.chat;
                const destLang = retObj.destLang;
                console.log("navigate", chatRoom);

                this.props.navigation.navigate('Chat', {
                  uid: uid,
                  chatRoom: chatRoom,
                  lang: lang,
                  destLang: destLang,
                  role: role,
                  newChat: true,
                });
              }}
            >
            </Button>
          ))

        }

        {loading && <Button loading={true}></Button>}
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
 blueStyle: {
   alignItems: 'center',
   borderWidth: 0.5,
   borderColor: '#fff',
   height: 50,
   width: 300,
   borderRadius: 5,
   margin: 5,
   backgroundColor: '#4267b2',
   justifyContent: 'center',
 },
});
