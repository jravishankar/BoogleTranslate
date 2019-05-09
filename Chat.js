import React from 'react';
import {
  Button,
  View,
  Text,
  Picker,
  StyleSheet,
  TouchableOpacity,
  Image,
  List,
  ListItem,
  KeyboardAvoidingView
} from 'react-native';
import { FileSystem, Permissions, Audio } from 'expo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';


const RecordIcon = (props) => {
  const iconName = props.recording ? "microphone-slash" : "microphone";

  return <FontAwesome name={iconName} size={40} color={props.color} style={props.style} onPress={props.onPress}/>;
};
const io = require('socket.io-client');
//import { AudioRecorder, AudioUtils } from 'react-native-audio';

//let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

const SocketEndpoint = 'http://trans-lang.herokuapp.com';

console.disableYellowBox = true;
// console.ignoredYellowBox = ['Remote debugger'];
// import { YellowBox } from 'react-native';
// YellowBox.ignoreWarnings([
//     'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
// ]);

import db from "./Database.js";

const audioFolder = "voice/";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: true,
      chat: [],
      chatRoom: this.props.navigation.getParam('chatRoom', "None"),
      inlang: this.props.navigation.getParam('lang', "en"),
      outlang: this.props.navigation.getParam('destLang', "en"),
      speech: "es-US",
      isRecording: false,
      isPlayingInput: false,
      isPlayingTranslation: false,
      isBufferingInput: false,
      isBufferingTranslation: false,
      recording: new Audio.Recording(),
      inputSound: null,
      translatedSound: null,
      isConnected: false,
      data: null,
      socket: null,
      messages: [],
      newChat: this.props.navigation.getParam('newChat', false),
      name: this.props.navigation.getParam('name', "None"),
      photoURL: this.props.navigation.getParam('photoURL', "None"),
    };

    this.giftedMessage = this.giftedMessage.bind(this);

  }
  componentWillMount() {

    db.database().ref('chats/' + this.state.chatRoom.key).on('value', function(snap) {
      if(snap.exists()) {
        this.setState({messages: GiftedChat.append([], Object.values(snap.val()).map(this.giftedMessage))});
      }
    }.bind(this));
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onSend(messages = []) {
    this.state.socket.emit('textMessage', {inlang: this.state.inlang, outlang: this.state.outlang, text: messages[0]});
  }


  async pushMessage(message){
    console.log(message);
    console.log(this.state.chatRoom);

      const messageRef = await this.state.chatRoom.push().catch(e=>console.log(e));
      messageRef.set(message);
      console.log(messageRef);
      return messageRef;


  }

  giftedMessage(message){
    if(message.audio === true){
      return {
        _id: message.date,
        audio: true,
        audioData: this.state.inlang == message.inlang ? message.inlangAudio : message.outlangAudio,
        user: {
          _id: message.from,
          avatar: message.fromPhotoURL,
          name: message.fromName
        }
      };
    }
    else{
      return {
        _id: message.date,
        text: this.state.inlang == message.inlang ? message.inlangContent : message.outlangContent,
        user: {
          _id: message.from,
          avatar: message.fromPhotoURL,
          name: message.fromName
        }
      };
    }
  }

  componentDidMount() {

    Permissions.askAsync(Permissions.AUDIO_RECORDING);
    Audio.setIsEnabledAsync(true);
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });

    this.mounted = true;
    const socket = io(SocketEndpoint, {
      transports: ['websocket'],
    });

    this.setState({socket: socket});


    socket.on('connect', () => {
      if(this.mounted === true){
        this.setState({isConnected: true});
      }
    });

    socket.on('textMessage', async (response) => {
      if(this.mounted === true){
        var newMessage = Object.assign(response, {
          from: this.state.uid,
          fromName: this.state.name,
          fromPhotoURL: this.state.photoURL,
          date: (new Date()).getTime(),
          audio: false,
        });

        const msg = await this.pushMessage.bind(this)(newMessage);

      }
    });


    socket.on('voiceMessage', async (response) => {

      var newMessage = {
        from: this.state.uid,
        fromName: this.state.name,
        fromPhotoURL: this.state.photoURL,
        date: (new Date()).getTime(),
        audio: true,
        inlang: response.inlang,
        outlang: response.outlang,
        inlangAudio: response.inlangAudio,
        outlangAudio: response.outlangAudio,
      };

      const msg = await this.pushMessage.bind(this)(newMessage);
    });

  }

  async _record(){
    if(!this.state.isRecording){
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      })
      const recording = this.state.recording;
      try {
        await recording.prepareToRecordAsync({
          android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        }).catch((err) => {throw new Error (err)});
        await recording.setOnRecordingStatusUpdate((s)=>console.log(s));
        await recording.startAsync()
          .then(()=>{
            this.setState({isRecording: true});
          })
          .catch(error=>{
            throw new Error (error);
            this._cancelRecording.bind(this);
          });
      } catch  (error) {
          throw new Error (error);
      }
    }
    else{
      this._stopRecording();
    }
  }

  async _cancelRecording(){
    const recording = this.state.recording;
    recording.stopAndUnloadAsync()
    .then(()=>{
      this.setState({
        isRecording: false,
        recording: (new Audio.Recording()),
      });
    });

  }

  async _stopRecording(){
    const recording = this.state.recording;
    recording.stopAndUnloadAsync()
    .then(()=>{
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      })
      recording.createNewLoadedSoundAsync()
      .then(async (info) => {
        info.sound.setStatusAsync({volume:1.0})
        info.sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);

        this.setState({inputSound: info.sound});

        var filename = info.status.uri.split('/');
        var directory = filename[filename.length - 2];
        filename = filename[filename.length - 1];

        const soundUri = FileSystem.cacheDirectory+directory+"/"+filename;

        const newSoundPath = FileSystem.documentDirectory
          //+audioFolder+
          //+this.state.chatRoom.key
          +filename
        ;

        FileSystem.moveAsync({
          from: soundUri,
          to: newSoundPath
        })
        .then(() => this._sendSoundFromFile(newSoundPath))
        .catch(e=>throw new Error (e));

      })
      .catch(e=>throw new Error (e));

      this.setState({
        isRecording: false,
        recording: (new Audio.Recording()),
      });
    });

  }

  _sendSoundFromFile(soundUri){
    var filename = soundUri.split('/');
    var directory = filename[filename.length - 2];
    filename = filename[filename.length - 1];
    const soundFile = {
      uri: FileSystem.documentDirectory+directory+"/"+filename,
      name: filename,
      type: 'audio/wav',
    };

    FileSystem.readAsStringAsync(soundUri, {
      encoding: FileSystem.EncodingTypes.Base64
    }).then((s) => {
      this.state.socket.binary(true).emit('voiceMessage',
        Object.assign(soundFile, {
          data: s,
          inlang: this.state.inlang,
          outlang: this.state.outlang
        })
      );
    });
  }


  _sendSound(sound){
    sound.getStatusAsync()
    .then((status) => {
      var filename = status.uri.split('/');
      var directory = filename[filename.length - 2];
      filename = filename[filename.length - 1];
      const soundFile = {
        uri: FileSystem.cacheDirectory+directory+"/"+filename,
        name: filename,
        type: 'audio/wav',
      };

      const body = new FormData();
      body.append('inlang', this.state.inlang);
      body.append('outlang', this.state.outlang);
      body.append('speechInput', soundFile);

      FileSystem.readAsStringAsync(soundFile.uri, {encoding: FileSystem.EncodingTypes.Base64}).then((s) => {
        this.state.socket.binary(true).emit('voiceMessage', Object.assign(soundFile, {data: s, inlang: this.state.inlang, outlang: this.state.outlang}));
      });

    })
    .catch(e=>throw new Error (e));
  }

  async _playSound(sound){
    if(this.state.isPlayingInput){
      this._stopSound(sound);
    }
    else{
      try{
        await sound.playAsync()
        .then(this.setState({isPlayingInput: true}))
        .catch(e=>throw new Error (e));
      }
      catch(err){
        throw new Error (err)
      }
    }
  }

  async _playSoundFromBinary(binary){


    const uri = FileSystem.cacheDirectory+'audio.mp3';
    FileSystem.writeAsStringAsync(uri, binary, {
      encoding: FileSystem.EncodingTypes.Base64
    });



    if(this.state.isPlayingInput){
      this._stopSound(this.state.playingSound);
    }
    else{
      try{
        const sound = new Audio.Sound();
        await sound.loadAsync({uri: uri}, {shouldPlay: true}, true)
        .then(this.setState({isPlayingInput: true, playingSound: sound}))
        .catch(e=>throw new Error (e));
      }
      catch(err){
        throw new Error (err)
      }
    }
  }



  async _playSoundFromFile(soundFile){
    var filename = soundFile.split('/');
    var directory = filename[filename.length - 2];
    filename = filename[filename.length - 1];
    const soundInfo = {
      uri: FileSystem.documentDirectory+directory+"/"+filename,
      name: filename,
      type: 'audio/wav',
    };

    if(this.state.isPlayingInput){
      this._stopSound(this.state.playingSound);
    }
    else{
      try{
        const sound = new Audio.Sound();
        await sound.loadAsync({uri: soundInfo.uri}, {shouldPlay: true}, true)
        .then(this.setState({isPlayingInput: true, playingSound: sound}))
        .catch(e=>throw new Error (e));
      }
      catch(err){
        throw new Error (err)
      }
    }
  }


  async _stopSound(sound){
      try{
        await sound.stopAsync()
        .then(this.setState({isPlayingInput: false}))
        .catch(e=>throw new Error (e));
      }
      catch(err){
        throw new Error (err)
      }
  }

  _onPlaybackStatusUpdate = playbackStatus => {
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
        console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
      }
    } else {
      this.setState({
        isPlayingInput: playbackStatus.isPlaying,
        isBuffering: playbackStatus.isBuffering,
      });
    }
  };

  renderAudio = props => {
    return !props.currentMessage.audio ? (
      <View />
    ) : (
      <FontAwesome
        name="play"
        size={35}
        color={this.state.playAudio ? "red" : "blue"}
        style={{
          top: 35,
          left: 20,
          position: "relative",
          shadowColor: "#000",
          width: 50,
          height: 50,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          backgroundColor: "transparent"
        }}
        onPress={() => {
          this._playSoundFromBinary.bind(this)
            (props.currentMessage.audioData)
        }}
      />
    );
  };

  renderBubble = props => {
    return (
      <View>
        {this.renderAudio(props)}
        <Bubble {...props} />
      </View>
    );
  };


  render() {
    const { inlang, outlang, speech } = this.state;
    return (

      <KeyboardAvoidingView style={{flex: 1}}>
      <GiftedChat
        inverted={false}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        renderBubble={this.renderBubble}
        user={{
          _id: this.state.uid
        }}
        renderActions={()=>{
          return(
            <RecordIcon color="red" style={{left: 10}} recording={this.state.isRecording}
              onPress={this._record.bind(this)}
            />
          );
        }}
      />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',

  },

  picker: {
    marginTop: -20,
  },
  input: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 35,
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 26,
  },

  inout: {
    justifyContent: 'center',
  },
  blueStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 50,
    width: 100,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#485a96',
    justifyContent: 'center',
  },
  redStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 60,
    width: 110,
    borderRadius: 10,
    margin: 5,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  iconMic: {
    padding: 5,
    margin: 0,
    height: 50,
    width: 100,
  },
  iconPlay: {
    padding: 5,
    margin: 0,
    height: 50,
    width: 80,
  },
  iconSend: {
    padding: 5,
    margin: 0,
    height: 60,
    width: 75,
  },
  textStyle: {
   marginBottom: 4,
   marginRight: 20,
   textAlign: 'center',
   fontFamily: 'Times New Roman',
  },
  buttonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  SeparatorLine: {
    backgroundColor: '#fff',
    width: 1,
    height: 10,
  },
  playback: {
    marginBottom: 4,
    marginRight: 20,
    textAlign: 'center',
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    fontSize: 26,
    color: 'red',
  }
});
