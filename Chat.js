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
} from 'react-native';
import { FileSystem, Permissions, Audio } from 'expo';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';


const RecordIcon = (props) => {
  const iconName = props.recording ? "microphone-slash" : "microphone";

  return <FontAwesome name={iconName} size={40} color={props.color} onPress={props.onPress}/>;
};
const io = require('socket.io-client');
//import { AudioRecorder, AudioUtils } from 'react-native-audio';

//let audioPath = AudioUtils.DocumentDirectoryPath + '/test.aac';

const SocketEndpoint = 'http://140.233.167.236:3000';

//console.ignoredYellowBox = ['Remote debugger'];
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);

import db from "./Database.js";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: true,
      chat: [],
      chatRoom: this.props.navigation.getParam('chatRoom', undefined),
      inlang: "en",
      outlang: "es",
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
    }

  }

  componentWillUnmount(){
    this.mounted = false;
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));
    this.state.socket.emit('textMessage', {inlang: this.state.inlang, outlang: this.state.outlang, text: messages[0]});
  }


  componentDidMount() {

    Permissions.askAsync(Permissions.AUDIO_RECORDING);
    Audio.setIsEnabledAsync(true);
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    })
    // Audio.setAudioModeAsync({
    //
    //
    // });

    this.mounted = true;
    const socket = io(SocketEndpoint, {
      transports: ['websocket'],
    });

    this.setState({socket: socket});

    socket.on('connect', () => {
      if(this.mounted === true){
        this.setState({isConnected: true});
        console.log('connected');
      }
    });

    socket.on('textMessage', (msg) => {
      if(this.mounted === true){
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages,{_id: previousState.messages.length, text: msg, user: {_id: 2, name: "React", avatar: "https://placeimg.com/140/140/any"}})
        }));
      }
    });
    

    socket.on('voiceMessage', async (base64Data) => {
      console.log(base64Data);

      const outputPath = FileSystem.documentDirectory+'translation.mp3';
      FileSystem.writeAsStringAsync(outputPath, base64Data, {encoding: FileSystem.EncodingTypes.Base64});
      const translation = new Audio.Sound();
      console.log(translation)
      //await translation.loadAsync({uri: 'https://trans-lang.herokuapp.com/output.mp3'}, {shouldPlay: true}, true);
      await translation.loadAsync({uri: outputPath}, {shouldPlay: true}, true);
    });

    console.log("mount");
    console.log(this.state.key);
    let chat = db.database().ref('chats/' + this.state.chatRoom.key).on('value', function(snap) {
      console.log(snap);
    });
  }


  async _record(){
    if(!this.state.isRecording){
      const recording = this.state.recording;
      console.log(recording);
      try {
        console.log("about to prepare recording");
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
        }).catch((err) => {console.log(err)});
        await recording.setOnRecordingStatusUpdate((s)=>console.log(s));
        console.log(recording);
        await recording.startAsync()
          .then(()=>{
            this.setState({isRecording: true});
            console.log("recording");
          })
          .catch(error=>{
            console.log(error)
            this._cancelRecording.bind(this);
          });
      } catch  (error) {
          console.log(error);
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
      console.log(recording.getURI());
      recording.createNewLoadedSoundAsync()
      .then(async (info) => {
        info.sound.setStatusAsync({volume:1.0})
        console.log(info.sound);
        console.log("Sound Status", info.status);
        info.sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);

        this.setState({inputSound: info.sound});

        
        this.setState(previousState => ({
          messages: GiftedChat.append(previousState.messages, {
            _id: previousState.messages.length, 
            audio: true, 
            user: {
              _id: 1, 
            }
          })
        }));

      })
      .catch(e=>console.log(e));

      this.setState({
        isRecording: false,
        recording: (new Audio.Recording()),
      });
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

      console.log(body);
      console.log(FileSystem.cacheDirectory);

      FileSystem.readAsStringAsync(soundFile.uri, {encoding: FileSystem.EncodingTypes.Base64}).then((s) => {
        this.state.socket.binary(true).emit('voiceMessage', Object.assign(soundFile, {data: s, inlang: this.state.inlang, outlang: this.state.outlang}));
      });

    })
    .catch(e=>console.log(e));
  }

  async _playSound(sound){
    if(this.state.isPlayingInput){
      this._stopSound(sound);
    }
    else{
      try{
        await sound.playAsync()
        .then(this.setState({isPlayingInput: true}))
        .catch(e=>console.log(e));
      }
      catch(err){
        console.log(err)
      }
    }
  }

  async _stopSound(sound){
      try{
        await sound.stopAsync()
        .then(this.setState({isPlayingInput: false}))
        .catch(e=>console.log(e));
      }
      catch(err){
        console.log(err)
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
          left: 90,
          position: "relative",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          backgroundColor: "transparent"
        }}
        onPress={() => {
          this._playSound.bind(this)(this.state.inputSound)
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


  async pushMessage(chatroom, message){
    const messageRef = chatroom.push();
    messageRef.set(message);
    const messageKey = messageRef.key;
  }

  render() {
    const { inlang, outlang, speech } = this.state;

    console.log(this.state.messages);
    return (

      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        renderBubble={this.renderBubble}
        user={{
          _id: 1
        }}
        renderActions={()=>{
          return(
            <RecordIcon color="red" recording={this.state.isRecording} 
              onPress={this._record.bind(this)}
            />
          );
        }}
      />
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
    //fontFamily: 'Times New Roman',
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 26,
    //fontFamily: 'Times New Roman',
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
