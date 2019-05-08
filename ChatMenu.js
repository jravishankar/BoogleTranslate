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
    }

  }

  componentWillMount(){
    db.database().ref('users').once('value')
    .then((snap)=>{
      console.log(Object.keys(snap.val()));
      this.setState({users: Object.keys(snap.val())});
    });
  }

  componentDidMount() {
    //
    // db.database().ref('users/' + this.state.uid + "/chats").on('value', (snap) => {
    //   console.log("listening");
    //   console.log(snap);
    //   const chats = snap.child("chats").val()
    //   this.setState({loading: false, chats: chats});
    // });


  }
  async createChat(dest) {
    let chats = db.database().ref().child('chats');
    let chatRoom = chats.push();
    console.log(chatRoom.key);


    await db.database().ref('users/' + dest).child('chats')
      .push(chatRoom.key);

    await db.database().ref('users/' + this.state.uid).child('chats')
      .push(chatRoom.key);

    return chatRoom;
  }


  render() {
    const { users, loading, uid } = this.state;
    return(
      <View style={styles.view}>
        {!loading && 
          users.filter(userId=>userId!=uid).map((userId) => (
            <Button 
              title={userId}
              onPress={async () => {
                const chatRoom = await this.createChat.bind(this)(userId)

                console.log("navigate", chatRoom);

                this.props.navigation.navigate('Chat', {
                  uid: uid, 
                  chatRoom: chatRoom,
                  newChat: true,
                  dest: userId,
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
