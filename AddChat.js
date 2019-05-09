import React from 'react';
import db from "./Database.js";
import { View, Text, Picker, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Button} from 'react-native-elements';

export default class AddChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: false,
      lang: this.props.navigation.getParam('lang', "en"),
      users: [],
      name: this.props.navigation.getParam('name', "None"),
      photoURL: this.props.navigation.getParam('photoURL', "None"),
    }

  }

  componentWillMount(){

    db.database().ref('users').once('value')
    .then((snap)=>{
      this.setState({users: Object.entries(snap.val())});
    });
  }

  async createChat(dest) {
    let chats = db.database().ref().child('chats');
    let chatRoom = chats.push();
    let destLang = "en";
    let destName = "";
    let destPhoto = "";

    await db.database().ref('users/' + dest).once('value')
      .then((snap) => {
        destLang = snap.child("language").val();
        destName = snap.child("name").val()
      })
      .catch((e) => throw new Error (e));


    await db.database().ref('users/' + dest).child('chats')
      .push({key: chatRoom.key, role: "out", partner: this.state.name, partnerPhoto: this.state.photoURL });

    await db.database().ref('users/' + this.state.uid).child('chats')
      .push({key: chatRoom.key, role: "in", partner: destName, partnerPhoto: destPhoto});


    console.log(chatRoom);
    return {chat: chatRoom, destLang: destLang};

  }



  render() {
    const { users, loading, uid, lang, chats, role, name, photoURL} = this.state;
    return(
      <View style={styles.view}>

        {!loading &&
          users.filter(user=>user[0]!=uid).map((user) => (
            <Button
              key={user[0]}
              title={user[1]["name"]}
              onPress={async () => {
                const retObj = await this.createChat.bind(this)(user[0])
                const chatRoom = retObj.chat;
                const destLang = retObj.destLang;
                const destName = retObj.destName;

                this.props.navigation.navigate('Chat', {
                  uid: uid,
                  chatRoom: chatRoom,
                  newChat: true,
                  dest: user[0],
                  lang: lang,
                  destLang: destLang,
                  role: "in",
                  name: name,
                  photoURL: photoURL
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
