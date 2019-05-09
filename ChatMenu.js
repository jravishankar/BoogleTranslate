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
      role: "",
      name: this.props.navigation.getParam('name', "None"),
      photoURL: this.props.navigation.getParam('photoURL', "None"),
    }

  }

  componentWillMount(){

      db.database().ref('users/' + this.state.uid + '/chats').on('value', (snap)=>{
        if (snap.exists()) {
          this.setState({chats: Object.values(snap.val())});
        }
      });

  };

  async enterChat(chatKey, chatRole) {
    const chatRoom = db.database().ref('chats/' + chatKey);
    let destLang = "";
    await db.database().ref('chats/' + chatKey).once('value')
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
    const { users, loading, uid, lang, chats, role, name, photoURL } = this.state;

    return(
      <View style={styles.view}>
        {!loading && <Button
                      onPress={() => this.props.navigation.navigate('AddChat', {uid: uid, lang: lang, name: name, photoURL: photoURL})}
                      title= "New Chat"
                      >
                      </Button>}

        {!loading &&

          chats.map(chat => (
            <Button
              key={chat.key}
              title={chat.partner}
              onPress={async () => {
                const retObj = await this.enterChat.bind(this)(chat.key, chat.role)
                const chatRoom = retObj.chat;
                const destLang = retObj.destLang;

                console.log("navigate to Chat");
                this.props.navigation.navigate('Chat', {
                  uid: uid,
                  chatRoom: chatRoom,
                  lang: lang,
                  destLang: destLang,
                  role: role,
                  newChat: true,
                  photoURL: photoURL,
                  name: name
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
